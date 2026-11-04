import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  getDocFromServer,
  query,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Security / Operation Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection at app startup
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline. Local cache will be utilized.');
    }
    return false;
  }
}

// User Profile Database Ops
export interface UserProfileData {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  subscriptionPlan: 'trial' | 'monthly' | '1-year' | '2-year';
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'cancelled';
  trialEndsAt: string;
  protocol: string;
  killSwitch: boolean;
  cyberShield: boolean;
  biometricEnabled: boolean;
  totalUploadBytes: number;
  totalDownloadBytes: number;
  threatsBlocked: number;
  lastConnectedServer: string;
  createdAt: string;
  updatedAt: string;
}

export async function getUserProfile(userId: string): Promise<UserProfileData | null> {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return snap.data() as UserProfileData;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function syncUserProfile(profile: UserProfileData): Promise<void> {
  const path = `users/${profile.userId}`;
  try {
    await setDoc(doc(db, 'users', profile.userId), {
      ...profile,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function recordVpnSession(userId: string, session: any): Promise<void> {
  const path = `users/${userId}/sessions/${session.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'sessions', session.id), session);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function recordInvoice(userId: string, invoice: any): Promise<void> {
  const path = `users/${userId}/invoices/${invoice.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'invoices', invoice.id), invoice);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function getUserSessions(userId: string): Promise<any[]> {
  const path = `users/${userId}/sessions`;
  try {
    const q = query(collection(db, 'users', userId, 'sessions'), limit(15));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}
