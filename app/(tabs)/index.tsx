// Import the functions you need from the SDKs you need
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  TouchableOpacity,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { initializeApp } from 'firebase/app';
import {
  collection,
  doc,
  getFirestore,
  query,
  where,
  getDocs,
  updateDoc,
  DocumentData
} from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from "@react-navigation/native";
// End of imports

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
export const CATEGORIES = [
  { value: 'catcommittee', label: 'Committee meeting', payable: true },
  { value: 'catcon', label: 'Constituent Issue', payable: true },
  { value: 'catcouncil', label: 'Council meeting', payable: true },
  { value: 'catphone', label: 'Phone call', payable: true },
  { value: 'catbreak', label: 'Break', payable: false },
  { value: 'catoffice', label: 'Office work', payable: false },
  { value: 'catadmin', label: 'Admin', payable: false },
  { value: 'catidle', label: 'Available', payable: false },
];
export interface Assignment {
  id?: string;
  description?: string;
  category?: string;
  startTime: Date;
  endTime?: Date;
  done?: boolean;
}
/*
 * End of exports
 */

/*
 * Home Screen
 */
export default function HomeScreen() {
  const [selectedItem, setSelectedItem] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [docList, setDocList] = useState<Assignment[]>([]);
  const [username, setUsername] = useState('');
  const [storedUsername, setStoredUsername] = useState('');
  const router = useRouter();
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchData = async () => {
      const q = query(collection(FIRESTORE_DB, "gig-council"),
        where('done', '==', false));
      if (isFocused) {
        try {
          const snapshot = await getDocs(q)
          snapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            if (docList.findIndex(obj => obj.id === doc.id) === -1) {
              docList.push({
                "id": doc.id,
                "category": doc.data()["category"],
                "description": doc.data()["description"],
                "startTime": doc.data()["startTime"],
                "endTime": doc.data()["endTime"],
                "done": doc.data()["done"]
              })
              console.log("Fetching ", doc.id,
                "=>", doc.data()["description"],
                "=>", doc.data()["category"],
                "=>", doc.data()["startTime"]);
            };
          });
          console.log("A total of " + docList.length + " assignments");
          setDocList(docList);
          setRefresh(!refresh);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
    };
    fetchData();
  }, [isFocused]);

  const updateAssignment = async (assignment: Assignment) => {
    if (assignment.id) {
      const docRef = doc(FIRESTORE_DB, 'gig-council', assignment.id);
      try {
        await updateDoc(docRef, {
          done: true
        });
        console.log("Document successfully updated!");
      } catch (error) {
        console.error("Error updating document:", error);
      }
      console.log("Assignment selected:" + assignment.id + "," + assignment.category);
      setSelectedItem(assignment);
    }
  };


  const goToAddAssignment = () => {
    router.navigate('/add_assignment'); // Navigate to the /add_assignment route
  };

  /*
   * End of constants (functions)
   */

  signInAnonymously(FIREBASE_AUTH)
    .then(() => {
      // Signed in..
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        console.log("Anonymous sign in as " + user.uid);
      };
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // ...
    });

  onAuthStateChanged(FIREBASE_AUTH, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user
      const uid = user.uid;
      console.log("Status changed for anonymous user " + user.uid);
      // ...
    } else {
      // User is signed out
      // ...
    }
  });


  /*
   * Login management
   */
  // To save a username
  const saveUserName = async () => {
    try {
      await AsyncStorage.setItem('@username', username);
      setStoredUsername(username);
    } catch (error) {
      console.error('Error saving username:', error);
    }
  };

  useEffect(() => {
    const getUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('@username'); // 'username' is the key
        if (storedUsername !== null) {
          setUsername(storedUsername);
        }
      } catch (error) {
        console.error("Error retrieving username:", error);
      }
    };
    getUsername();
  }, []); // Empty dependency array ensures it runs once on mount

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading data ...</Text>
      </View>
    )
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.formContainer}>
          {/* Welcome banner */}
          {storedUsername ? (
            <View style={styles.bannerSection}>
              <Text style={styles.bannerText}>Thank you for taking part in the Gig Council Challenge, {storedUsername}.</Text>
              <Text style={styles.bannerText} >You are now online and available for work assignments.</Text>
            </View>
          ) : (
            <View style={styles.bannerSection}>
              <Text style={styles.bannerText}>Welcome to the Gig Council Challenge.</Text>
              <Text style={styles.bannerText} >Please sign in.</Text>
            </View>
          )}

          {/* Sign in section */}
          {storedUsername ? (null) : (
            <View style={styles.section}>
              <TextInput
                style={styles.textInput}
                onChangeText={setUsername}
                value={username}
                placeholder="Type a user name..."
                id="id-set-user-name"
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveUserName} >
                <Text style={styles.saveButtonText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Open assignments */}
          {docList.length > 0 ? (
            <View style={styles.section}>
              {/* console.log("Started at ", docList[docList.length - 1]["startTime"]).toLocaleTimeString() */}
              <Text style={styles.label}>You have {docList.length} assignments in progress...</Text>
              <View style={styles.assignmentContainer}>
                <Text style={styles.listItemText}>
                  Category: {docList[docList.length - 1]["category"]}
                </Text>
                <Text style={styles.listItemText}>
                  Description: {docList[docList.length - 1]["description"]}
                </Text>
                <Text style={styles.listItemText}>
                  Started at {(new Date(1000 * docList[docList.length - 1]["startTime"]["seconds"]))
                    .toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Save Button */}
          {storedUsername ? (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={goToAddAssignment} >
                <Text style={styles.saveButtonText}>Start a new assignment</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    color: '#f8f9fa',
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
  bannerSection: {
    paddingVertical: 20,
    marginVertical: 8,
    elevation: 1,
    backgroundColor: '#ffffff',
  },
  section: {
    marginVertical: 8,
  },
  text: {
  },
  flatList: {
    padding: 10,
    marginTop: 20,
  },
  listItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderRadius: 5,
    backgroundColor: '#fbfafb',
    width: 320,
  },
  selectedListItem: {
    backgroundColor: '#dfffdf',
  },
  listItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 8,
    marginLeft: 2,
  },
  bannerText: {
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 8,
    marginLeft: 2,
    padding: 8,
  },
  saveButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    boxShadow: [{
      color: '#3498db',
      offsetX: 0,
      offsetY: 3,
      blurRadius: 2,
    }],
    elevation: 5,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#3e3e50',
    elevation: 1,
  },
  assignmentContainer: {
    padding: 15,
    backgroundColor: '#FFFFFF', // White background
    borderRadius: 8, // Slightly rounded corners
    borderWidth: 1,
    borderColor: '#E0E0E0', // Light gray border
    // Or, for shadow:
    boxShadow: [{
      color: '#000',
      offsetX: 0,
      offsetY: 2,
      blurRadius: 4,
    }],
    elevation: 2,
  }
});