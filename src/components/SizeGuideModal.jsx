import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SizeGuideModal = ({ isOpen, onClose, category }) => {
  const isSaree = category?.toLowerCase().includes('silk') || category?.toLowerCase().includes('saree');
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }} 
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }}
            style={{ position: 'relative', width: '100%', maxWidth: '600px', background: 'white', borderRadius: '40px', padding: '3rem', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.3)' }}
          >
            <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--bg-main)', border: 'none', padding: '0.6rem', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}><X size={20} /></button>
            
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 900 }}>Size Guide</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Find your perfect fit for {category || 'our collections'}. All measurements are in inches.</p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.8rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    <th style={{ padding: '0 1rem' }}>Size</th>
                    <th style={{ padding: '0 1rem' }}>Chest</th>
                    <th style={{ padding: '0 1rem' }}>Waist</th>
                    <th style={{ padding: '0 1rem' }}>Length</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { s: 'S', c: '36', w: '30', l: '28' },
                    { s: 'M', c: '38', w: '32', l: '29' },
                    { s: 'L', c: '40', w: '34', l: '30' },
                    { s: 'XL', c: '42', w: '36', l: '31' },
                    { s: 'XXL', c: '44', w: '38', l: '32' }
                  ].map((row, i) => (
                    <tr key={i} style={{ background: 'var(--bg-main)' }}>
                      <td style={{ padding: '1.2rem', borderRadius: '15px 0 0 15px', fontWeight: 900 }}>{row.s}</td>
                      <td style={{ padding: '1.2rem' }}>{row.c}"</td>
                      <td style={{ padding: '1.2rem' }}>{row.w}"</td>
                      <td style={{ padding: '1.2rem', borderRadius: '0 15px 15px 0' }}>{row.l}"</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {isSaree && (
              <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'rgba(124, 58, 237, 0.05)', borderRadius: '24px', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
                <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 800 }}>Standard Saree Dimensions</h4>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>Our premium sarees come with a standard length of <strong>5.5 meters</strong> and an additional <strong>0.8 meters</strong> of unstitched blouse fabric.</p>
              </div>
            )}

            <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>* Measurements may vary slightly between different fabric types.</p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SizeGuideModal;
