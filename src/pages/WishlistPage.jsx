import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProduct } from '../context/ProductContext';
import { ShoppingCart, Trash2, Heart, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WishlistPage = () => {
  const { wishlist, toggleWishlist, addToCart } = useProduct();
  const navigate = useNavigate();

  const handleMoveToCart = (product) => {
    addToCart(product, 1, product.sizes?.[0] || '', product.colors?.[0] || '');
    toggleWishlist(product);
  };

  if (wishlist.length === 0) {
    return (
      <div className="container" style={{ padding: '8rem 0', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ background: 'var(--bg-main)', width: '120px', height: '120px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem' }}>
            <Heart size={48} color="var(--text-muted)" strokeWidth={1} />
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1.2rem', fontWeight: 900 }}>Your Wishlist Is Empty</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.1rem', lineHeight: '1.6' }}>Looks like you haven't saved any treasures yet. Explore our latest collections and find something you love!</p>
          <button onClick={() => navigate('/')} className="premium-gradient hover-scale" style={{ padding: '1.2rem 3.5rem', borderRadius: '50px', color: 'white', fontWeight: 800, border: 'none', display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '0 auto' }}>Explore Collections <ArrowRight size={20} /></button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '4.5rem' }}>
         <div>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '0.8rem' }}>Your Wishlist</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>You have {wishlist.length} item{wishlist.length > 1 ? 's' : ''} saved for later.</p>
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '3rem' }}>
        <AnimatePresence>
          {wishlist.map((p, i) => (
            <motion.div
              layout
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="glass"
              style={{ padding: '1.5rem', borderRadius: '40px', display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid rgba(124, 58, 237, 0.05)' }}
            >
              <div style={{ height: '240px', overflow: 'hidden', borderRadius: '30px', position: 'relative' }}>
                <img src={p.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button 
                  onClick={() => toggleWishlist(p)}
                  style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.92)', border: 'none', padding: '0.6rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', color: 'var(--accent)', boxShadow: '0 8px 20px -5px rgba(0,0,0,0.1)' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div style={{ marginTop: '1.8rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>{p.category}</span>
                <Link to={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                   <h3 style={{ fontSize: '1.3rem', margin: '0.8rem 0 1.2rem 0', fontWeight: 800 }}>{p.name}</h3>
                </Link>

                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)' }}>₹{Math.floor(p.price * (1 - (p.discount || 0)/100))}</p>
                        {p.discount > 0 && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{p.price}</span>}
                    </div>
                    <button onClick={() => handleMoveToCart(p)} className="premium-gradient hover-scale" style={{ width: '48px', height: '48px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 12px 24px -6px rgba(124, 58, 237, 0.3)' }}>
                        <ShoppingCart size={22} />
                    </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WishlistPage;
