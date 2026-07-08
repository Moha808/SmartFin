import { collection, addDoc, deleteDoc, doc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Transaction {
  id?: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  note: string;
  userId: string;
  familyId: string;
  createdAt: number;
}

export interface Budget {
  id?: string;
  category: string;
  limit: number;
  spent: number;
  userId: string;
  familyId: string;
}

// TRANSACTIONS
export const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  const transactionsRef = collection(db, 'transactions');
  const docRef = await addDoc(transactionsRef, transaction);
  return docRef.id;
};

export const deleteTransaction = async (id: string) => {
  const docRef = doc(db, 'transactions', id);
  await deleteDoc(docRef);
};

export const updateTransaction = async (id: string, data: Partial<Transaction>) => {
  const docRef = doc(db, 'transactions', id);
  await updateDoc(docRef, data);
};

// BUDGETS
export const addOrUpdateBudget = async (budget: Omit<Budget, 'id' | 'spent'>) => {
  // Check if budget for this category exists for this user
  const budgetsRef = collection(db, 'budgets');
  const q = query(
    budgetsRef, 
    where('familyId', '==', budget.familyId), 
    where('category', '==', budget.category)
  );
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    // Update existing budget
    const docId = snapshot.docs[0].id;
    await updateDoc(doc(db, 'budgets', docId), { limit: budget.limit });
  } else {
    // Add new budget
    await addDoc(budgetsRef, { ...budget, spent: 0 });
  }
};

export const deleteBudget = async (id: string) => {
  const docRef = doc(db, 'budgets', id);
  await deleteDoc(docRef);
};

// FAMILY MANAGEMENT
export const getFamilyMembers = async (familyId: string) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('familyId', '==', familyId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
};

// SUPER ADMIN
export const getAdminStats = async () => {
  const usersRef = collection(db, 'users');
  const familiesRef = collection(db, 'families');
  const transactionsRef = collection(db, 'transactions');

  const [usersSnap, familiesSnap, transactionsSnap] = await Promise.all([
    getDocs(usersRef),
    getDocs(familiesRef),
    getDocs(transactionsRef)
  ]);

  let totalVolume = 0;
  transactionsSnap.docs.forEach(doc => {
    totalVolume += doc.data().amount || 0;
  });

  const admins = usersSnap.docs
    .map(doc => doc.data())
    .filter(user => user.role === 'owner');

  return {
    totalUsers: usersSnap.size,
    totalFamilies: familiesSnap.size,
    totalTransactionVolume: totalVolume,
    admins
  };
};
