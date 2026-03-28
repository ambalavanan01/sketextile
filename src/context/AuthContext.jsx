import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  confirmPasswordReset as firebaseConfirmPasswordReset
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch additional user details from Firestore
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setUser({ ...docSnap.data(), uid: firebaseUser.uid });
          } else {
            setUser(firebaseUser); // Fallback if no matching standard doc exists yet
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (identifier, password) => {
    try {
      let loginEmail = identifier;
      let isAdminAttempt = false;

      // Check if identifier is an email (contains @). If not, it's a username.
      if (!identifier.includes('@')) {
        // Auto-map the requested Admin username to their actual Firebase Auth Email
        if (identifier === 'sketextiles@admin' && password === 'sketextiles@admin123') {
          loginEmail = 'nikeshshivan12@gmail.com';
          isAdminAttempt = true;
        } else {
          // Standard Username Lookup in Firestore
          const { collection, query, where, getDocs } = await import('firebase/firestore');
          const q = query(collection(db, 'users'), where('username', '==', identifier));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            loginEmail = querySnapshot.docs[0].data().email;
          } else {
            throw new Error(`SKE ID "${identifier}" not found. Please check your credentials or join us!`);
          }
        }
      }

      try {
        // Normal Firebase Flow
        const { user: authedUser } = await signInWithEmailAndPassword(auth, loginEmail, password);
        
        // Check Email Verification (Skip for Admin)
        if (!isAdminAttempt && !authedUser.emailVerified) {
          await signOut(auth); // Sign out if not verified
          throw new Error("unverified-email");
        }
        
        // Force Upgrade the Admin Account (In case it was accidentally registered as a regular customer previously)
        if (isAdminAttempt) {
          try {
             await setDoc(doc(db, 'users', authedUser.uid), {
                username: 'sketextiles@admin',
                role: 'admin'
             }, { merge: true });
          } catch(e) { console.error("Admin upgrade bypass silently failed:", e); }
        }
        
      } catch (signInErr) {
        // Automatically bootstrap the Admin account if it hasn't been created in Firebase yet
        if (isAdminAttempt && (signInErr.code?.includes('invalid-credential') || signInErr.code?.includes('user-not-found'))) {
          const { user: newAdmin } = await createUserWithEmailAndPassword(auth, loginEmail, password);
          await setDoc(doc(db, 'users', newAdmin.uid), {
            username: 'sketextiles@admin',
            email: loginEmail,
            role: 'admin',
            address: 'SKE System Backend',
            phone: 'N/A'
          });
          // Sign in should automatically succeed and trigger the onAuthStateChanged listener
        } else {
          if (signInErr.message === 'unverified-email') throw signInErr;
          throw new Error("Incorrect password or credentials. Please try again.");
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const signup = async (signupData) => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, signupData.email, signupData.password);
      
      // Send Firebase Email Verification
      await sendEmailVerification(firebaseUser);
      
      const newUser = {
        name: signupData.name || signupData.username,
        username: signupData.username,
        email: signupData.email,
        phone: signupData.phone,
        address: signupData.address,
        role: signupData.role || 'customer',
        createdAt: new Date().toISOString()
      };

      // Store additional details in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      
      return { ...newUser, uid: firebaseUser.uid };
    } catch (error) {
      throw error;
    }
  };

  const updateUserProfile = async (updates) => {
    if (!user?.uid) return;
    try {
      await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
      setUser(prev => ({ ...prev, ...updates }));
    } catch(err) {
      console.error(err);
      throw err;
    }
  }

  const sendPasswordReset = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  const confirmReset = async (code, newPassword) => {
    try {
      await firebaseConfirmPasswordReset(auth, code, newPassword);
    } catch (error) {
      throw error;
    }
  };

  const resendVerification = async (email, password) => {
    try {
      const { signInWithEmailAndPassword, sendEmailVerification, signOut } = await import('firebase/auth');
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(user);
      await signOut(auth);
    } catch (error) {
       throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, login, logout, signup, updateUserProfile, 
      sendPasswordReset, confirmReset, resendVerification, loading 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
