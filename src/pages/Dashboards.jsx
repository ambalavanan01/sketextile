import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useProduct } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, Package, Users, Truck, AlertCircle, 
  Plus, Edit, Trash, Check, X, MapPin, 
  TrendingUp, ShoppingCart, DollarSign 
} from 'lucide-react';

export const AdminDashboard = () => {
  const { products, orders, addProduct, updateProduct, deleteProduct, setProducts, updateOrder } = useProduct();
  const { user } = useAuth();
  const [tab, setTab] = useState('analytics');
  const [isAdding, setIsAdding] = useState(false);
  const [usersList, setUsersList] = useState([]);
  
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsersList(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    }, (err) => console.log('Admin users listener error', err));
    return () => unsub();
  }, []);

  // Analytics Logic
  const completedOrders = orders.filter(o => o.status === 'delivered');
  const totalSales = completedOrders.length;
  
  const totalProfit = orders.reduce((sum, o) => {
    if (o.status !== 'refunded') return sum + (o.total * 0.2); // 20% margin
    return sum;
  }, 0);

  const productSales = {};
  orders.forEach(o => {
    if (o.status !== 'refunded') {
      o.products.forEach(p => {
        productSales[p.id] = (productSales[p.id] || 0) + p.quantity;
      });
    }
  });
  const topProductId = Object.keys(productSales).reduce((a, b) => productSales[a] > productSales[b] ? a : b, null);
  const topProduct = products.find(p => p.id === topProductId) || products[0];

  const customers = usersList.filter(u => u.role === 'customer');
  const deliveryPartners = usersList.filter(u => u.role === 'delivery');

  const renderAnalytics = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
      <div className="glass hover-scale" style={{ padding: '2rem', borderRadius: 'var(--radius)', borderBottom: '5px solid var(--primary)' }}>
        <TrendingUp color="var(--primary)" size={32} />
        <h3 style={{ margin: '1rem 0' }}>{totalSales} Total Sales</h3>
        <p style={{ color: 'var(--text-muted)' }}>Orders confirmed this month</p>
      </div>
      <div className="glass hover-scale" style={{ padding: '2rem', borderRadius: 'var(--radius)', borderBottom: '5px solid #48BB78' }}>
        <DollarSign color="#48BB78" size={32} />
        <h3 style={{ margin: '1rem 0' }}>₹{Math.floor(totalProfit)} Profit</h3>
        <p style={{ color: 'var(--text-muted)' }}>Estimated earnings</p>
      </div>
      <div className="glass hover-scale" style={{ padding: '2rem', borderRadius: 'var(--radius)', borderBottom: '5px solid var(--accent)' }}>
        <Package color="var(--accent)" size={32} />
        <h3 style={{ margin: '1rem 0' }}>Highest Selling</h3>
        <p style={{ color: 'var(--text-muted)' }}>{topProduct?.name || 'Loading...'}</p>
      </div>
      <div className="glass hover-scale" style={{ padding: '2rem', borderRadius: 'var(--radius)', borderBottom: '5px solid #ED8936' }}>
        <Users color="#ED8936" size={32} />
        <h3 style={{ margin: '1rem 0' }}>{customers.length} Customers</h3>
        <p style={{ color: 'var(--text-muted)' }}>Active platform users</p>
      </div>
    </div>
  );

  const [isEditing, setIsEditing] = useState(false);
  const [productForm, setProductForm] = useState({
    id: null, name: '', price: '', stock: '', discount: '0',
    category: '', description: '',
    imagesStr: '', sizesStr: '', colorsStr: ''
  });

  const handleOpenAdd = () => {
    setIsAdding(!isAdding);
    setIsEditing(false);
    setProductForm({ id: null, name: '', price: '', stock: '', discount: '0', category: '', description: '', imagesStr: '', sizesStr: '', colorsStr: '' });
  };
  
  const handleOpenEdit = (p) => {
    setIsEditing(true);
    setIsAdding(false);
    setProductForm({
      id: p.id,
      name: p.name,
      price: p.price,
      stock: p.stock,
      discount: p.discount || 0,
      category: p.category || '',
      description: p.description || '',
      imagesStr: p.images.join(', '),
      sizesStr: p.sizes?.join(', ') || '',
      colorsStr: p.colors?.join(', ') || ''
    });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const imgs = productForm.imagesStr.split(',').map(s => s.trim()).filter(Boolean);
    if(imgs.length < 2 || imgs.length > 5) {
      alert("Please provide exactly between 2 and 5 valid image links, separated by commas.");
      return;
    }
    const finalProduct = {
      name: productForm.name,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      discount: Number(productForm.discount),
      category: productForm.category || 'General',
      description: productForm.description,
      images: imgs,
      sizes: productForm.sizesStr ? productForm.sizesStr.split(',').map(s=>s.trim()) : ["One Size"],
      colors: productForm.colorsStr ? productForm.colorsStr.split(',').map(s=>s.trim()) : ["Default"],
      ratings: isEditing ? (products.find(p=>p.id===productForm.id)?.ratings || []) : []
    };
    try {
      if (isEditing) {
        finalProduct.id = productForm.id;
        await updateProduct(finalProduct);
        setIsEditing(false);
        alert("Product updated successfully!");
      } else {
        await addProduct(finalProduct);
        setIsAdding(false);
        alert("Success! Product has been added to Live Inventory.");
      }
      setProductForm({ id: null, name: '', price: '', stock: '', discount: '0', category: '', description: '', imagesStr: '', sizesStr: '', colorsStr: '' });
    } catch(err) {
      alert("Error saving product: " + err.message);
    }
  };

  const renderProducts = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Manage Inventory</h2>
        <button onClick={handleOpenAdd} className="premium-gradient hover-scale" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1.5rem', borderRadius: 'var(--radius)', color: 'white' }}>
          {isAdding ? <X size={20} /> : <Plus size={20} />} {isAdding ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {(isAdding || isEditing) && (
        <form onSubmit={handleProductSubmit} className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', marginBottom: '1rem', borderLeft: isEditing ? '5px solid #ED8936' : '5px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>{isEditing ? 'Edit Product Listing' : 'Add New Product Listing'}</h3>
            {isEditing && <button type="button" onClick={() => setIsEditing(false)} style={{ background: 'transparent', padding: 0 }}><X size={24} color="var(--text-muted)"/></button>}
          </div>
          <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div><label>Product Name *</label><input required value={productForm.name} onChange={e=>setProductForm({...productForm, name: e.target.value})} style={{ width: '100%', padding:'0.8rem', borderRadius:'8px', border:'1px solid var(--border)', marginTop:'0.5rem' }}/></div>
            <div><label>Category *</label><input required value={productForm.category} onChange={e=>setProductForm({...productForm, category: e.target.value})} placeholder="Electronics, Fashion..." style={{ width: '100%', padding:'0.8rem', borderRadius:'8px', border:'1px solid var(--border)', marginTop:'0.5rem' }}/></div>
            <div><label>Price (₹) *</label><input required type="number" value={productForm.price} onChange={e=>setProductForm({...productForm, price: e.target.value})} style={{ width: '100%', padding:'0.8rem', borderRadius:'8px', border:'1px solid var(--border)', marginTop:'0.5rem' }}/></div>
            <div><label>Stock Quantity *</label><input required type="number" value={productForm.stock} onChange={e=>setProductForm({...productForm, stock: e.target.value})} style={{ width: '100%', padding:'0.8rem', borderRadius:'8px', border:'1px solid var(--border)', marginTop:'0.5rem' }}/></div>
            <div><label>Discount %</label><input type="number" value={productForm.discount} onChange={e=>setProductForm({...productForm, discount: e.target.value})} style={{ width: '100%', padding:'0.8rem', borderRadius:'8px', border:'1px solid var(--border)', marginTop:'0.5rem' }}/></div>
            <div><label>Image URLs * (Min 2, Max 5, comma separated)</label><input required value={productForm.imagesStr} onChange={e=>setProductForm({...productForm, imagesStr: e.target.value})} placeholder="https://img1.jpg, https://img2.jpg" style={{ width: '100%', padding:'0.8rem', borderRadius:'8px', border:'1px solid var(--border)', marginTop:'0.5rem' }}/></div>
            <div><label>Available Sizes (comma separated)</label><input value={productForm.sizesStr} onChange={e=>setProductForm({...productForm, sizesStr: e.target.value})} placeholder="S, M, L, XL" style={{ width: '100%', padding:'0.8rem', borderRadius:'8px', border:'1px solid var(--border)', marginTop:'0.5rem' }}/></div>
            <div><label>Available Colors (comma separated)</label><input value={productForm.colorsStr} onChange={e=>setProductForm({...productForm, colorsStr: e.target.value})} placeholder="Black, White, Blue" style={{ width: '100%', padding:'0.8rem', borderRadius:'8px', border:'1px solid var(--border)', marginTop:'0.5rem' }}/></div>
            <div style={{ gridColumn: '1 / -1' }}><label>Product Description *</label><textarea required value={productForm.description} onChange={e=>setProductForm({...productForm, description: e.target.value})} style={{ width: '100%', padding:'0.8rem', borderRadius:'8px', border:'1px solid var(--border)', marginTop:'0.5rem', height:'80px' }}/></div>
          </div>
          <button type="submit" className="premium-gradient hover-scale" style={{ padding: '1rem 2rem', borderRadius: 'var(--radius)', color: 'white', fontWeight: 700, marginTop: '2rem' }}>
            {isEditing ? 'Save Changes' : 'Publish to Store'}
          </button>
        </form>
      )}

      {products.map(p => (
        <div key={p.id} className="glass admin-product-row" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
          <img src={p.images[0]} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px' }} />
          <div style={{ fontWeight: 800 }}>{p.name}</div>
          <div style={{ color: 'var(--text-muted)' }}>₹{p.price}</div>
          <div style={{ color: p.stock < 10 ? 'var(--accent)' : 'var(--text-main)', fontWeight: 600 }}>Stock: {p.stock}</div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => handleOpenEdit(p)} style={{ padding: '0.5rem', background: 'var(--bg-main)', borderRadius: '8px' }}><Edit size={18} /></button>
            <button onClick={() => deleteProduct(p.id)} style={{ padding: '0.5rem', background: '#FFF5F5', color: 'var(--accent)', borderRadius: '8px' }}><Trash size={18} /></button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderOrders = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2>Platform Orders</h2>
      {orders.map(o => (
         <div key={o.id} className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
             <div>
               <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>Order #{o.orderNumber || o.id.slice(0, 8)}</strong>
               <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem', fontSize: '0.9rem' }}>Placed on: {new Date(o.date).toLocaleDateString()} | <strong>₹{o.total}</strong></p>
             </div>
             
             <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>STATUS:</span>
                <select 
                  value={o.status || 'confirmed'} 
                  onChange={(e) => updateOrder(o.id, { status: e.target.value })}
                  style={{ padding: '0.5rem 1rem', borderRadius: '30px', border: '2px solid var(--primary)', fontWeight: 800, background: 'white', color: 'var(--primary)', cursor: 'pointer' }}
                >
                  <option value="confirmed">Processing Order</option>
                  <option value="in_transit">Dispatched / In Transit</option>
                  <option value="delivered">Completed / Delivered</option>
                  <option value="refunded">Refunded / Cancelled</option>
                </select>
             </div>
           </div>

           <div style={{ padding: '1.2rem', background: 'var(--bg-main)', borderRadius: 'var(--radius)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
             <Truck size={20} color="var(--primary)" />
             <strong>Assign Delivery Partner:</strong>
             <select 
               value={o.deliveryPartnerId || ''} 
               onChange={(e) => updateOrder(o.id, { deliveryPartnerId: e.target.value })}
               style={{ flex: 1, minWidth: '200px', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', cursor: 'pointer' }}
             >
               <option value="">-- Unassigned --</option>
               {deliveryPartners.map(dp => (
                 <option key={dp.id} value={dp.id}>{dp.name || dp.username} ({dp.phone || dp.email})</option>
               ))}
             </select>
           </div>
           
           <div style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
             <p><strong>Package Content:</strong> {o.products.map(p => `${p.name} (x${p.quantity})`).join(', ')}</p>
             <p><strong>Customer Transport:</strong> {o.customerDetails?.address || 'N/A'}</p>
             <p><strong>Customer Alias:</strong> {o.customerDetails?.username || 'Guest'} | <strong>Contact:</strong> {o.customerDetails?.email || 'N/A'}</p>
             <p><strong>Payment Strategy:</strong> {o.paymentMethod?.toUpperCase()}</p>
           </div>
         </div>
      ))}
      {orders.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No orders found on the platform yet.</p>}
    </div>
  );

  const renderUsers = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2>System Users Directory</h2>
      {usersList.map(u => (
         <div key={u.id} className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
           <div className="admin-user-row">
             <strong style={{ fontSize: '1.1rem' }}>{u.name || u.username} <span style={{ color:'var(--text-muted)', fontSize:'0.9rem', fontWeight:400 }}>@{u.username}</span></strong>
             <span style={{ color: 'var(--text-muted)' }}>{u.email}</span>
             <span style={{ justifySelf: 'end', fontWeight: 800, padding: '0.4rem 1rem', borderRadius: '20px', background: u.role === 'admin' ? 'var(--bg-main)' : (u.role === 'delivery' ? '#EBF8FF' : '#F0FFF4'), color: u.role === 'admin' ? 'var(--text-main)' : (u.role === 'delivery' ? '#3182CE' : '#38A169') }}>
               {u.role.toUpperCase()}
             </span>
           </div>
           <div style={{ display: 'flex', flexWrap:'wrap', gap: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop:'1rem', fontSize: '0.9rem' }}>
             <div><strong>Phone:</strong> {u.phone || 'N/A'}</div>
             <div><strong>Address:</strong> {u.address || 'N/A'}</div>
             <div style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>Joined: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</div>
           </div>
         </div>
      ))}
    </div>
  );

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ marginBottom: '2rem' }}>Admin Control Center</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <button className={tab === 'analytics' ? 'premium-gradient' : ''} onClick={() => setTab('analytics')} style={{ padding: '0.8rem 1.5rem', borderRadius: 'var(--radius)', background: tab === 'analytics' ? '' : 'transparent', color: tab === 'analytics' ? 'white' : 'var(--text-muted)', fontWeight: 700 }}>Analytics</button>
        <button className={tab === 'products' ? 'premium-gradient' : ''} onClick={() => setTab('products')} style={{ padding: '0.8rem 1.5rem', borderRadius: 'var(--radius)', background: tab === 'products' ? '' : 'transparent', color: tab === 'products' ? 'white' : 'var(--text-muted)', fontWeight: 700 }}>Products</button>
        <button className={tab === 'orders' ? 'premium-gradient' : ''} onClick={() => setTab('orders')} style={{ padding: '0.8rem 1.5rem', borderRadius: 'var(--radius)', background: tab === 'orders' ? '' : 'transparent', color: tab === 'orders' ? 'white' : 'var(--text-muted)', fontWeight: 700 }}>User Orders</button>
        <button className={tab === 'users' ? 'premium-gradient' : ''} onClick={() => setTab('users')} style={{ padding: '0.8rem 1.5rem', borderRadius: 'var(--radius)', background: tab === 'users' ? '' : 'transparent', color: tab === 'users' ? 'white' : 'var(--text-muted)', fontWeight: 700 }}>Partners/Users</button>
      </div>
      {tab === 'analytics' && renderAnalytics()}
      {tab === 'products' && renderProducts()}
      {tab === 'orders' && renderOrders()}
      {tab === 'users' && renderUsers()}
    </div>
  );
};

export const DeliveryDashboard = () => {
  const { orders, updateOrder } = useProduct();
  const { user } = useAuth();
  // Viewing confirmed or out-for-delivery orders assigned to this delivery partner
  const assignedOrders = orders.filter(o => 
    o.deliveryPartnerId === user?.uid && 
    (o.status === 'confirmed' || o.status === 'in_transit')
  );

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <h1 style={{ marginBottom: '2rem' }}>Delivery Tasks</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {assignedOrders.map(order => (
          <div key={order.id} className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', borderLeft: '8px solid var(--secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3>Order #{order.orderNumber}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                  <MapPin size={20} color="var(--accent)" />
                  <div>
                    <p><strong>{order.customerDetails.username}</strong></p>
                    <p style={{ color: 'var(--text-muted)' }}>{order.customerDetails.address}</p>
                    <p style={{ fontSize: '0.85rem' }}>Phone: {order.customerDetails.phone || '987 654 43210'}</p>
                  </div>
                </div>
              </div>
              <div>
                <button 
                  onClick={() => updateOrder(order.id, { status: 'delivered' })}
                  className="premium-gradient hover-scale" 
                  style={{ padding: '1rem 2rem', borderRadius: 'var(--radius)', color: 'white', fontWeight: 800 }}
                >
                  Mark as Delivered
                </button>
              </div>
            </div>
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-main)', borderRadius: 'var(--radius)' }}>
              <strong>Items to deliver:</strong>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                {order.products.map(p => <span key={p.id} style={{ fontSize: '0.85rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid var(--border)' }}>{p.name} (x{p.quantity})</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProfilePage = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const [profile, setProfile] = useState({ 
    username: user?.username || '', 
    email: user?.email || '', 
    phone: user?.phone || '', 
    address: user?.address || '',
    password: '' 
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const updates = {
        username: profile.username,
        phone: profile.phone,
        address: profile.address
      };
      await updateUserProfile(updates);
      alert('Profile Updated Successfully!');
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return <div className="container" style={{ padding: '4rem 0' }}>Please log in...</div>;

  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h1>Profile Management</h1>
        <button 
          onClick={handleLogout}
          style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', background: '#FFF5F5', color: 'var(--accent)', border: '1px solid #FED7D7', fontWeight: 700 }}
        >
          Logout
        </button>
      </div>
      <div className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label>Username</label>
              <input value={profile.username} onChange={e => setProfile({...profile, username: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', marginTop: '0.5rem' }} />
            </div>
            <div>
              <label>Email (Read-only)</label>
              <input value={profile.email} readOnly disabled style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', marginTop: '0.5rem', background: '#f0f0f0' }} />
            </div>
            <div>
              <label>Phone</label>
              <input value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', marginTop: '0.5rem' }} />
            </div>
            <div>
              <label>Password (Change via Email link)</label>
              <input type="password" placeholder="********" disabled style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', marginTop: '0.5rem', background: '#f0f0f0' }} />
            </div>
          </div>
          <div>
            <label>Address</label>
            <textarea value={profile.address || ''} onChange={e => setProfile({...profile, address: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', marginTop: '0.5rem', height: '100px' }} />
          </div>
          <button className="premium-gradient hover-scale" onClick={handleUpdate} disabled={loading} style={{ padding: '1.2rem', borderRadius: '12px', color: 'white', fontWeight: 800, marginTop: '1rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
