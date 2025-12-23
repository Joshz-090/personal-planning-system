import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/Firebase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Register new user
  const register = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile in Firestore
      const userProfileData = {
        name: name || email.split('@')[0],
        email: email,
        timeFormat: '24',
        calendarPreference: 'gregorian',
        themeMode: 'light',
        plan: 'free',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), {
        profile: userProfileData,
        settings: userProfileData
      });

      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Send password reset email
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Load user profile from Firestore
  const loadUserProfile = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserProfile(data.profile || data.settings || {});
        return data;
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
    return null;
  };

  // Update user profile
  const updateProfile = async (updates) => {
    if (!currentUser) return { success: false, error: 'No user logged in' };

    try {
      await setDoc(
        doc(db, 'users', currentUser.uid),
        { profile: { ...userProfile, ...updates }, settings: { ...userProfile, ...updates } },
        { merge: true }
      );
      setUserProfile(prev => ({ ...prev, ...updates }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Real-time listener for user profile
  useEffect(() => {
    let unsubscribe = () => {};
    
    if (currentUser) {
      unsubscribe = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Merge root data with profile/settings for convenience
          setUserProfile({ 
            id: docSnap.id, 
            ...data, 
            ...(data.profile || {}),
            ...(data.settings || {})
          });
        }
      });
    }

    return () => unsubscribe();
  }, [currentUser]);

  // Helper for authorized API calls
  const authFetch = async (url, options = {}) => {
    if (!currentUser) throw new Error('Not authenticated');
    
    const token = await currentUser.getIdToken();
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };

    return fetch(url, { ...options, headers });
  };

  const value = {
    currentUser,
    userProfile,
    register,
    login,
    logout,
    resetPassword,
    updateProfile,
    loadUserProfile,
    authFetch
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

