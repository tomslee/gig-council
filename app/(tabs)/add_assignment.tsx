import CategoryPicker from '@/components/CategoryPicker';
import {
  collection,
  doc,
  addDoc,
  Timestamp,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { useState } from 'react';
import { useRouter } from 'expo-router';
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
import { FIRESTORE_DB} from '../../lib/firebase';
import { useUserContext } from '../../contexts/UserContext';

export default function AddAssignment() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    description: "",
    category: "Admin",
    startTime: Timestamp.fromDate(new Date()),
    endTime: null,
  });
  const { userData } = useUserContext();


  const handleInputChange = (field: string, value: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }));
  };

  const addAssignment = async () => {
    console.log("In addAssignment");
    // Close any open assignments
    try {
      const q = query(collection(FIRESTORE_DB, "gig-council"), where('endTime', '==', null),
        where('owner', '==', userData["username"])
      );
      const querySnapshot = await getDocs(q);
      // ... process documents
      for (const doc of querySnapshot.docs) {
        const docRef = doc.ref; // Get a reference to the document
        await updateDoc(docRef, {
          endTime: serverTimestamp() // The field and its new value
        });
        console.log('Assignment ', doc.id, 'closed.');
      };
    } catch (e) {
      console.error('Error closing assignment', doc.id, ': ', e);
    };

    // Add the new assignment
    try {
      const activeDocRef = await addDoc(collection(FIRESTORE_DB, 'gig-council'),
        {
          owner: userData["username"],
          description: formData.description,
          category: formData.category,
          startTime: serverTimestamp(),
          endTime: null,
        });
      console.log('Uploaded assignment: ID=', activeDocRef.id, ', category=', formData.category, "owner=", userData["username"]);
    } catch (e) {
      console.error('Error adding assignment: ', e);
    };

    // Re-initialize the form data
    try {
      setFormData({
        description: "",
        category: "",
        startTime: Timestamp.fromDate(new Date()),
        endTime: null,
      });
      router.navigate('/'); // Navigate to the Home Screen
    } catch (e) {
      console.error('Error re-initializing form: ', e);
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

          {/* Category picker */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Work category:</Text>
            <CategoryPicker
              inputHandler={(text: string) => handleInputChange('category', text)}
            />
          </View>

          {/* Description */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>
              Description (optional):
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Type an assignment description..."
              placeholderTextColor="gray" // Sets
              onChangeText={(text: string) => handleInputChange('description', text)}
              id="description"
              value={formData.description}
            />
          </View>

          {/* Start time picker */}
          {/*
          <View style={styles.inputSection}>
            <Text style={styles.label}>
              Start time:
            </Text>
            <TimePicker
              time={formData.startTime}
              inputHandler={(text: string) => handleInputChange('startTime', text)}
            />
          </View>
          */}

          {/* Start Button */}
          <TouchableOpacity
            style={[styles.saveButton, !userData.isSignedIn && styles.disabledButton]}
            onPress={addAssignment}
            disabled={!userData.isSignedIn}>
            <Text style={styles.saveButtonText}>
              {userData.isSignedIn ? 'Start Assignment' : 'You must sign in to start an assignment'}
            </Text>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#3e3e50',
    elevation: 1,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 8,
    marginLeft: 2,
  },
  saveButton: {
    backgroundColor: '#66B2B2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    boxShadow: [{
      color: '#66B2B2',
      offsetX: 0,
      offsetY: 3,
      blurRadius: 2,
    }],
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#b2d8d8',
    boxShadow: [{
      color: '#b2d8d8',
      offsetX: 0,
      offsetY: 3,
      blurRadius: 2,
    }],
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