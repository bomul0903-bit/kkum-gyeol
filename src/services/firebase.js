'use client';

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
  addDoc,
  deleteDoc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';

// Firebase 설정 (환경변수에서 가져오기)
const firebaseConfig = JSON.parse(
  process.env.NEXT_PUBLIC_FIREBASE_CONFIG || '{}'
);

// Firebase 앱 초기화 (중복 방지)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// App ID
const appId = process.env.NEXT_PUBLIC_APP_ID || 'kkum-gyeol-app';

// 익명 로그인
export const signInAnonymousUser = async () => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error('Auth error:', error);
    throw error;
  }
};

// 인증 상태 구독
export const subscribeToAuth = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// 프로필 저장
export const saveProfile = async (userId, profileData) => {
  await setDoc(
    doc(db, 'artifacts', appId, 'users', userId, 'profile', 'data'),
    profileData
  );
};

// 프로필 구독
export const subscribeToProfile = (userId, callback) => {
  return onSnapshot(
    doc(db, 'artifacts', appId, 'users', userId, 'profile', 'data'),
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      } else {
        callback(null);
      }
    }
  );
};

// 꿈 목록 구독
export const subscribeToDreams = (userId, callback) => {
  return onSnapshot(
    collection(db, 'artifacts', appId, 'users', userId, 'dreams'),
    (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    }
  );
};

// 꿈 저장
export const saveDream = async (userId, dreamData) => {
  const dreamRef = await addDoc(
    collection(db, 'artifacts', appId, 'users', userId, 'dreams'),
    {
      ...dreamData,
      createdAt: serverTimestamp()
    }
  );
  return dreamRef.id;
};

// 꿈 삭제
export const deleteDream = async (userId, dreamId) => {
  await deleteDoc(doc(db, 'artifacts', appId, 'users', userId, 'dreams', dreamId));
};

// 장면 저장
export const saveScene = async (userId, dreamId, sceneData) => {
  await addDoc(
    collection(db, 'artifacts', appId, 'users', userId, 'dreams', dreamId, 'scenes'),
    sceneData
  );
};

// 장면 목록 가져오기
export const getScenes = async (userId, dreamId) => {
  const snapshot = await getDocs(
    collection(db, 'artifacts', appId, 'users', userId, 'dreams', dreamId, 'scenes')
  );
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => a.index - b.index);
};

// 꿈 미리보기 이미지 가져오기
export const getDreamPreview = async (userId, dreamId) => {
  const snapshot = await getDocs(
    collection(db, 'artifacts', appId, 'users', userId, 'dreams', dreamId, 'scenes')
  );
  const firstScene = snapshot.docs.find(d => d.data().index === 0);
  return firstScene?.data()?.imageUrl || null;
};

export { auth, db, appId };
