// Import the functions you need from the SDKs you need
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBau3dXFlmkCcYQxLnz1TGSgUEw3BuH-nY",
  authDomain: "gig-council.firebaseapp.com",
  projectId: "gig-council",
  storageBucket: "gig-council.firebasestorage.app",
  messagingSenderId: "352321490111",
  appId: "1:352321490111:web:49a7d8acc3f9bc11c50a0a"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to Gig Councillor</Text>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
  },
});


export interface Assignment {
  id?: string;
  description?: string;
  category?: string;
  startTime?: string;
  endTime?: string;
  done?: boolean;
}