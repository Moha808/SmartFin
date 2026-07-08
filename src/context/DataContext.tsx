import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import type { Transaction, Budget } from '../services/api';

interface DataContextType {
  transactions: Transaction[];
  budgets: Budget[];
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setTransactions([]);
      setBudgets([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    let qTransactions;
    let qBudgets;

    if (currentUser.role === 'solo') {
      qTransactions = query(
        collection(db, 'transactions'),
        where('userId', '==', currentUser.uid)
      );
      qBudgets = query(
        collection(db, 'budgets'),
        where('userId', '==', currentUser.uid)
      );
    } else if (currentUser.familyId) {
      // Both 'owner' and 'member' can see all transactions and budgets for the family
      qTransactions = query(
        collection(db, 'transactions'),
        where('familyId', '==', currentUser.familyId)
      );
      qBudgets = query(
        collection(db, 'budgets'),
        where('familyId', '==', currentUser.familyId)
      );
    } else {
      // For any other unexpected state (e.g. superadmin), don't load user data here
      setLoading(false);
      return;
    }

    const unsubscribeTransactions = onSnapshot(
      qTransactions,
      (snapshot) => {
        const txs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Transaction[];
        // Sort in-memory instead of requiring a Firestore index
        txs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setTransactions(txs);
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to transactions:", error);
        setLoading(false);
      }
    );

    // Listen to budgets
    const unsubscribeBudgets = onSnapshot(
      qBudgets,
      (snapshot) => {
        const bgts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Budget[];
        setBudgets(bgts);
      },
      (error) => {
        console.error("Error listening to budgets:", error);
      }
    );

    return () => {
      unsubscribeTransactions();
      unsubscribeBudgets();
    };
  }, [currentUser]);

  // Recalculate spent for budgets whenever transactions or budgets change
  const computedBudgets = budgets.map(budget => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === budget.category)
      .reduce((acc, curr) => acc + curr.amount, 0);
    return { ...budget, spent };
  });

  return (
    <DataContext.Provider value={{ transactions, budgets: computedBudgets, loading }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
