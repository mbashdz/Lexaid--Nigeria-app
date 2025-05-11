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
  writeBatch,
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
  photoURL?: string | null; // Added for Google Sign-In
  phoneNumber?: string;
  emailNotifications?: boolean;
  inAppNotifications?: boolean;
  createdAt?: Timestamp;
  lastModified?: Timestamp;
}

// Types for Cases
export interface Case {
    id?: string;
    userId: string;
    title: string;
    caseNumber?: string;
    court?: string;
    clientName?: string; // Main client this case belongs to
    opponentName?: string; // Main opponent
    parties?: string; // Detailed parties if needed, beyond simple client/opponent
    status: 'Open' | 'Closed' | 'Adjourned' | 'Pending';
    priority?: 'High' | 'Medium' | 'Low';
    nextAdjournmentDate?: Timestamp | null;
    caseNotes?: string;
    relatedDocumentIds?: string[]; // Store IDs of drafts related to this case
    createdAt: Timestamp;
    lastModified: Timestamp;
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

export async function updateDraft(draftId: string, data: Partial<Omit<Draft, 'id' | 'userId' | 'createdAt'>>): Promise<void> {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured.");
  const draftDoc = doc(db, 'drafts', draftId);
  await updateDoc(draftDoc, { ...data, lastModified: serverTimestamp() });
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

export async function updateClause(clauseId: string, data: Partial<Omit<Clause, 'id' | 'userId' | 'createdAt'>>): Promise<void> {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured.");
  const clauseDoc = doc(db, 'clauses', clauseId);
  await updateDoc(clauseDoc, { ...data, lastModified: serverTimestamp() });
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
  const docSnap = await getDoc(userDocRef);

  const profileData: UserProfile = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || 'New User',
    photoURL: user.photoURL,
    emailNotifications: true,
    inAppNotifications: true,
    lastModified: serverTimestamp() as Timestamp,
  };

  if (!docSnap.exists()) {
    // New user, set createdAt
    profileData.createdAt = serverTimestamp() as Timestamp;
    await setDoc(userDocRef, profileData);
  } else {
    // Existing user, update relevant fields (e.g., displayName or photoURL might change via Google)
    const existingData = docSnap.data() as UserProfile;
    const updates: Partial<UserProfile> = { lastModified: serverTimestamp() as Timestamp };
    if (user.displayName && user.displayName !== existingData.displayName) {
        updates.displayName = user.displayName;
    }
    if (user.photoURL && user.photoURL !== existingData.photoURL) {
        updates.photoURL = user.photoURL;
    }
     if (user.email && user.email !== existingData.email) { // Email might change if user verified a new one
        updates.email = user.email;
    }
    // Only update if there are actual changes to displayName, photoURL, or email beyond lastModified
    if (Object.keys(updates).length > 1) {
        await updateDoc(userDocRef, updates);
    } else {
        // if only lastModified is to be updated (e.g. login event)
        await updateDoc(userDocRef, { lastModified: serverTimestamp() as Timestamp });
    }
  }
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured.");
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, { ...data, lastModified: serverTimestamp() });
}


// --- Case Management Functions ---

export async function addCase(userId: string, caseData: Omit<Case, 'id' | 'userId' | 'createdAt' | 'lastModified' | 'relatedDocumentIds'>): Promise<string> {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured.");
  const casesCollection = collection(db, 'cases');
  const docRef = await addDoc(casesCollection, {
    ...caseData,
    userId,
    relatedDocumentIds: [],
    createdAt: serverTimestamp(),
    lastModified: serverTimestamp(),
  });
  return docRef.id;
}

export async function getUserCases(userId: string): Promise<Case[]> {
  if (!isFirebaseConfigured) return [];
  const casesCollection = collection(db, 'cases');
  const q = query(casesCollection, where('userId', '==', userId), orderBy('lastModified', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Case));
}

export async function updateCase(caseId: string, data: Partial<Omit<Case, 'id' | 'userId' | 'createdAt'>>): Promise<void> {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured.");
  const caseDoc = doc(db, 'cases', caseId);
  await updateDoc(caseDoc, { ...data, lastModified: serverTimestamp() });
}

export async function deleteCase(caseId: string): Promise<void> {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured.");
  // Potential: Add logic to also handle related documents or provide warnings.
  // For now, just deletes the case document.
  const caseDoc = doc(db, 'cases', caseId);
  await deleteDoc(caseDoc);
}

export async function getCase(caseId: string): Promise<Case | null> {
    if (!isFirebaseConfigured) return null;
    const caseDocRef = doc(db, 'cases', caseId);
    const docSnap = await getDoc(caseDocRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Case;
    }
    return null;
}

// Example of associating a draft with a case
export async function linkDraftToCase(caseId: string, draftId: string): Promise<void> {
    if (!isFirebaseConfigured) throw new Error("Firebase not configured.");
    const caseDocRef = doc(db, 'cases', caseId);
    const caseSnap = await getDoc(caseDocRef);
    if (caseSnap.exists()) {
        const caseData = caseSnap.data() as Case;
        const relatedDocumentIds = caseData.relatedDocumentIds || [];
        if (!relatedDocumentIds.includes(draftId)) {
            await updateDoc(caseDocRef, {
                relatedDocumentIds: [...relatedDocumentIds, draftId],
                lastModified: serverTimestamp()
            });
        }
    } else {
        throw new Error("Case not found.");
    }
}
