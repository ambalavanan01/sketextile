import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { 
  Star, ShoppingCart, CreditCard, Share2, 
  MapPin, Truck, ShieldCheck, ArrowLeft,
  ChevronRight, ChevronLeft, Minus, Plus, Ruler
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import SizeGuideModal from '../components/SizeGuideModal';
import { Link } from 'react-router-dom';

const ProductDetails = () => {
  const { id } = useParams();
  const { products, addToCart, addReview } = useProduct();
  const { user } = useAuth();
  const navigate = useNavigate();
  const product = products.find(p => p.id === id);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || '');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, show: false });

  // Review State
  const [reviewInput, setReviewInput] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  if (!product) return <div className="container" style={{ padding: '4rem 0' }}>Product Not Found</div>;

  const handleAddToCart = () => {
    addToCart(product, qty, selectedSize, selectedColor);
    alert('Added to cart!');
  };

  const handleBuyNow = () => {
    addToCart(product, qty, selectedSize, selectedColor);
    navigate('/checkout');
  };

  const shareProduct = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to submit a review.");
      return;
    }
    setIsSubmittingReview(true);
    try {
      await addReview(product.id, {
        user: user.username || user.name || 'Anonymous',
        rating: reviewInput.rating,
        comment: reviewInput.comment,
        date: new Date().toLocaleDateString()
      });
      setReviewInput({ rating: 5, comment: '' });
      alert("Review submitted successfully!");
    } catch(err) {
      alert("Error submitting review: " + err.message);
    }
    setIsSubmittingReview(false);
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomPos({ x, y, show: true });
  };

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <Helmet>
        <title>{product.name} | SKE Textiles</title>
        <meta name="description" content={product.description} />
      </Helmet>
      
      <SizeGuideModal isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} category={product.category} />

      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', background: 'transparent' }}>
        <ArrowLeft size={20} /> Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
        {/* Gallery */}
        <div style={{ position: 'relative' }}>
          <div 
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setZoomPos({ ...zoomPos, show: false })}
            style={{ width: '100%', height: '450px', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)', background: 'white', cursor: 'zoom-in', position: 'relative' }}
          >
            <img 
               src={product.images[activeImg]} 
               style={{ 
                 width: '100%', height: '100%', objectFit: 'cover',
                 transform: zoomPos.show ? `scale(2) translate(${-zoomPos.x/2+25}%, ${-zoomPos.y/2+25}%)` : 'scale(1)',
                 transformOrigin: 'center',
                 transition: zoomPos.show ? 'none' : 'transform 0.3s ease'
               }} 
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
            {product.images.map((img, idx) => (
              <img 
                key={idx} src={img} onClick={() => setActiveImg(idx)}
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&w=800&q=80'; e.target.style.opacity = '0.3'; }}
                style={{ 
                  width: '80px', height: '80px', borderRadius: 'var(--radius)', objectFit: 'cover', 
                  cursor: 'pointer', border: activeImg === idx ? '2px solid var(--primary)' : '1px solid var(--border)' 
                }} 
              />
            ))}
          </div>
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <span style={{ background: 'var(--bg-main)', color: 'var(--primary)', padding: '0.3rem 0.8rem', borderRadius: '15px', fontSize: '0.8rem', fontWeight: 600 }}>{product.category}</span>
            <h1 style={{ fontSize: '2.5rem', marginTop: '0.5rem' }}>{product.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Star fill="#F6AD55" color="#F6AD55" size={18} />
              <span style={{ fontWeight: 600 }}>4.8</span>
              <span style={{ color: 'var(--text-muted)' }}>({product.ratings.length} reviews)</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>₹{product.price * (1 - product.discount/100)}</span>
            <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{product.price}</span>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{product.discount}% OFF</span>
          </div>

          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{product.description}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, width: '60px' }}>Size:</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {product.sizes.map(s => (
                    <button 
                        key={s} onClick={() => setSelectedSize(s)}
                        style={{ 
                        padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)',
                        background: selectedSize === s ? 'var(--primary)' : 'white',
                        color: selectedSize === s ? 'white' : 'var(--text-main)'
                        }}
                    >{s}</button>
                    ))}
                </div>
              </div>
              <button 
                onClick={() => setShowSizeGuide(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', background: 'transparent' }}
              >
                <Ruler size={16} /> Size Guide
              </button>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, width: '60px' }}>Color:</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {product.colors.map(c => (
                  <button 
                    key={c} onClick={() => setSelectedColor(c)}
                    style={{ 
                      padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)',
                      background: selectedColor === c ? 'var(--primary)' : 'white',
                      color: selectedColor === c ? 'white' : 'var(--text-main)'
                    }}
                  >{c}</button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-main)', borderRadius: 'var(--radius)', padding: '0.5rem' }}>
              <button disabled={qty <= 1} onClick={() => setQty(qty-1)} style={{ padding: '0.5rem', background: 'transparent' }}><Minus size={16} /></button>
              <span style={{ width: '40px', textAlign: 'center', fontWeight: 700 }}>{qty}</span>
              <button onClick={() => setQty(qty+1)} style={{ padding: '0.5rem', background: 'transparent' }}><Plus size={16} /></button>
            </div>
            <button 
              onClick={handleAddToCart} 
              style={{ flex: 1, padding: '1rem', borderRadius: 'var(--radius)', border: '2px solid var(--primary)', background: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <ShoppingCart size={20} /> Add to Cart
            </button>
            <button 
              onClick={handleBuyNow} 
              className="premium-gradient hover-scale" 
              style={{ flex: 1.5, padding: '1rem', borderRadius: 'var(--radius)', color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <CreditCard size={20} /> Buy Now
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <Truck size={18} color="var(--primary)" />
              <span>Fast Delivery Available</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <ShieldCheck size={18} color="var(--primary)" />
              <span>Secure Transactions</span>
            </div>
            <div onClick={shareProduct} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600 }}>
              <Share2 size={18} />
              <span>Share Product</span>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div style={{ marginTop: '6rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '2.5rem' }}>You May Also Like</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '2rem' }}>
                {relatedProducts.map(p => (
                    <Link to={`/product/${p.id}`} key={p.id} className="glass" style={{ padding: '1rem', borderRadius: '24px', textDecoration: 'none', color: 'inherit' }}>
                        <img src={p.images[0]} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '18px' }} />
                        <h4 style={{ marginTop: '1rem', fontSize: '1rem' }}>{p.name}</h4>
                        <p style={{ color: 'var(--primary)', fontWeight: 800, marginTop: '0.5rem' }}>₹{p.price}</p>
                    </Link>
                ))}
            </div>
        </div>
      )}

      {/* Description & Reviews */}
      <div style={{ marginTop: '4rem', padding: '2rem', background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Customer Reviews</h2>
        {product.ratings.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first to review!</p>
        ) : (
          product.ratings.map((r, i) => (
            <div key={i} style={{ padding: '1.5rem 0', borderBottom: i !== product.ratings.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700 }}>{r.user}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.date}</span>
              </div>
              <div style={{ margin: '0.5rem 0' }}>
                {[...Array(5)].map((_, idx) => <Star key={idx} size={14} fill={idx < r.rating ? "#F6AD55" : "none"} color={idx < r.rating ? "#F6AD55" : "#E2E8F0"} />)}
              </div>
              <p style={{ color: 'var(--text-main)' }}>{r.comment}</p>
            </div>
          ))
        )}

        {/* Add Review Form */}
        {user ? (
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '2px dashed var(--border)' }}>
            <h3 style={{ marginBottom: '1rem' }}>Write a Review</h3>
            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Rating</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map(num => (
                    <Star 
                      key={num} size={24} 
                      fill={num <= reviewInput.rating ? "#F6AD55" : "none"} 
                      color={num <= reviewInput.rating ? "#F6AD55" : "#E2E8F0"} 
                      onClick={() => setReviewInput({...reviewInput, rating: num})}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Your Feedback</label>
                <textarea 
                  required 
                  value={reviewInput.comment} 
                  onChange={(e) => setReviewInput({...reviewInput, comment: e.target.value})}
                  placeholder="What did you like or dislike about this product?"
                  style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', minHeight: '100px' }}
                />
              </div>
              <button disabled={isSubmittingReview} className="premium-gradient hover-scale" type="submit" style={{ padding: '1rem 2rem', borderRadius: 'var(--radius)', color: 'white', fontWeight: 800, alignSelf: 'flex-start' }}>
                {isSubmittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        ) : (
          <div style={{ marginTop: '3rem', padding: '2rem', background: 'var(--bg-main)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>You must be logged in to post a review.</p>
            <button onClick={() => navigate('/login')} className="premium-gradient hover-scale" style={{ padding: '0.8rem 2rem', borderRadius: '30px', color: 'white', fontWeight: 700 }}>Log In to Review</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
