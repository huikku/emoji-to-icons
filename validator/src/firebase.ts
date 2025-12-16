import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Only initialize if we have the required config
const hasConfig = firebaseConfig.apiKey && firebaseConfig.projectId;

const app = hasConfig ? initializeApp(firebaseConfig) : null;
const db = app ? getFirestore(app) : null;

// Create a document ID from emoji + library (safe for Firestore)
function createVoteId(emoji: string, library: string): string {
  // Convert emoji to hex code points for safe document ID
  const emojiHex = [...emoji].map(char => char.codePointAt(0)?.toString(16)).join('_');
  return `${library}_${emojiHex}`;
}

export interface VoteCounts {
  upvotes: number;
  downvotes: number;
}

export async function getVotes(emoji: string, library: string): Promise<VoteCounts | null> {
  if (!db) return null;
  
  try {
    const voteId = createVoteId(emoji, library);
    const docRef = doc(db, 'votes', voteId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { upvotes: data.upvotes || 0, downvotes: data.downvotes || 0 };
    }
    return { upvotes: 0, downvotes: 0 };
  } catch (error) {
    console.error('Error getting votes:', error);
    return null;
  }
}

export async function vote(
  emoji: string,
  icon: string,
  library: string,
  type: 'up' | 'down'
): Promise<boolean> {
  if (!db) return false;
  
  try {
    const voteId = createVoteId(emoji, library);
    const docRef = doc(db, 'votes', voteId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      // Update existing document
      await updateDoc(docRef, {
        [type === 'up' ? 'upvotes' : 'downvotes']: increment(1),
      });
    } else {
      // Create new document
      await setDoc(docRef, {
        emoji,
        icon,
        library,
        upvotes: type === 'up' ? 1 : 0,
        downvotes: type === 'down' ? 1 : 0,
      });
    }
    return true;
  } catch (error) {
    console.error('Error voting:', error);
    return false;
  }
}

export function isFirebaseConfigured(): boolean {
  return hasConfig;
}

