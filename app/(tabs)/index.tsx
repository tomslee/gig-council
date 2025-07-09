import Button from '@/components/Button';
import TimePicker from '@/components/TimePicker';
import { collection, addDoc } from "firebase/firestore";
import { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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


export default function Index() {
  const [showAppOptions, setShowAppOptions] = useState<boolean>(false);
  // const [assignments, setAssignments] = useState<any[]>([]);
  const [assignment_description, setAssignmentDescription] = useState('');

  /*
  const addAssignment = async () => {
    // TODO
    alert(assignment_description);
  };
  */

  const addAssignment = async () => {
    try {
      const docRef = await addDoc(collection(FIRESTORE_DB, 'gig-council'), {
        description: assignment_description,
        done: false
      });
      console.log('Document written with ID: ', docRef.id, ' and description ', assignment_description);
      setAssignmentDescription('');
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  const onReset = () => {
    setShowAppOptions(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Add a new assignment description"
          onChangeText={(text: string) => setAssignmentDescription(text)}
          value={assignment_description}
        />
      </View>
      <View style={styles.container}>
        <TimePicker />
      </View>
      <View style={styles.container}>
        <Button theme="primary" label="Add assignment" onPress={addAssignment} />
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    flex: 2,
    flexDirection: 'column',
    color: "#34aeae"
  },
  form: {
    marginVertical: 30,
    flex: 0.5,
    flexDirection: 'column',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
  },
  textContainer: {
    flex: 1,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
  optionsContainer: {
    position: 'absolute',
    bottom: 80,
  },
  optionsRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});

export interface Assignment {
  done: boolean;
  id: string;
  description: string;
}
