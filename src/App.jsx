import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, Search, ShoppingCart, User, X, Home, 
  Package, Truck, LogOut, ChevronRight, Settings, Info, Phone, Star, Tag, History, MessageCircle, 
  Bell, Heart, MapPin, ChevronDown, Rocket, TrendingUp, Zap, Plus
} from 'lucide-react';
import { useAuth, AuthProvider } from './context/AuthContext';
import { useProduct, ProductProvider } from './context/ProductContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import './i18n';

// Pages
import Auth from './pages/Auth';
import ProductDetails from './pages/ProductDetails';
import { CartPage, CheckoutPage, OrdersPage } from './pages/CheckoutFlow';
import { AdminDashboard, DeliveryDashboard, ProfilePage } from './pages/Dashboards';
import InvoicePage from './pages/InvoicePage';

const HeroSlider = () => {
  const slides = [
    { title: "Silk Heritage '26", subtitle: "Pure Kanchipuram & Banarasi Style", color: "rgba(124, 58, 237, 0.1)", blob: "#7C3AED" },
    { title: "Ready-made Clothes", subtitle: "Designer ethnic wear for everyone", color: "rgba(251, 113, 133, 0.1)", blob: "#FB7185" },
    { title: "Cotton Comfort", subtitle: "Breathable fabrics for daily wear", color: "rgba(56, 189, 248, 0.1)", blob: "#38BDF8" }
  ];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div style={{ position: 'relative', height: '550px', borderRadius: '40px', overflow: 'hidden', marginBottom: '4rem', background: '#FDFCFD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Decorative Aura Blobs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 15, repeat: Infinity }}
        style={{ position: 'absolute', top: '-10%', left: '-10%', width: '60%', height: '60%', background: slides[current].blob, filter: 'blur(120px)', opacity: 0.15, borderRadius: '50%' }} 
      />
      <motion.div 
        animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
        style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%', background: slides[current].blob, filter: 'blur(100px)', opacity: 0.1, borderRadius: '50%' }} 
      />

      <AnimatePresence mode="wait">
        <motion.div
           key={current}
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -30 }}
           transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
           style={{ zIndex: 1, textAlign: 'center', padding: '0 2rem', maxWidth: '800px' }}
        >
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ display: 'block', fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '4px', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Exclusive Collection</motion.span>
          <motion.h1 style={{ fontSize: '4.5rem', marginBottom: '1.5rem', fontWeight: 900, lineHeight: 1.1, color: 'var(--text-main)' }}>{slides[current].title}</motion.h1>
          <p style={{ fontSize: '1.4rem', marginBottom: '3rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{slides[current].subtitle}</p>
          <button className="premium-gradient hover-scale" style={{ padding: '1.2rem 3.5rem', borderRadius: '50px', color: 'white', fontWeight: 800, fontSize: '1.1rem', boxShadow: '0 20px 40px -10px rgba(124, 58, 237, 0.3)' }}>Explore Now</button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const HomePage = () => {
  const { products } = useProduct();
  const { t } = useTranslation();
  const { user, updateUserProfile } = useAuth();
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const searchQuery = queryParams.get('search') || '';
  
  const [filter, setFilter] = useState('All');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (user?.history) {
      setHistory(user.history);
    } else {
      const saved = localStorage.getItem('ske_history');
      if (saved) setHistory(JSON.parse(saved));
    }
  }, [user]);

  const filteredProducts = products.filter(p => 
    (filter === 'All' || p.category === filter) &&
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const categories = ['All', 'Pure Silk', 'Fine Cotton', 'Linen', 'Readymades', 'Ethnic Wear'];

  return (
    <div className="container">
      <HeroSlider />

      <section style={{ marginBottom: '6rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '3rem' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Curated Selections</h2>
            <p style={{ color: 'var(--text-muted)' }}>Handpicked treasures just for your lifestyle</p>
          </div>
          <Link to="/" style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>VIEW ALL PIECES <ChevronRight size={16} /></Link>
        </div>
        <div className="grid-products">
          {products.slice(0, 4).map((p, i) => (
            <ProductCard key={p.id} p={p} i={i} history={history} setHistory={setHistory} />
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '6rem' }}>
         <div style={{ display: 'flex', gap: '1rem', marginBottom: '3.5rem', overflowX: 'auto', paddingBottom: '1rem', justifyContent: 'center' }}>
          {categories.map(c => (
            <button 
              key={c} onClick={() => setFilter(c)}
              className="glass hover-scale"
              style={{ 
                padding: '0.8rem 2.5rem', borderRadius: '50px',
                background: filter === c ? 'var(--primary)' : 'rgba(255,255,255,0.6)',
                color: filter === c ? 'white' : 'var(--text-main)',
                fontWeight: 800,
                fontSize: '0.9rem',
                border: filter === c ? 'none' : '1px solid rgba(124, 58, 237, 0.1)'
              }}
            >{c}</button>
          ))}
        </div>
        <div className="grid-products">
          {filteredProducts.map((p, i) => (
            <ProductCard key={p.id} p={p} i={i} history={history} setHistory={setHistory} />
          ))}
        </div>
      </section>

      {history.length > 0 && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <History color="var(--primary)" />
            <h2>Inspired by your browsing</h2>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
            {history.map(p => (
              <Link to={`/product/${p.id}`} key={p.id} className="glass" style={{ minWidth: '180px', padding: '1rem', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                <img src={p.images[0]} style={{ width: '140px', height: '140px', objectFit: 'cover', borderRadius: '15px' }} />
                <p style={{ marginTop: '0.8rem', fontSize: '0.9rem', fontWeight: 600 }}>{p.name.slice(0, 15)}...</p>
                <p style={{ color: 'var(--primary)', fontWeight: 800 }}>₹{p.price}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const ProductCard = ({ p, i, history, setHistory }) => {
  const { user, updateUserProfile } = useAuth();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: i * 0.05 }}
    >
      <Link to={`/product/${p.id}`} onClick={() => {
        const newHist = [p, ...history.filter(h => h.id !== p.id)].slice(0, 5);
        setHistory(newHist);
        if (user && updateUserProfile) updateUserProfile({ history: newHist });
        else localStorage.setItem('ske_history', JSON.stringify(newHist));
      }} className="glass hover-scale" style={{ padding: '1.2rem', borderRadius: '32px', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', border: '1px solid rgba(124, 58, 237, 0.05)' }}>
        <div style={{ height: '240px', overflow: 'hidden', borderRadius: '24px' }}>
          <img src={p.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s cubic-bezier(0.19, 1, 0.22, 1)' }} className="card-img" />
        </div>
        <div style={{ marginTop: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '1px' }}>{p.category.toUpperCase()}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <Star size={12} fill="var(--primary)" color="var(--primary)" /> <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>4.8</span>
            </div>
          </div>
          <h3 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', fontWeight: 700, color: 'var(--text-main)' }}>{p.name}</h3>
          
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
            <div>
               <p style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)' }}>₹{Math.floor(p.price * (1 - (p.discount || 0)/100))}</p>
               {p.discount > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{p.price}</span>}
            </div>
            <button className="premium-gradient" style={{ width: '44px', height: '44px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px -5px rgba(124, 58, 237, 0.3)' }}><Plus size={20} color="white" /></button>
          </div>
        </div>
        {p.discount >= 10 && <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'white', color: 'var(--primary)', padding: '0.4rem 0.8rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 900, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>-{p.discount}%</div>}
      </Link>
    </motion.div>
  );
};

const Header = ({ setSidebarOpen }) => {
  const { user } = useAuth();
  const { cart } = useProduct();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      navigate(`/?search=${search}`);
      setSearch('');
    }
  };

  return (
    <div style={{ 
      position: 'fixed', top: '1.2rem', left: '50%', transform: 'translateX(-50%)', 
      width: '96%', maxWidth: '1300px', zIndex: 2000,
      transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)'
    }}>
      <header className="glass" style={{ 
        padding: isScrolled ? '0.7rem 1.5rem' : '1rem 2rem', 
        borderRadius: '100px', 
        display: 'grid', 
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center', 
        gap: '2rem',
        background: isScrolled ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 255, 255, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: isScrolled ? '0 30px 60px -15px rgba(0,0,0,0.15)' : '0 10px 30px -5px rgba(0,0,0,0.05)'
      }}>
        {/* Left: Hamburger & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ cursor: 'pointer', color: 'var(--text-main)', display: 'flex' }} onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </div>
          <Link to="/" style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-1.5px', textDecoration: 'none' }}>
            SKE <span style={{ color: 'var(--text-main)', fontWeight: 400 }}>Textiles</span>
          </Link>
        </div>

        {/* Center: Permanent Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ 
            display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.04)', 
            padding: '0.6rem 1.2rem', borderRadius: '50px', width: '100%', maxWidth: '450px',
            border: '1px solid rgba(0,0,0,0.05)', transition: 'all 0.3s'
          }}>
            <Search size={18} style={{ color: 'var(--text-muted)', marginRight: '0.8rem' }} />
            <input 
              type="text" 
              placeholder="Search for clothes..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearch}
              style={{ background: 'transparent', border: 'none', width: '100%', fontSize: '0.9rem', outline: 'none', fontWeight: 600, color: 'var(--text-main)' }}
            />
          </div>
        </div>

        {/* Right: Orders, Profile, Cart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.8rem' }}>
          <Link to="/orders" title="My Orders" style={{ color: 'var(--text-main)', position: 'relative', display: 'flex' }}>
            <Package size={22} />
          </Link>

          {user ? (
            <div onClick={() => navigate('/profile')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
               <div style={{ 
                 background: 'var(--primary)', color: 'white', width: '38px', height: '38px', borderRadius: '50%', 
                 display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem',
                 boxShadow: '0 4px 10px rgba(124, 58, 237, 0.3)'
               }}>
                 {user?.username?.[0]?.toUpperCase() || 'U'}
               </div>
            </div>
          ) : (
            <Link to="/login" title="Login / Join" style={{ color: 'var(--text-main)', display: 'flex' }}>
              <User size={22} />
            </Link>
          )}

          <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <ShoppingCart size={22} color="var(--text-main)" />
            {cart?.length > 0 && (
              <span style={{ 
                position: 'absolute', top: '-8px', right: '-10px', background: 'var(--primary)', 
                color: 'white', fontSize: '0.65rem', width: '18px', height: '18px', 
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 
              }}>{cart?.length}</span>
            )}
          </Link>
        </div>
      </header>
    </div>
  );
};

const Sidebar = ({ isOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000 }}>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(31, 27, 46, 0.4)', backdropFilter: 'blur(8px)' }} 
          />
          <motion.div 
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '320px', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(24px)', padding: '3rem 2rem', borderRight: '1px solid rgba(124, 58, 237, 0.1)', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)' }}>SKE Textiles</span>
              <X onClick={() => setSidebarOpen(false)} style={{ cursor: 'pointer' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {[
                { icon: <Home size={20} />, label: 'Home', path: '/' },
                { icon: <Package size={20} />, label: 'My Orders', path: '/orders' },
                { icon: <ShoppingCart size={20} />, label: 'Basket', path: '/cart' },
                { icon: <Rocket size={20} />, label: "New Products", path: '/' },
                ...(user?.role === 'admin' ? [{ icon: <Settings size={20} />, label: 'Admin Panel', path: '/admin' }] : []),
                ...(user?.role === 'delivery' ? [{ icon: <Truck size={20} />, label: 'Delivery Panel', path: '/delivery' }] : []),
                { icon: <Info size={20} />, label: 'About Us', path: '/customer-care' }
              ].map(item => (
                <div key={item.label} onClick={() => { navigate(item.path); setSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)', transition: 'all 0.3s' }} className="hover-scale">
                  <span style={{ color: 'var(--primary)' }}>{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid rgba(124, 58, 237, 0.1)' }}>
              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div onClick={() => { navigate('/profile'); setSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                    <div style={{ background: 'var(--primary)', color: 'white', width: '44px', height: '44px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p style={{ fontWeight: 800 }}>{user?.username || 'User'}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>View Profile</p>
                    </div>
                  </div>
                  <button onClick={() => { logout(); setSidebarOpen(false); navigate('/'); }} style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#EF4444', fontWeight: 800, marginTop: '1rem', background: 'transparent', width: '100%', textAlign: 'left' }}><LogOut size={20} /> Logout</button>
                </div>
              ) : (
                <button onClick={() => { navigate('/login'); setSidebarOpen(false); }} className="premium-gradient" style={{ width: '100%', padding: '1rem', borderRadius: '16px', color: 'white', fontWeight: 800 }}>Login Now</button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const CustomerCare = () => (
  <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
      <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '4px', textTransform: 'uppercase', display: 'block', marginBottom: '1.5rem' }}>Help Center</span>
      <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '4rem', color: 'var(--text-main)' }}>How can we help you?</h1>
    </motion.div>
    
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
      {[
        { icon: <MessageCircle size={44} />, title: "Email Support", desc: "support@sketextiles.com", sub: "We reply in 24 hours" },
        { icon: <Phone size={44} />, title: "Phone Support", desc: "+91 98765 43210", sub: "9 AM - 9 PM IST" },
        { icon: <MapPin size={44} />, title: "Visit Store", desc: "123 Cloth Street, Anna Salai", sub: "Chennai, Tamil Nadu" }
      ].map((item, i) => (
        <motion.div 
          key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
          className="glass hover-scale" style={{ padding: '4rem 3rem', borderRadius: '40px', border: '1px solid rgba(124, 58, 237, 0.05)' }}
        >
          <div style={{ color: 'var(--primary)', marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '1rem', color: 'var(--text-main)' }}>{item.title}</h3>
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>{item.desc}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.sub}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
};

import ResetPassword from './pages/ResetPassword';

const AppContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <ScrollToTop />
      <Header setSidebarOpen={setSidebarOpen} />
      <Sidebar isOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main style={{ minHeight: '80vh', padding: '120px 0 6rem 0' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/invoice/:orderId?" element={<InvoicePage />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth isSignup />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/customer-care" element={<CustomerCare />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Admin & Delivery Panels */}
          {user?.role === 'admin' && <Route path="/admin" element={<AdminDashboard />} />}
          {user?.role === 'delivery' && <Route path="/delivery" element={<DeliveryDashboard />} />}

          <Route path="*" element={<Link to="/" style={{ display: 'block', textAlign: 'center', padding: '10rem' }}>Page Not Found. Return Home</Link>} />
        </Routes>
      </main>
      <footer style={{ marginTop: '10rem', padding: '10rem 0 5rem 0', background: 'var(--bg-main)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.1), transparent)' }} />
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '5rem' }}>
          <div>
            <h2 style={{ color: 'var(--primary)', marginBottom: '2rem', fontSize: '2rem', fontWeight: 900 }}>SKE Textiles</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '2' }}>Textile heritage meets modern readymade elegance. Every fabric tells a story of craftsmanship.</p>
          </div>
          <div>
            <h4 style={{ marginBottom: '2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', color: 'var(--text-main)' }}>Discovery</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <li>The Aura Edit</li>
              <li>New Arrivals</li>
              <li>Boutique Pieces</li>
              <li>Gift Experience</li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', color: 'var(--text-main)' }}>Company</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <li><Link to="/customer-care">Journal</Link></li>
              <li>Sustainability</li>
              <li>Privacy Vision</li>
              <li>Terms of Aura</li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', color: 'var(--text-main)' }}>Aura Circle</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Join the exclusive circle for early aura access.</p>
            <div style={{ display: 'flex', gap: '0.5rem', background: 'white', padding: '0.5rem', borderRadius: '50px', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
              <input type="email" placeholder="Your Email" style={{ padding: '0.8rem 1.5rem', border: 'none', flex: 1, outline: 'none', background: 'transparent' }} />
              <button className="premium-gradient" style={{ padding: '0.8rem 2rem', borderRadius: '50px', color: 'white', fontWeight: 800 }}>Join</button>
            </div>
          </div>
        </div>
        <div className="container" style={{ marginTop: '8rem', paddingTop: '3rem', borderTop: '1px solid rgba(124, 58, 237, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700 }}>
          <p>© 2026 SKE TEXTILES. WOVEN FOR EXCELLENCE.</p>
          <div style={{ display: 'flex', gap: '2.5rem' }}>
             <span>INSTAGRAM</span> <span>TWITTER</span> <span>LINKEDIN</span>
          </div>
        </div>
      </footer>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <AppContent />
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;
