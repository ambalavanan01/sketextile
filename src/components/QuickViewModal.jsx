import React, { useState } from 'react';
import { X, ShoppingCart, Star, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProduct } from '../context/ProductContext';

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useProduct();
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || '');

  if (!product) return null;

  const handleAdd = () => {
    addToCart(product, qty, selectedSize, selectedColor);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }} 
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
            style={{ position: 'relative', width: '100%', maxWidth: '900px', background: 'white', borderRadius: '40px', overflow: 'hidden', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.25)' }}
          >
            <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10, background: 'white', border: '1px solid var(--border)', padding: '0.6rem', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}><X size={20} /></button>
            
            <div style={{ height: '500px' }}>
              <img src={product.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '1px' }}>{product.category.toUpperCase()}</span>
                <h2 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>{product.name}</h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 900 }}>₹{Math.floor(product.price * (1 - (product.discount || 0)/100))}</span>
                {product.discount > 0 && <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{product.price}</span>}
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-main)', padding: '0.5rem 1rem', borderRadius: '15px' }}>
                  <Star fill="var(--primary)" color="var(--primary)" size={16} /> 
                  <span style={{ fontWeight: 800 }}>4.8</span>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>({product.ratings?.length || 0} reviews)</span>
              </div>

              {product.sizes?.length > 0 && (
                <div>
                    <p style={{ fontWeight: 700, marginBottom: '0.8rem', fontSize: '0.9rem' }}>Size</p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {product.sizes.map(s => (
                        <button key={s} onClick={() => setSelectedSize(s)} style={{ padding: '0.5rem 1.2rem', borderRadius: '12px', border: selectedSize === s ? '2px solid var(--primary)' : '1px solid var(--border)', background: selectedSize === s ? 'rgba(124, 58, 237, 0.05)' : 'white', fontWeight: 700, color: selectedSize === s ? 'var(--primary)' : 'var(--text-main)' }}>{s}</button>
                    ))}
                    </div>
                </div>
              )}

              <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-main)', borderRadius: '18px', padding: '0.4rem' }}>
                    <button disabled={qty <= 1} onClick={() => setQty(qty-1)} style={{ padding: '0.5rem', background: 'transparent' }}><Minus size={18} /></button>
                    <span style={{ width: '40px', textAlign: 'center', fontWeight: 800 }}>{qty}</span>
                    <button onClick={() => setQty(qty+1)} style={{ padding: '0.5rem', background: 'transparent' }}><Plus size={18} /></button>
                 </div>
                 <button onClick={handleAdd} className="premium-gradient hover-scale" style={{ flex: 1, padding: '1rem', borderRadius: '18px', color: 'white', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}>
                    <ShoppingCart size={20} /> Add to Cart
                 </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal;
