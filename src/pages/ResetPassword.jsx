import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const ResetPassword = () => {
  const { confirmReset } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const oobCode = query.get('oobCode');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      setStatus({ type: 'error', message: 'Invalid or expired reset link. Please request a new one.' });
    }
  }, [oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }
    if (password.length < 6) {
      setStatus({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await confirmReset(oobCode, password);
      setStatus({ type: 'success', message: 'Password reset successful! Redirecting to login...' });
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to reset password. The link may have expired.' });
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'var(--bg-main)', padding: '2rem' }}>
      {/* Decorative Aura Blobs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity }}
        style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '50%', background: 'var(--primary)', filter: 'blur(120px)', opacity: 0.1, borderRadius: '50%' }} 
      />
      <motion.div 
        animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
        transition={{ duration: 18, repeat: Infinity }}
        style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'var(--secondary)', filter: 'blur(100px)', opacity: 0.08, borderRadius: '50%' }} 
      />

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass"
        style={{ width: '100%', maxWidth: '480px', padding: '3.5rem', borderRadius: '32px', zIndex: 1, border: '1px solid rgba(124, 58, 237, 0.1)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-1.5px', marginBottom: '0.5rem' }}>SKE <span style={{ color: 'var(--text-main)', fontWeight: 400 }}>Textiles</span></h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Update your unique Textile access</p>
        </div>

        {status.message && (
          <div style={{ 
            padding: '1.2rem', borderRadius: '16px', marginBottom: '2rem', fontSize: '0.9rem', fontWeight: 700,
            background: status.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            color: status.type === 'error' ? '#EF4444' : '#10B981',
            border: `1px solid ${status.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
          }}>
            {status.message}
          </div>
        )}

        {oobCode && status.type !== 'success' ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', top: '50%', left: '1.2rem', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
              <input 
                 type={showPassword ? 'text' : 'password'} placeholder="New Password" required
                 value={password} onChange={(e) => setPassword(e.target.value)}
                 style={{ width: '100%', padding: '1.1rem 1.1rem 1.1rem 3.5rem', borderRadius: '16px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(124, 58, 237, 0.1)', outline: 'none' }} 
              />
              <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', top: '50%', left: '1.2rem', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
              <input 
                 type="password" placeholder="Confirm Password" required
                 value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                 style={{ width: '100%', padding: '1.1rem 1.1rem 1.1rem 3.5rem', borderRadius: '16px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(124, 58, 237, 0.1)', outline: 'none' }} 
              />
            </div>

            <button 
              type="submit" disabled={loading} className="premium-gradient hover-scale"
              style={{ padding: '1.2rem', borderRadius: '18px', color: 'white', fontWeight: 800, fontSize: '1rem', marginTop: '1rem', boxShadow: '0 20px 40px -10px rgba(124, 58, 237, 0.3)' }}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        ) : (
          <button 
            onClick={() => navigate('/login')}
            className="premium-gradient hover-scale"
            style={{ width: '100%', padding: '1.2rem', borderRadius: '18px', color: 'white', fontWeight: 800, marginTop: '1rem' }}
          >
            Enter Boutique
          </button>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
