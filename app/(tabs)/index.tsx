// Import the functions you need from the SDKs you need
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useIsFocused } from "@react-navigation/native";
import { useUserContext } from '../../contexts/UserContext';
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
import { signInAnonymously, signOut } from "firebase/auth";
import { FIREBASE_AUTH } from '../../lib/firebase';
import { firestoreService } from '../../services/firestoreService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// End of imports

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

export enum Collection {
      assignment = "assignment",
      session = "session",
};

export interface Assignment {
  id?: string;
  owner: string;
  description?: string;
  category?: string;
  startTime: Date | null;
  endTime: Date | null;
};

export interface Session {
  id?: string;
  owner: string;
  startTime: Date | null;
  endTime: Date | null;
};
/*
 * End of exports
 */

/*
 * Home Screen
 */
export default function HomeScreen() {
  // const [selectedItem, setSelectedItem] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [docList, setDocList] = useState<Assignment[]>([]);
  const [localUsername, setLocalUsername] = useState('');
  //const [storedUsername, setStoredUsername] = useState('');
  const router = useRouter();
  const isFocused = useIsFocused();
  const { userData, setUserData } = useUserContext();

  useEffect(() => {
    setLoading(true);
    setDocList([]);
    console.log("userData: ", userData);
    const fetchData = async () => {
      // Get the stored Username
      try {
        const storedUsername = await AsyncStorage.getItem('@storedUsername'); // '@storedUsername' is the key
        if (storedUsername) {
          // setStoredUsername(storedUsername);
          await setUserData(prev => ({
            ...prev,
            username: storedUsername,
            storedUsername: storedUsername
          }));
        };
        // Get any open assignments for the user
        try {
          if (userData.username) {
            if (isFocused) {
              const assignments = await firestoreService.getAllOpenAssignmentsByOwner(Collection.assignment, userData.username);
              if (assignments) {
                for(const assignment of assignments) {
                  docList.push(assignment)
                  console.log("Fetching ", assignment.id,
                    ", ", assignment.description,
                    ", ", assignment.category,
                    ", ", assignment.startTime);
                };
                console.log("Fetched", docList.length, "unfinished assignments");
                setDocList(docList);
                setRefresh(!refresh);
              };
            }; // if isFocused
          }; // if userData.username
        } catch (error) {
          console.error("Error retrieving assignments:", error);
        };
      } catch (error) {
        console.error("Error retrieving storedUsername:", error);
      } finally {
        setLoading(false);
      }; // try-catch
    }; // fetchData
    fetchData();
  }, [isFocused]);


  const goToAddAssignment = () => {
    router.navigate('/add_assignment'); // Navigate to the /add_assignment route
  };

  /*
   * End of constants (functions)
   */

  const firebaseSignIn = async () => {
    signInAnonymously(FIREBASE_AUTH)
      .then((userCredential) => {
        // Anonymous user signed in successfully
        const user = userCredential.user;
        console.log("Anonymous sign-in succeeded: user UID:", user.uid);
        // You can now use the 'user' object for further operations
      })
      .catch((error) => {
        // Handle errors during anonymous sign-in
        console.error("Anonymous sign-in failed:", error);
      });
  };

  const firebaseSignOut = async () => {
    // End the anonymous Firebase session
    signOut(FIREBASE_AUTH)
      .then(() => {
        // User signed out
        console.log("Firebase signed out.");
      });
  };

  /*
  onAuthStateChanged(FIREBASE_AUTH, (user) => {
    if (user) {
      // Anonymous user is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user
      const uid = user.uid;
      // console.log("Status changed for anonymous user " + user.uid);
      // ...
    } else {
      // Anonymous user is signed out of Firebase
      console.log("Firebase auth state changed: not authenticated");
    }
  });
  */


  /*
   * Login management
   */
  // To save a username
  const appSignIn = async () => {
    try {
      const trimmedUsername = localUsername.trim();
      console.log("localUsername=", localUsername);
      await firebaseSignIn();
      await AsyncStorage.setItem('@storedUsername', trimmedUsername);
      const newSession: Session = {
        "owner": userData.username,
        startTime: null,
        endTime: null
      };
      await firestoreService.closeAllSessionsForOwner(Collection.session, userData.username);
      const session = await firestoreService.createSession(Collection.session, newSession);
      setUserData({
        username: trimmedUsername,
        storedUsername: trimmedUsername,
        sessionID: session.id,
        isOnAssignment: false,
      });
      console.log("Signing in: userData=", userData);
      console.log("Signed in", userData.username, "to session", session.id);
    } catch (error) {
      console.error('Error signing in:', error);
    }

    setDocList([]);
    try {
      // Get any open assignments for the user
      if (isFocused) {
        try {
          if (isFocused) {
            const assignments = await firestoreService.getAllOpenAssignmentsByOwner(
              Collection.assignment,
              userData.username);
            if (assignments) {
              for (const assignment of assignments) {
                docList.push(assignment);
                console.log("Fetching ", assignment.id,
                  ", ", assignment.description,
                  ", ", assignment.category,
                  ", ", assignment.startTime);
              };
            };
            console.log("Fetched", docList.length, "unfinished assignments");
            setDocList(docList);
            setRefresh(!refresh);
          }; // if isFocused
          console.log("Fetched", docList.length, "unfinished assignments");
          setDocList(docList);
          setRefresh(!refresh);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const closeAssignments = async () => {
    try {
      await firestoreService.closeAllAssignmentsForOwner(Collection.assignment, userData.username);
      setDocList([]);
    } catch ( error ) {
      console.error("Error closing assignments. ", error);
    };
  };

  const appSignOut = async () => {
    try {
      setDocList([]);
      await firestoreService.closeAllAssignmentsForOwner(Collection.assignment, userData.username);
      await firebaseSignOut();
      await firestoreService.closeAllSessionsForOwner(Collection.session, userData.username);
      // Set the local user name to empty. But the storedUsername has
      // not been changed, so don't update that.
      setUserData({
        ...userData,
        username: '',
        sessionID: '',
        isOnAssignment: false
      });
      console.log('Signed out of application. Stored user name is', userData.storedUsername);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.safeAreaContainer}>
        <Text style={styles.text}>Loading data ...</Text>
      </View>
    )
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.formContainer}>
          {/* Welcome banner */}
          {(userData.sessionID && !userData.isOnAssignment ) ? (
            <View style={styles.bannerSection}>
              <Text style={styles.bannerText}>Thank you for taking part in the Gig Council Challenge, {userData.storedUsername}.</Text>
              <Text style={styles.bannerText} >You are now available for work assignments.</Text>
            </View>
          ) : null}
          {(userData.sessionID && userData.isOnAssignment) ? (
            <View style={styles.bannerSection}>
              <Text style={styles.bannerText}>Thank you for taking part in the Gig Council Challenge, {userData.storedUsername}.</Text>
            </View>
          ) : null}
          {( !userData.sessionID ) ? (
            <View style={styles.bannerSection}>
              <Text style={styles.bannerText}>Welcome to the Gig Council Challenge.</Text>
              <Text style={styles.bannerText} >Please choose a name and sign in.</Text>
            </View>
          ) : null}

          {/* Sign in section */}
          {!userData.sessionID ? (
            <View style={styles.section}>
              <TextInput
                style={styles.textInput}
                onChangeText={setLocalUsername}
                value={localUsername}
                placeholder={(userData.storedUsername) ? "Type a user name..." : userData.storedUsername}
                defaultValue={userData.storedUsername}
                id="id-set-user-name"
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={appSignIn}
              >
                <Text style={styles.saveButtonText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          ) : null }

          {/* Open assignments */}
          {(userData.sessionID && docList && docList.length > 0) ? (
            <View style={styles.section}>
              {/* console.log("Started at ", docList[docList.length - 1]["startTime"].toDate().toLocaleTimeString()) */}
              <Text style={styles.label}>Current assignment...</Text>
              <View style={styles.assignmentContainer}>
                <Text style={styles.listItemText}>
                  Category: {docList[docList.length - 1]["category"]}
                </Text>
                <Text style={styles.listItemText}>
                  Description: {docList[docList.length - 1]["description"]}
                </Text>
                {docList[docList.length - 1]["startTime"] ? (
                  <Text style={styles.listItemText}>
                    Started at {docList[docList.length - 1]["startTime"]
                      .toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                  </Text>) : null
                }
              </View>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={closeAssignments} >
                <Text style={styles.saveButtonText}>Close this assignment</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Start an assignment Button */}
          {userData.sessionID ? (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={goToAddAssignment} >
              {docList.length > 0 ? (
                <Text style={styles.saveButtonText}>Start a new assignment</Text>
              ): (
                <Text style={styles.saveButtonText}>Start an assignment</Text>
              ) }
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Sign out Button */}
          {userData.sessionID ? (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={appSignOut} >
              {docList.length > 0 ? (
                <Text style={styles.saveButtonText}>Close assignment and sign out of work</Text>
              ): (
                <Text style={styles.saveButtonText}>Sign out of work</Text>
              ) }
              </TouchableOpacity>
            </View>
          ) : null}

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeAreaContainer: {
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
  section: {
    marginVertical: 8,
  },
  listItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    //borderBottomColor: '#eee',
    borderBottomColor: '#B2D8D8',
    borderRadius: 5,
    backgroundColor: '#fbfafb',
    width: 320,
  },
  text: {
  },
  flatList: {
    padding: 10,
    marginTop: 20,
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
  bannerSection: {
    paddingVertical: 20,
    marginVertical: 8,
    elevation: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8, // Slightly rounded corners
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
  }
});