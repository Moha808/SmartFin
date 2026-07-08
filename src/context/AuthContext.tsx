import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  familyId?: string;
  role?: 'superadmin' | 'owner' | 'member' | 'solo';
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (e: string, p: string) => Promise<void>;
  signup: (n: string, e: string, p: string, userType: 'family_admin' | 'solo_user' | 'join_family', inviteCode?: string) => Promise<void>;
  joinFamily: (inviteCode: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid: string, userAuth: any) => {
    let familyId: string | undefined;
    let role: 'superadmin' | 'owner' | 'member' | 'solo' | undefined;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        familyId = userDoc.data().familyId;
        role = userDoc.data().role;
      }
    } catch(e) {
      console.error("Error fetching user data", e);
    }

    setCurrentUser({
      uid,
      displayName: userAuth.displayName || userAuth.email?.split('@')[0] || 'User',
      email: userAuth.email,
      photoURL: userAuth.photoURL || null,
      familyId,
      role
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchUserData(user.uid, user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (name: string, email: string, pass: string, userType: 'family_admin' | 'solo_user' | 'join_family', inviteCode?: string) => {
    if (userType === 'join_family' && inviteCode) {
      const familyDoc = await getDoc(doc(db, 'families', inviteCode));
      if (!familyDoc.exists()) {
        throw new Error("Invalid family invite code");
      }
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    if (userCredential.user) {
      const uid = userCredential.user.uid;
      await updateProfile(userCredential.user, {
        displayName: name
      });

      let familyId: string | undefined = undefined;
      let role: 'superadmin' | 'owner' | 'member' | 'solo' = 'member';

      if (email === 'super@gmail.com') {
        role = 'superadmin';
      } else if (userType === 'join_family' && inviteCode) {
        familyId = inviteCode;
        role = 'member';
      } else if (userType === 'family_admin') {
        const newFamilyRef = doc(collection(db, 'families'));
        familyId = newFamilyRef.id;
        role = 'owner';
        await setDoc(newFamilyRef, {
          id: familyId,
          name: `${name}'s Family`,
          ownerId: uid,
          createdAt: Date.now()
        });
      } else if (userType === 'solo_user') {
        role = 'solo';
        familyId = undefined; // Solo user doesn't belong to a family yet
      }

      await setDoc(doc(db, 'users', uid), {
        uid,
        email,
        displayName: name,
        familyId: familyId || null,
        role,
        createdAt: Date.now()
      });

      setCurrentUser({
        uid,
        displayName: name,
        email,
        photoURL: userCredential.user.photoURL || null,
        familyId,
        role
      });
    }
  };

  const joinFamily = async (inviteCode: string) => {
    if (!currentUser) return;
    
    const familyDoc = await getDoc(doc(db, 'families', inviteCode));
    if (!familyDoc.exists()) {
      throw new Error("Invalid family invite code");
    }

    await updateDoc(doc(db, 'users', currentUser.uid), {
      familyId: inviteCode,
      role: 'member'
    });

    setCurrentUser({
      ...currentUser,
      familyId: inviteCode,
      role: 'member'
    });
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const resetPassword = async (_email: string) => {
    // TODO: implement password reset
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, signup, joinFamily, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
