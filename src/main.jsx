import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BadgeCheck,
  Bot,
  BrainCircuit,
  Camera,
  Check,
  ChevronRight,
  Clapperboard,
  Clock3,
  CreditCard,
  Filter,
  Headphones,
  MessageCircle,
  Menu,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Video,
  Wand2,
  X
} from 'lucide-react';
import './styles.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://backend-tobdigital.onrender.com';

const iconMap = {
  bot: Bot,
  video: Video,
  clapperboard: Clapperboard,
  wand: Wand2,
  sparkles: Sparkles,
  brain: BrainCircuit,
  camera: Camera
};

function assetUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
}

const categoryMeta = {
  'AI Tools': {
    icon: Bot,
    accent: '#2f7d6f',
    badge: 'AI',
    features: ['30-day warranty', 'Setup guide included', 'Email support'],
    delivery: 'Instant delivery'
  },
  'Video Editing': {
    icon: Video,
    accent: '#d55a3c',
    badge: 'Editing',
    features: ['Mobile and desktop', 'Replacement support', 'Private delivery'],
    delivery: 'Within 10 minutes'
  },
  Design: {
    icon: Wand2,
    accent: '#8a5a2d',
    badge: 'Design',
    features: ['Premium templates', 'Brand assets', 'Usage guide'],
    delivery: 'Instant delivery'
  },
  Creator: {
    icon: Sparkles,
    accent: '#4f6b9f',
    badge: 'Bundle',
    features: ['Creator tools', 'Setup support', 'Bundle warranty'],
    delivery: 'Manual setup'
  }
};

function hydrateProduct(product) {
  const meta = categoryMeta[product.category] || {
    icon: BadgeCheck,
    accent: '#6c5b7f',
    badge: 'Digital',
    features: ['Warranty included', 'Setup guide included', 'Support included'],
    delivery: 'Instant delivery'
  };

  const price = Number(product.price);
  const originalPrice = Number(product.original_price || 0);

  return {
    ...product,
    id: String(product.id),
    price,
    oldPrice: originalPrice > 0 ? originalPrice : Number((price * 1.45).toFixed(2)),
    stock: Number(product.stock || 0),
    rating: 4.8,
    description: product.description || 'Digital product access with private delivery and support.',
    ...meta,
    icon: iconMap[product.icon] || meta.icon,
    logoUrl: assetUrl(product.logo_url || '')
  };
}

const categories = ['All', 'AI Tools', 'Video Editing', 'Design', 'Creator'];

const heroTiles = [
  { label: 'AI Chat', icon: Bot, color: '#2f7d6f' },
  { label: 'CapCut', icon: Clapperboard, color: '#d55a3c' },
  { label: 'AI Model', icon: BrainCircuit, color: '#6c5b7f' },
  { label: 'Instagram', icon: Camera, color: '#c24f79' },
  { label: 'Creator', icon: Sparkles, color: '#4f6b9f' },
  { label: 'Support', icon: MessageCircle, color: '#8a5a2d' }
];

function App() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutContact, setCheckoutContact] = useState('');
  const [checkoutNote, setCheckoutNote] = useState('');

  const handleCheckout = () => {
    if (cartLines.length === 0) return;

    let messageText = `Hi, I would like to order:\n\n`;
    messageText += `🛒 **New Order - Tob Digital**\n`;
    messageText += `--------------------------\n`;
    messageText += cartLines.map(item => `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join('\n');
    messageText += `\n--------------------------\n`;
    messageText += `Total: $${subtotal.toFixed(2)}\n`;

    if (checkoutEmail) messageText += `\n📧 Email: ${checkoutEmail}`;
    if (checkoutContact) messageText += `\n📱 Contact: ${checkoutContact}`;
    if (checkoutNote) messageText += `\n📝 Note: ${checkoutNote}`;

    const message = encodeURIComponent(messageText);
    window.open(`https://t.me/ackermanxdb?text=${message}`, '_blank');
  };

  useEffect(() => {
    async function loadProducts() {
      setProductsLoading(true);
      setProductsError('');
      try {
        const response = await fetch(`${API_BASE}/products`);
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        const data = await response.json();
        setProducts(data.map(hydrateProduct).filter((product) => product.status === 'Active'));
      } catch (err) {
        setProductsError('Products are unavailable. Please try again later.');
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll('.reveal:not(.is-visible)');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [activeCategory, products.length, query]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
      const text = `${product.name} ${product.category} ${product.description}`.toLowerCase();
      return matchesCategory && text.includes(query.trim().toLowerCase());
    });
  }, [activeCategory, products, query]);

  const cartLines = useMemo(() => {
    return Object.entries(cart)
      .map(([id, quantity]) => {
        const product = products.find((item) => item.id === id);
        return product ? { ...product, quantity } : null;
      })
      .filter(Boolean);
  }, [cart, products]);

  const itemCount = cartLines.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartLines.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function updateCart(productId, quantity) {
    setCart((current) => {
      const next = { ...current };
      if (quantity <= 0) delete next[productId];
      else next[productId] = quantity;
      return next;
    });
  }

  function addToCart(productId) {
    setCart((current) => ({ ...current, [productId]: (current[productId] || 0) + 1 }));
    setCartOpen(true);
  }

  function openProduct(product) {
    setSelectedProduct(product);
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#">
            <span className="brand-mark"><Store size={22} /></span>
            <span>Tob Digital</span>
          </a>
          <nav className="nav-links" aria-label="Main navigation">
            <a href="#catalog">Catalog</a>
            <a href="#delivery">Delivery</a>
            <a href="#support">Support</a>
          </nav>
          <div className="header-actions">
            <button
              className="mobile-menu-button"
              type="button"
              onClick={() => setMobileNavOpen((open) => !open)}
              aria-label="Toggle navigation"
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <button className="cart-button" type="button" onClick={() => setCartOpen(true)} aria-label="Open cart">
              <ShoppingCart size={20} />
              <span>{itemCount}</span>
            </button>
          </div>
          <nav className={`mobile-nav ${mobileNavOpen ? 'open' : ''}`} aria-label="Mobile navigation">
            <a href="#catalog" onClick={() => setMobileNavOpen(false)}>Catalog</a>
            <a href="#delivery" onClick={() => setMobileNavOpen(false)}>Delivery</a>
            <a href="#support" onClick={() => setMobileNavOpen(false)}>Support</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content reveal is-visible">
            <p className="eyebrow">Digital access store</p>
            <h1 className="typing-title" aria-label="AI chat, editing, and creator accounts delivered fast.">
              <span>AI chat, editing,</span>
              <span>and creator</span>
              <span>accounts</span>
              <span>delivered fast.</span>
            </h1>
            <p className="hero-copy">
              Buy verified digital plans for AI chat, CapCut-style editing, design, study, and creator workflows with clear warranty terms.
            </p>
            <div className="hero-actions">
              <a className="primary-link" href="#catalog">
                Browse catalog <ChevronRight size={18} />
              </a>
              <a className="secondary-link" href="#delivery">How delivery works</a>
            </div>
          </div>
          <div className="hero-panel hero-showcase reveal is-visible" aria-label="Animated digital services preview">
            <div className="hero-orbit" aria-hidden="true">
              {heroTiles.map((tile, index) => {
                const Icon = tile.icon;
                return (
                  <div
                    className="service-tile"
                    key={tile.label}
                    style={{
                      '--tile-color': tile.color,
                      '--tile-index': index
                    }}
                  >
                    <Icon size={21} />
                    <span>{tile.label}</span>
                  </div>
                );
              })}
              <div className="phone-preview">
                <div className="phone-speaker"></div>
                <div className="phone-app-grid">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="phone-message">
                  <Bot size={18} />
                  <span>Order ready</span>
                </div>
              </div>
            </div>
            <div className="featured-card">
              <div className="featured-icon"><Bot size={30} /></div>
              <div>
                <span>Featured</span>
                <strong>AI Chat Pro</strong>
                <small>Instant setup, 30-day warranty</small>
              </div>
            </div>
            <div className="mini-grid">
              <div><PackageCheck size={18} /> Instant delivery</div>
              <div><Headphones size={18} /> Live support</div>
            </div>
          </div>
        </section>

        <section className="trust-row reveal" id="delivery">
          <div className="reveal">
            <Clock3 size={22} />
            <strong>Fast fulfillment</strong>
            <span>Most products arrive instantly or within one hour.</span>
          </div>
          <div className="reveal">
            <ShieldCheck size={22} />
            <strong>Warranty included</strong>
            <span>Replacement support is listed clearly per item.</span>
          </div>
          <div className="reveal">
            <CreditCard size={22} />
            <strong>Simple checkout</strong>
            <span>Cart totals and order notes stay visible.</span>
          </div>
          <div className="reveal">
            <Headphones size={22} />
            <strong>Live support</strong>
            <span>Our team is available to help with setup or issues.</span>
          </div>
        </section>

        <section className="catalog" id="catalog">
          <div className="section-heading reveal">
            <div>
              <p className="eyebrow">Catalog</p>
              <h2>Digital products</h2>
            </div>
            <label className="search-box">
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search AI, CapCut, design..."
              />
            </label>
          </div>

          <div className="category-bar reveal" aria-label="Product categories">
            <Filter size={18} />
            {categories.map((category) => (
              <button
                className={activeCategory === category ? 'active' : ''}
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="product-grid">
            {productsLoading && <div className="catalog-state">Loading products...</div>}
            {!productsLoading && productsError && <div className="catalog-state">{productsError}</div>}
            {!productsLoading && !productsError && filteredProducts.length === 0 && (
              <div className="catalog-state">No products available right now.</div>
            )}
            {!productsLoading && !productsError && filteredProducts.map((product) => {
              const Icon = product.icon;
              return (
                <article className="product-card reveal" key={product.id}>
                  <div className="product-preview" style={{ '--accent': product.accent }} aria-label={`${product.name} preview`}>
                    <div className="preview-screen">
                      <div className="preview-toolbar">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <div className="preview-content">
                        <div className="preview-icon">
                          {product.logoUrl ? <img src={product.logoUrl} alt="" /> : <Icon size={36} />}
                        </div>
                        <div>
                          <strong>{product.name}</strong>
                          <span>{product.category}</span>
                        </div>
                      </div>
                    </div>
                    <span className="badge">{product.badge}</span>
                  </div>
                  <div className="product-content">
                    <div className="product-body">
                      <span className="category-label">{product.category}</span>
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                    </div>
                    <div className="product-meta">
                      <span><Star size={16} fill="currentColor" /> {product.rating}</span>
                      <span>{product.delivery}</span>
                      <span>{product.stock} left</span>
                    </div>
                    <div className="buy-row">
                      <div className="price">
                        <strong>${product.price.toFixed(2)}</strong>
                        <span>${product.oldPrice.toFixed(2)}</span>
                      </div>
                      <div className="product-actions">
                        <button className="details-button" type="button" onClick={() => openProduct(product)}>
                          View
                        </button>
                        <button type="button" onClick={() => addToCart(product.id)}>
                          <Plus size={18} /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="support-band reveal" id="support">
          <div className="support-copy">
            <p className="eyebrow">Support</p>
            <h2>Built for digital delivery teams</h2>
            <p>Use this storefront for subscriptions, account access, bundles, setup service, and digital license delivery.</p>
            <div className="support-points" aria-label="Support highlights">
              <span><Clock3 size={16} /> Fast setup</span>
              <span><ShieldCheck size={16} /> Warranty ready</span>
              <span><Headphones size={16} /> Customer support</span>
            </div>
          </div>
          <div className="support-action">
            <a className="primary-link" href="#catalog">Shop now <ChevronRight size={18} /></a>
          </div>
        </section>
      </main>

      <CartDrawer
        cartOpen={cartOpen}
        setCartOpen={setCartOpen}
        cartLines={cartLines}
        updateCart={updateCart}
        subtotal={subtotal}
        email={checkoutEmail}
        setEmail={setCheckoutEmail}
        contact={checkoutContact}
        setContact={setCheckoutContact}
        note={checkoutNote}
        setNote={setCheckoutNote}
        onCheckout={handleCheckout}
      />
      <ProductDetails
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
      />
    </>
  );
}

function ProductDetails({ product, onClose, onAddToCart }) {
  if (!product) return null;

  const Icon = product.icon;

  return (
    <div className="details-backdrop" role="presentation" onClick={onClose}>
      <section className="details-modal" role="dialog" aria-modal="true" aria-labelledby="product-details-title" onClick={(event) => event.stopPropagation()}>
        <button className="details-close" type="button" onClick={onClose} aria-label="Close product details">
          <X size={20} />
        </button>
        <div className="details-preview" style={{ '--accent': product.accent }}>
          <span className="badge">{product.badge}</span>
          <div className="details-device">
            <div className="preview-toolbar">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="details-device-body">
              <div className="details-icon">
                {product.logoUrl ? <img src={product.logoUrl} alt="" /> : <Icon size={44} />}
              </div>
              <div>
                <strong>{product.name}</strong>
                <span>{product.category}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="details-content">
          <span className="category-label">{product.category}</span>
          <h2 id="product-details-title">{product.name}</h2>
          <p>{product.description}</p>

          <div className="details-stats">
            <span><Star size={16} fill="currentColor" /> {product.rating} rating</span>
            <span><Clock3 size={16} /> {product.delivery}</span>
            <span><PackageCheck size={16} /> {product.stock} available</span>
          </div>

          <div className="details-section">
            <h3>What you get</h3>
            <ul className="feature-list">
              {product.features.map((feature) => (
                <li key={feature}><Check size={15} /> {feature}</li>
              ))}
            </ul>
          </div>

          <div className="details-section">
            <h3>Delivery notes</h3>
            <p>After checkout, send your delivery email and preferred contact method. Access details, setup notes, and replacement terms are delivered privately.</p>
          </div>

          <div className="details-buy-row">
            <div className="price">
              <strong>${product.price.toFixed(2)}</strong>
              <span>${product.oldPrice.toFixed(2)}</span>
            </div>
            <button type="button" onClick={() => onAddToCart(product.id)}>
              <ShoppingCart size={18} /> Add to cart
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function CartDrawer({ cartOpen, setCartOpen, cartLines, updateCart, subtotal, email, setEmail, contact, setContact, note, setNote, onCheckout }) {
  return (
    <aside className={`cart-drawer ${cartOpen ? 'open' : ''}`} aria-hidden={!cartOpen}>
      <div className="cart-head">
        <div>
          <span>Checkout</span>
          <strong>Your order</strong>
        </div>
        <button type="button" onClick={() => setCartOpen(false)} aria-label="Close cart">
          <X size={20} />
        </button>
      </div>

      <div className="cart-lines">
        {cartLines.length === 0 ? (
          <div className="empty-cart">
            <ShoppingCart size={32} />
            <p>Your cart is empty.</p>
          </div>
        ) : (
          cartLines.map((item) => {
            const Icon = item.icon;
            return (
              <div className="cart-line" key={item.id}>
                <div className="cart-line-icon" style={{ '--accent': item.accent }}>
                  {item.logoUrl ? <img src={item.logoUrl} alt="" /> : <Icon size={20} />}
                </div>
                <div className="cart-line-main">
                  <strong>{item.name}</strong>
                  <span>${item.price.toFixed(2)} each</span>
                  <div className="qty-controls">
                    <button type="button" onClick={() => updateCart(item.id, item.quantity - 1)} aria-label={`Remove one ${item.name}`}>
                      <Minus size={15} />
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateCart(item.id, item.quantity + 1)} aria-label={`Add one ${item.name}`}>
                      <Plus size={15} />
                    </button>
                  </div>
                </div>
                <strong>${(item.price * item.quantity).toFixed(2)}</strong>
              </div>
            );
          })
        )}
      </div>

      <form className="checkout-form" onSubmit={(e) => e.preventDefault()}>
        <label>
          Delivery email
          <input
            type="email"
            placeholder="customer@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Telegram or WhatsApp
          <input
            type="text"
            placeholder="@username or phone"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
        </label>
        <label>
          Order note
          <textarea
            placeholder="Product version, account region, or setup request"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
      </form>

      <div className="cart-total">
        <div>
          <span>Subtotal</span>
          <strong>${subtotal.toFixed(2)}</strong>
        </div>
        <button
          type="button"
          disabled={cartLines.length === 0}
          onClick={onCheckout}
        >
          <CreditCard size={18} /> Continue checkout
        </button>
      </div>
    </aside>
  );
}

createRoot(document.getElementById('root')).render(<App />);
