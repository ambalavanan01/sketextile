import React, { useState } from 'react';
import { useProduct } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowLeft, CreditCard, Banknote, CheckCircle, Package, Truck, Eye, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

export const CartPage = () => {
  const { cart, removeFromCart, getCartTotals } = useProduct();
  const navigate = useNavigate();
  const { subtotal, tax, shipping, total } = getCartTotals();

  if (cart.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '10rem 0' }}>
        <ShoppingBag size={80} color="var(--text-muted)" style={{ marginBottom: '2rem' }} />
        <h2>Your Cart is Empty</h2>
        <Link to="/" className="premium-gradient" style={{ display: 'inline-block', marginTop: '2rem', padding: '1rem 2rem', borderRadius: '30px', color: 'white' }}>Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <h1 style={{ marginBottom: '3rem' }}>Your Bag ({cart.length} items)</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {cart.map((item, i) => (
            <div key={i} className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', display: 'flex', gap: '2rem' }}>
              <img src={item.images?.[0]} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius)' }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.2rem' }}>{item.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Size: {item.size} | Color: {item.color}</p>
                <p style={{ marginTop: '0.5rem', fontWeight: 700 }}>₹{Math.floor(item.price * (1 - item.discount/100))} x {item.quantity}</p>
              </div>
              <Trash2 
                style={{ cursor: 'pointer', color: 'var(--accent)' }} 
                onClick={() => removeFromCart(item.id, item.size, item.color)} 
              />
            </div>
          ))}
        </div>

        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', height: 'fit-content' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Summary</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>₹{Math.floor(subtotal)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tax (18% GST)</span><span>₹{Math.floor(tax)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
            <div style={{ height: '1px', background: 'var(--border)', margin: '1rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.2rem' }}><span>Total</span><span>₹{Math.floor(total)}</span></div>
          </div>
          <button className="premium-gradient hover-scale" onClick={() => navigate('/checkout')} style={{ width: '100%', padding: '1.2rem', borderRadius: 'var(--radius)', color: 'white', fontWeight: 800, marginTop: '2rem' }}>Proceed to Checkout</button>
        </div>
      </div>
    </div>
  );
};

export const CheckoutPage = () => {
  const { cart, clearCart, addOrder, getCartTotals } = useProduct();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState('online');
  const [isSuccess, setIsSuccess] = useState(false);
  const { subtotal, tax, shipping, total } = getCartTotals();

  const handlePlaceOrder = () => {
    if (!user) { navigate('/login'); return; }
    
    const newOrder = {
      id: Date.now().toString(),
      orderNumber: `SKE${Math.floor(Math.random() * 90000) + 10000}`,
      userId: user.uid || 'guest',
      customerDetails: {
        username: user.username,
        email: user.email,
        address: user.address || 'Chennai, India'
      },
      products: cart,
      subtotal: Math.floor(subtotal),
      tax: Math.floor(tax),
      shipping: shipping,
      total: Math.floor(total),
      status: 'confirmed',
      date: new Date().toISOString(),
      paymentMethod: method,
      deliveryPartnerId: null
    };

    addOrder(newOrder);
    setIsSuccess(true);
    setTimeout(() => navigate('/orders'), 5000);
  };

  if (isSuccess) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '10rem 0' }}>
        <CheckCircle size={100} color="#48BB78" style={{ marginBottom: '2rem' }} />
        <h1>Order Placed Successfully!</h1>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Redirecting to your orders...</p>
        <button onClick={() => navigate('/orders')} className="premium-gradient" style={{ marginTop: '2rem', padding: '1rem 2rem', borderRadius: '30px', color: 'white' }}>View Orders</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', background: 'transparent' }}>
        <ArrowLeft size={18} /> Back
      </button>
      <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '3rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>1. Confirm Delivery Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <strong>{user?.username}</strong>
              <p>{user?.email}</p>
              <p>{user?.address}</p>
              <Link to="/profile" style={{ color: 'var(--primary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Change Address</Link>
            </div>
          </div>

          <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>2. Payment Method</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius)', border: method === 'online' ? '2px solid var(--primary)' : '1px solid var(--border)', cursor: 'pointer' }}>
                <input type="radio" name="pay" checked={method === 'online'} onChange={() => setMethod('online')} />
                <CreditCard size={20} /> Online Gateway (UPI / Card)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius)', border: method === 'cod' ? '2px solid var(--primary)' : '1px solid var(--border)', cursor: 'pointer' }}>
                <input type="radio" name="pay" checked={method === 'cod'} onChange={() => setMethod('cod')} />
                <Banknote size={20} /> Cash on Delivery
              </label>
            </div>
          </div>
        </div>

        <div>
          <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', position: 'sticky', top: '100px' }}>
            <h2>Order Summary</h2>
            <div style={{ margin: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>{item.name} (x{item.quantity})</span>
                  <span>₹{Math.floor(item.price * (1 - item.discount / 100)) * item.quantity}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span>₹{Math.floor(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Tax + Shipping</span>
                <span>₹{Math.floor(tax + shipping)}</span>
              </div>
              <div style={{ height: '1px', background: 'var(--border)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.2rem' }}>
                <span>Grand Total</span>
                <span>₹{Math.floor(total)}</span>
              </div>
            </div>
            <button onClick={handlePlaceOrder} className="premium-gradient hover-scale" style={{ width: '100%', padding: '1.2rem', borderRadius: 'var(--radius)', color: 'white', fontWeight: 800 }}>Confirm & Place Order</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const OrdersPage = () => {
  const { orders } = useProduct();
  const { user } = useAuth();
  const navigate = useNavigate();
  const userOrders = orders.filter(o => o.userId === user?.uid || o.customerDetails?.username === user?.username || o.customerDetails?.username === user?.name);

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <h1 style={{ marginBottom: '2rem' }}>Track Your Orders</h1>
      {userOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Package size={60} color="var(--text-muted)" style={{ marginBottom: '1.5rem' }} />
          <h3>No Orders Found</h3>
          <Link to="/" style={{ color: 'var(--primary)', fontWeight: 600 }}>Browse Products</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {userOrders.map(order => (
            <div key={order.id} className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem' }}>Order #{order.orderNumber}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Placed on: {new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, 
                    background: order.status === 'confirmed' ? '#C6F6D5' : '#FEFCBF', 
                    color: order.status === 'confirmed' ? '#22543D' : '#744210' 
                  }}>{order.status.toUpperCase()}</span>
                  <p style={{ marginTop: '0.5rem', fontSize: '1.1rem', fontWeight: 700 }}>₹{order.total}</p>
                </div>
              </div>

              {/* Enhanced Order Tracking Timeline */}
              {order.status !== 'refunded' && (
                <div style={{ margin: '3rem 0', padding: '0 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', position: 'relative' }}>
                    {/* Progress Background Line */}
                    <div style={{ position: 'absolute', top: '22px', left: '0', right: '0', height: '4px', background: 'var(--bg-main)', zIndex: 0, borderRadius: '10px' }}></div>
                    {/* Active Progress Line */}
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ 
                        width: order.status === 'delivered' ? '100%' : (order.status === 'in_transit' ? '50%' : '0%') 
                      }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      style={{ position: 'absolute', top: '22px', left: '0', height: '4px', background: 'var(--primary)', zIndex: 0, borderRadius: '10px', boxShadow: '0 0 15px rgba(124, 58, 237, 0.4)' }}
                    ></motion.div>
                    
                    {[
                      { label: 'Confirmed', status: 'confirmed', icon: <CheckCircle size={20} /> },
                      { label: 'Processing', status: 'confirmed', icon: <Package size={20} /> },
                      { label: 'In Transit', status: 'in_transit', icon: <Truck size={20} /> },
                      { label: 'Delivered', status: 'delivered', icon: <ShoppingBag size={20} /> }
                    ].map((step, idx) => {
                      const isCompleted = order.status === 'delivered' || 
                                        (order.status === 'in_transit' && idx <= 2) || 
                                        (order.status === 'confirmed' && idx <= 1);
                      return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, position: 'relative', width: '80px' }}>
                          <div style={{ 
                            width: '48px', height: '48px', borderRadius: '50%', 
                            background: isCompleted ? 'var(--primary)' : 'white', 
                            color: isCompleted ? 'white' : 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: `3px solid ${isCompleted ? 'var(--primary)' : 'var(--bg-main)'}`,
                            boxShadow: isCompleted ? '0 10px 20px -5px rgba(124, 58, 237, 0.4)' : 'none',
                            transition: 'all 0.4s ease'
                          }}>
                            {step.icon}
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, marginTop: '1rem', color: isCompleted ? 'var(--text-main)' : 'var(--text-muted)' }}>{step.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                {order.products.map(p => (
                  <img key={p.id} src={p.images[0]} title={p.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <div style={{ fontSize: '0.85rem' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Payment</p>
                    <strong>{order.paymentMethod.toUpperCase()}</strong>
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Delivery At</p>
                    <strong>{order.customerDetails.address}</strong>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/invoice/${order.orderNumber}`)} 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', borderRadius: 'var(--radius)', background: 'var(--primary)', color: 'white', fontWeight: 600 }}
                >
                  <Eye size={18} /> View Invoice
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};