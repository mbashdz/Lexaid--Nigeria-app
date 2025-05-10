// src/services/firestoreService.ts
import { db, auth, isFirebaseConfigured } from '@/lib/firebase/client';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  setDoc,
  getDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';

// Types for Drafts
export interface Draft {
  id?: string;
  userId: string;
  documentType: string;
  content: string;
  title: string; // e.g., "Statement of Claim - Project Alpha" or from documentTypeConfig.name
  createdAt: Timestamp;
  lastModified: Timestamp;
}

// Types for Clauses
export interface Clause {
  id?: string;
  userId: string;
  title: string;
  content: string;
  category?: string; // Optional category
  createdAt: Timestamp;
  lastModified: Timestamp;
}

// Types for User Profile
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber?: string;
  // Notification preferences can be added here
  emailNotifications?: boolean;
  inAppNotifications?: boolean;
}


// --- Draft Functions ---

export async function addDraft(userId: string, documentType: string, title: string, content: string): Promise<string> {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured.");
  const draftsCollection = collection(db, 'drafts');
  const docRef = await addDoc(draftsCollection, {
    userId,
    documentType,
    title,
    content,
    createdAt: serverTimestamp(),
    lastModified: serverTimestamp(),
  });
  return docRef.id;
}

export async function getUserDrafts(userId: string): Promise<Draft[]> {
  if (!isFirebaseConfigured) return [];
  const draftsCollection = collection(db, 'drafts');
  const q = query(draftsCollection, where('userId', '==', userId), orderBy('lastModified', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Draft));
}

export async function deleteDraft(draftId: string): Promise<void> {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured.");
  const draftDoc = doc(db, 'drafts', draftId);
  await deleteDoc(draftDoc);
}

export async function getDraft(draftId: string): Promise<Draft | null> {
    if (!isFirebaseConfigured) return null;
    const draftDoc = doc(db, 'drafts', draftId);
    const docSnap = await getDoc(draftDoc);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Draft;
    }
    return null;
}


// --- Clause Functions ---

export async function addClause(userId: string, title: string, content: string, category?: string): Promise<string> {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured.");
  const clausesCollection = collection(db, 'clauses');
  const docRef = await addDoc(clausesCollection, {
    userId,
    title,
    content,
    category: category || 'General',
    createdAt: serverTimestamp(),
    lastModified: serverTimestamp(),
  });
  return docRef.id;
}

export async function getUserClauses(userId: string): Promise<Clause[]> {
  if (!isFirebaseConfigured) return [];
  const clausesCollection = collection(db, 'clauses');
  const q = query(clausesCollection, where('userId', '==', userId), orderBy('lastModified', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Clause));
}

export async function deleteClause(clauseId: string): Promise<void> {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured.");
  const clauseDoc = doc(db, 'clauses', clauseId);
  await deleteDoc(clauseDoc);
}

// --- User Profile Functions ---

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured) return null;
  const userDocRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userDocRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
}

export async function createUserProfile(user: User): Promise<void> {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured.");
  const userDocRef = doc(db, 'users', user.uid);
  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || 'New User', // Default display name
    emailNotifications: true, // Default preferences
    inAppNotifications: true,
  };
  await setDoc(userDocRef, userProfile);
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured.");
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, { ...data, lastModified: serverTimestamp() });
}
