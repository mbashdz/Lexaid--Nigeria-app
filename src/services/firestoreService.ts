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
  photoURL?: string | null;
  phoneNumber?: string;
  emailNotifications?: boolean;
  inAppNotifications?: boolean;
  createdAt?: Timestamp;
  lastModified?: Timestamp;
  subscriptionPlan?: 'Free Trial' | 'LexAid Plus' | 'LexAid Premium' | 'Enterprise' | string; // string for future plans
  subscriptionId?: string; // e.g., Flutterwave transaction ID or your internal subscription ID
  subscriptionStatus?: 'active' | 'inactive' | 'cancelled' | 'past_due'; // More detailed status
  subscriptionStartDate?: Timestamp;
  subscriptionEndDate?: Timestamp; // If applicable for fixed-term or trial
  flutterwaveCustomerId?: string; // Optional: if you store Flutterwave's customer ID
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

  const profileData: Partial<UserProfile> = { // Use Partial for initial construction flexibility
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || 'New User',
    photoURL: user.photoURL,
    lastModified: serverTimestamp() as Timestamp,
  };

  if (!docSnap.exists()) {
    // New user, set createdAt and default subscription
    profileData.createdAt = serverTimestamp() as Timestamp;
    profileData.emailNotifications = true; // Default value
    profileData.inAppNotifications = true; // Default value
    profileData.subscriptionPlan = 'Free Trial'; // Default plan
    profileData.subscriptionStatus = 'active';
    profileData.subscriptionStartDate = serverTimestamp() as Timestamp;
    // For a 1-month trial, calculate end date (simplified, more robust logic needed for exact date math)
    const trialEndDate = new Date();
    trialEndDate.setMonth(trialEndDate.getMonth() + 1);
    profileData.subscriptionEndDate = Timestamp.fromDate(trialEndDate);

    await setDoc(userDocRef, profileData as UserProfile); // Cast to UserProfile for setDoc
  } else {
    // Existing user, update relevant fields
    const existingData = docSnap.data() as UserProfile;
    const updates: Partial<UserProfile> = { lastModified: serverTimestamp() as Timestamp };
    if (user.displayName && user.displayName !== existingData.displayName) {
        updates.displayName = user.displayName;
    }
    if (user.photoURL && user.photoURL !== existingData.photoURL) {
        updates.photoURL = user.photoURL;
    }
     if (user.email && user.email !== existingData.email) {
        updates.email = user.email;
    }
    // If user logs in and had no plan before (e.g. old account before subscription field)
    if (!existingData.subscriptionPlan) {
        updates.subscriptionPlan = 'Free Trial';
        updates.subscriptionStatus = 'active';
        updates.subscriptionStartDate = serverTimestamp() as Timestamp;
        const trialEndDate = new Date();
        trialEndDate.setMonth(trialEndDate.getMonth() + 1);
        updates.subscriptionEndDate = Timestamp.fromDate(trialEndDate);
    }
    if (Object.keys(updates).length > 1 || !existingData.subscriptionPlan) { // check if more than just lastModified is updated OR if plan was missing
        await updateDoc(userDocRef, updates);
    } else {
        await updateDoc(userDocRef, { lastModified: serverTimestamp() as Timestamp });
    }
  }
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured.");
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, { ...data, lastModified: serverTimestamp() });
}

export async function updateUserSubscription(userId: string, planName: string, transactionId: string, planId: string): Promise<void> {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured.");
  const userDocRef = doc(db, 'users', userId);

  const subscriptionData: Partial<UserProfile> = {
    subscriptionPlan: planName as UserProfile['subscriptionPlan'], // Cast to ensure type safety
    subscriptionId: transactionId,
    subscriptionStatus: 'active',
    subscriptionStartDate: serverTimestamp() as Timestamp,
    lastModified: serverTimestamp() as Timestamp,
  };

  // Define subscription end date based on plan (simplified: 1 month for paid plans)
  // In a real app, this would be more robust, e.g., using plan metadata
  const subscriptionEndDate = new Date();
  if (planId === 'plus' || planId === 'premium') {
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
    subscriptionData.subscriptionEndDate = Timestamp.fromDate(subscriptionEndDate);
  } else {
    // For other cases or if no specific duration is defined for a plan,
    // you might not set an end date or handle it differently.
    // For now, remove it if it's not a monthly plan with clear duration.
    delete subscriptionData.subscriptionEndDate;
  }
  

  await updateDoc(userDocRef, subscriptionData);
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
