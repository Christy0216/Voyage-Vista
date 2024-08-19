import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth , getReactNativePersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId } from '@env';

const firebaseConfig = {
    apiKey: apiKey,
    authDomain: authDomain,
    projectId: projectId,
    storageBucket: storageBucket,
    messagingSenderId: messagingSenderId,
    appId: appId
};

// Initialize Firebase only if it hasn't been initialized yet

app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
export const storage = getStorage(app);
