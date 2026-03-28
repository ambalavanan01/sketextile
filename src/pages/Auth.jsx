import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Auth = ({ isSignup = false }) => {
  const { login, signup, sendPasswordReset, resendVerification } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', username: '', email: '', password: '', phone: '', 
    address: '', role: 'customer' 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    if (isSignup) {
      try {
        await signup(formData);
        setStatus({ type: 'success', message: 'Signup successful! Please check your email inbox to verify your account before logging in.' });
      } catch (error) {
        setStatus({ type: 'error', message: error.message });
      }
    } else {
      try {
        await login(formData.username, formData.password);
        if (formData.username === 'sketextiles@admin') navigate('/admin');
        else navigate('/');
      } catch (error) {
        if (error.message === 'unverified-email') {
          setStatus({ 
            type: 'error', 
            message: 'Your email is not verified. Check your inbox or click below to resend the link.',
            action: async () => {
              try {
                await resendVerification(formData.username, formData.password);
                setStatus({ type: 'success', message: 'Verification link resent! Please check your inbox.' });
              } catch (err) {
                setStatus({ type: 'error', message: 'Failed to resend. Please wait a moment.' });
              }
            }
          });
        } else {
          setStatus({ type: 'error', message: error.message });
        }
      }
    }
    setLoading(false);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      await sendPasswordReset(formData.email);
      setStatus({ type: 'success', message: 'Password reset link sent! Please check your email.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
    setLoading(false);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{showForgotPassword ? 'Reset your Password' : isSignup ? 'Create an account' : 'Login to your account'}</p>
        </div>

        {status.message && (
          <div style={{ 
            padding: '1.2rem', borderRadius: '16px', marginBottom: '2rem', fontSize: '0.9rem', fontWeight: 700,
            background: status.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            color: status.type === 'error' ? '#EF4444' : '#10B981',
            border: `1px solid ${status.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
            display: 'flex', flexDirection: 'column', gap: '0.8rem'
          }}>
            <span>{status.message}</span>
            {status.action && (
              <button 
                onClick={status.action} 
                className="hover-scale"
                style={{ background: 'var(--primary)', color: 'white', padding: '0.6rem', borderRadius: '10px', fontSize: '0.8rem', width: 'fit-content' }}
              >Resend Verification</button>
            )}
          </div>
        )}

        <form onSubmit={showForgotPassword ? handlePasswordReset : handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {showForgotPassword ? (
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', top: '50%', left: '1.2rem', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
              <input 
                name="email" type="email" placeholder={t('Email Address')} required
                onChange={handleChange}
                style={{ width: '100%', padding: '1.1rem 1.1rem 1.1rem 3.5rem', borderRadius: '16px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(124, 58, 237, 0.1)', fontSize: '1rem', outline: 'none' }} 
              />
            </div>
          ) : (
            <>
              {isSignup && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                   <div style={{ position: 'relative' }}>
                      <User size={18} style={{ position: 'absolute', top: '50%', left: '1.2rem', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                      <input 
                        name="name" type="text" placeholder={t('Name')} required
                        onChange={handleChange}
                        style={{ width: '100%', padding: '1.1rem 1.1rem 1.1rem 3.5rem', borderRadius: '16px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(124, 58, 237, 0.1)', outline: 'none' }} 
                      />
                   </div>
                   <div style={{ position: 'relative' }}>
                      <User size={18} style={{ position: 'absolute', top: '50%', left: '1.2rem', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                      <input 
                        name="username" type="text" placeholder={t('ID')} required
                        onChange={handleChange}
                        style={{ width: '100%', padding: '1.1rem 1.1rem 1.1rem 3.5rem', borderRadius: '16px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(124, 58, 237, 0.1)', outline: 'none' }} 
                      />
                   </div>
                </div>
              )}
              
              {!isSignup && (
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', top: '50%', left: '1.2rem', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                  <input 
                    name="username" type="text" placeholder={t('Username or Email')} required
                    onChange={handleChange}
                    style={{ width: '100%', padding: '1.1rem 1.1rem 1.1rem 3.5rem', borderRadius: '16px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(124, 58, 237, 0.1)', outline: 'none' }} 
                  />
                </div>
              )}

              {isSignup && (
                <>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', top: '50%', left: '1.2rem', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                    <input 
                      name="email" type="email" placeholder={t('Email Address')} required
                      onChange={handleChange}
                      style={{ width: '100%', padding: '1.1rem 1.1rem 1.1rem 3.5rem', borderRadius: '16px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(124, 58, 237, 0.1)', outline: 'none' }} 
                    />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', top: '50%', left: '1.2rem', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                    <input 
                      name="phone" type="tel" placeholder="Phone Number" required
                      onChange={handleChange}
                      style={{ width: '100%', padding: '1.1rem 1.1rem 1.1rem 3.5rem', borderRadius: '16px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(124, 58, 237, 0.1)', outline: 'none' }} 
                    />
                  </div>
                </>
              )}

              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', top: '50%', left: '1.2rem', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                <input 
                  name="password" type={showPassword ? 'text' : 'password'} placeholder={t('Password')} required
                  onChange={handleChange}
                  style={{ width: '100%', padding: '1.1rem 1.1rem 1.1rem 3.5rem', borderRadius: '16px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(124, 58, 237, 0.1)', outline: 'none' }} 
                />
                <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
            </>
          )}

          {!isSignup && !showForgotPassword && (
            <p onClick={() => setShowForgotPassword(true)} style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 800, cursor: 'pointer' }}>Forgot Password?</p>
          )}

          <button 
            type="submit" disabled={loading} className="premium-gradient hover-scale"
            style={{ padding: '1.2rem', borderRadius: '18px', color: 'white', fontWeight: 800, fontSize: '1rem', marginTop: '1rem', boxShadow: '0 20px 40px -10px rgba(124, 58, 237, 0.3)' }}
          >
            {loading ? 'Loading...' : showForgotPassword ? 'Reset Password' : isSignup ? 'Join Now' : 'Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          {showForgotPassword ? (
            <p onClick={() => setShowForgotPassword(false)} style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 800 }}>Back to Login</p>
          ) : isSignup ? (
            <p>Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 800 }}>Login here</Link></p>
          ) : (
            <p>New to SKE? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 800 }}>Create an account</Link></p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
