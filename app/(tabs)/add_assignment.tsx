import TimePicker from '@/components/TimePicker';
import CategoryPicker from '@/components/CategoryPicker';
import { collection, addDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

// Import the functions you need from the SDKs you need
/*
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
*/
import { FIRESTORE_DB } from './index';

export default function AddAssignment() {
  const [formData, setFormData] = useState({
    description: "",
    category: "",
    startTime: new Date(),
    endTime: new Date(new Date().setMinutes(new Date().getMinutes() + 30)),
    done: false,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }));
  };

  /*
  const addAssignment = async () => {
    // TODO
    alert(assignment_description);
  };
  */

  const addAssignment = async () => {
    try {
      const docRef = await addDoc(collection(FIRESTORE_DB, 'gig-council'),
        {
          description: formData.description,
          category: formData.category,
          startTime: formData.startTime,
          endTime: formData.endTime,
          done: formData.done
        });
      console.log('Document ID=', docRef.id, ', category=', formData.category);
      setFormData({
        description: "",
        category: "",
        startTime: new Date(),
        endTime: new Date(new Date().setMinutes(new Date().getMinutes() + 30)),
        done: false,
      });
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  /*
  const onReset = () => {
    setShowAppOptions(false);
  };
  */

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.formContainer}>
          <View style={styles.inputSection}>
            <Text style={styles.label}>
              Description (optional):
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Type an assignment description"
              onChangeText={(text: string) => handleInputChange('description', text)}
              id="description"
              value={formData.description}
            />
          </View>

          {/* Category picker */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Work category:</Text>
            <CategoryPicker
              selectedValue={''}
              inputHandler={(text: string) => handleInputChange('category', text)}
            />
          </View>

          {/* Start time picker */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>
              Start time:
            </Text>
            <TimePicker
              time={formData.startTime}
              inputHandler={(text: string) => handleInputChange('startTime', text)}
            />
          </View>

          {/* End time picker */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>
              End time:
            </Text>
            <TimePicker
              time={formData.endTime}
              inputHandler={(text: string) => handleInputChange('endTime', text)}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={addAssignment} >
            <Text style={styles.saveButtonText}>Save Assignment</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView >
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    color: "#f8f9fa",
  },
  keyboardAvoid: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    justifyContent: 'space-evenly', // This evenly distributes the form elements
  },
  inputSection: {
    marginVertical: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2c3e50',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 8,
    marginLeft: 2,
  },
  saveButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#3498db',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
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