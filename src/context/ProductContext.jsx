import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const ProductContext = createContext();

const initialProducts = [
  {
    id: "1",
    name: "Pure Kanchipuram Silk Saree - Royal Gold",
    price: 18500,
    discount: 10,
    stock: 12,
    category: "Pure Silk",
    description: "Authentic hand-woven silk with intricate gold zari borders. Perfect for grand weddings and classic style.",
    images: [
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800"
    ],
    sizes: ["Standard 6.3m"],
    colors: ["Boutique Violet", "Temple Red"],
    ratings: [{ user: "Admin", rating: 5, comment: "Exquisite craftsmanship!", date: "2026-03-01" }]
  },
  {
    id: "2",
    name: "Handcrafted Cotton Sherwani - Ivory Luxe",
    price: 12999,
    discount: 15,
    stock: 8,
    category: "Readymades",
    description: "Tailored to perfection with premium Egyptian cotton and hand-embroidered details.",
    images: [
      "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1598209279122-8541213a03a7?auto=format&fit=crop&q=80&w=800"
    ],
    sizes: ["M", "L", "XL"],
    colors: ["Ivory White", "Champagne Gold"],
    ratings: []
  },
  {
    id: "3",
    name: "Linen Summer Tunic - Azure Glow",
    price: 3499,
    discount: 20,
    stock: 45,
    category: "Linen",
    description: "Breathable, high-grade linen for effortless daily elegance. A true textile essential.",
    images: [
      "https://images.unsplash.com/photo-1594932224036-9c6bc7db6746?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=800"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Sky Blue", "Soft Rose"],
    ratings: []
  }
];

export const ProductProvider = ({ children }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Keep cart in localStorage for transient guest persistence
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('ske_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('ske_cart', JSON.stringify(cart));
  }, [cart]);

  // Real-time synchronization with Firestore
  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      
      // Seed Demo Data if completely empty (Initial Setup Helper)
      if (prods.length === 0 && !localStorage.getItem('ske_seeded') && user?.role === 'admin') {
        initialProducts.forEach(async p => await setDoc(doc(db, 'products', p.id), p));
        localStorage.setItem('ske_seeded', 'true');
      }
      setProducts(prods);
    }, (error) => console.error(error));

    let q;
    if (user?.role === 'admin' || user?.role === 'delivery') {
      q = collection(db, 'orders'); // Authorized roles can bypass constraints
    } else if (user?.uid) {
      q = query(collection(db, 'orders'), where('userId', '==', user.uid)); // Strict query constraint for Standard Customers
    } else {
      setOrders([]);
      setLoading(false);
      return () => unsubProducts(); // Only cleanup products if no user
    }

    const unsubOrders = onSnapshot(q, (snapshot) => {
      const ords = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      // Sort newest first
      setOrders(ords.sort((a,b) => new Date(b.date) - new Date(a.date)));
      setLoading(false);
    }, (error) => {
      console.error("Orders Query Restriction Error:", error);
      setLoading(false);
    });

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, [user]);

  const addToCart = (product, quantity = 1, size = '', color = '') => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.size === size && item.color === color);
      if (existing) {
        return prev.map(item => item.id === product.id && item.size === size && item.color === color ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...product, quantity, size, color }];
    });
  };

  const removeFromCart = (id, size, color) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.size === size && item.color === color)));
  };

  const clearCart = () => setCart([]);

  // Centralized Cart Calculations
  const getCartTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * (1 - (item.discount || 0) / 100)) * item.quantity, 0);
    const tax = subtotal * 0.18; // Fixed 18% GST estimate
    const shipping = subtotal > 500 || subtotal === 0 ? 0 : 50; // Free shipping > ₹500
    const total = subtotal + tax + shipping;
    return { subtotal, tax, shipping, total };
  };

  // Add Review
  const addReview = async (productId, reviewInput) => {
    const product = products.find(p => p.id === productId);
    if (!product) throw new Error("Product not found");
    const updatedRatings = [...(product.ratings || []), reviewInput];
    await setDoc(doc(db, 'products', productId), { ratings: updatedRatings }, { merge: true });
  };

  // Firestore Write Operations
  const addOrder = async (order) => {
    try {
      await setDoc(doc(db, 'orders', order.id), order);
      clearCart();
    } catch (error) {
      console.error("Error adding order: ", error);
      alert("Failed to place order. Check permissions.");
    }
  };

  const addProduct = async (p) => {
    if (!p.id) p.id = Date.now().toString();
    await setDoc(doc(db, 'products', p.id), p);
  };

  const updateProduct = async (p) => {
    await setDoc(doc(db, 'products', p.id), p, { merge: true });
  };

  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, 'products', id));
  };

  const updateOrder = async (orderId, updates) => {
    await setDoc(doc(db, 'orders', orderId), updates, { merge: true });
  };

  return (
    <ProductContext.Provider value={{ 
      products, setProducts, cart, addToCart, removeFromCart, clearCart, getCartTotals, orders, addOrder,
      addProduct, updateProduct, deleteProduct, updateOrder, addReview, loading
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => useContext(ProductContext);
