// Import the functions you need from the SDKs you need
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Link } from 'expo-router';
import { useIsFocused } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { UserData, useUserContext } from '../../contexts/UserContext';
import {
  Button,
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
import HelpIcon from '../../components/HelpIcon';
import { Ionicons } from '@expo/vector-icons';
import { Collection, Assignment, Session } from '../../types/types';
// End of imports

/*
 * Home Screen
 */
export default function HomeScreen() {
  const [refresh, setRefresh] = useState(false);
  const [docList, setDocList] = useState<Assignment[]>([]);
  const [localUsername, setLocalUsername] = useState('');
  const router = useRouter();
  const isFocused = useIsFocused();
  const { userData, loadUserData, saveUserData, updateUserData, isLoading } = useUserContext();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    const fetchAssignmentsForUser = async () => {
      // Get any open assignments for the user
      try {
        setDocList([]);
        if (userData && userData.username) {
          if (isFocused) {
            const assignments = await firestoreService.getAllOpenAssignmentsByOwner(Collection.assignment, userData.username);
            if (assignments) {
              for (const assignment of assignments) {
                docList.push(assignment)
                console.log("Fetching ", assignment.id,
                  ", ", assignment.description,
                  ", ", assignment.category,
                  ", ", assignment.startTime);
              };
              console.log("Fetched", docList.length, "unfinished assignments for", userData.username, ".");
              setDocList(docList);
              setRefresh(!refresh);
            };
          }; // if isFocused
        }; // if userData.username
      } catch (error) {
        console.error("Error retrieving assignments:", error);
      } finally {
        setLocalUsername(userData ? userData.defaultUsername : '');
        setLoading(false);
        setRefresh(!refresh);
      }; // try-catch
    }; // fetchAssignmentsForUser
    fetchAssignmentsForUser();
  }, [isFocused, userData]);

  const goToAddAssignment = () => {
    router.navigate({
      pathname: '/add_assignment', // Navigate to the /add_assignment route
      params: { assignmentID: null }
    })
  };

  const openAssignmentForEdit = (id: string) => {
    console.log("Opening assignment", id);
    router.push({
      pathname: '/add_assignment', // Navigate to the /add_assignment route
      params: { assignmentID: id }
    })
  };

  const firebaseSignIn = async () => {
    signInAnonymously(FIREBASE_AUTH)
      .then((userCredential) => {
        // Anonymous user signed in successfully
        const user = userCredential.user;
        console.log("Firebase sign-in succeeded: user UID:", user.uid);
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
  const appSignIn = async (): Promise<void> => {
    try {
      if (userData) {
        setLoading(true);
        setDocList([]);
        await firebaseSignIn();
        const trimmedUsername = localUsername.trim();
        if (!trimmedUsername) {
          alert("Please type a username to sign in. ");
          saveUserData(userData);
          setLoading(false);
          return;
        }
        await firestoreService.closeAllSessionsForOwner(Collection.session, trimmedUsername);
        const newUserData: UserData = {
          username: trimmedUsername,
          defaultUsername: trimmedUsername,
          sessionID: "",
          isOnAssignment: false,
        };
        const newSession: Session = {
          owner: newUserData.username,
          startTime: null,
          endTime: null
        };
        const session = await firestoreService.createSession(Collection.session, newSession);
        const assignments = await firestoreService.getAllOpenAssignmentsByOwner(Collection.assignment, newUserData.username);
        if (assignments) {
          for (const assignment of assignments) {
            docList.push(assignment)
            console.log("Fetching ", assignment.id,
              ", ", assignment.description,
              ", ", assignment.category,
              ", ", assignment.startTime);
          };
          console.log("Fetched", docList.length, "unfinished assignments for", userData.username, ".");
          setDocList(docList);
          // Now save the userData with the proper settings, for later 
          if (docList.length > 0) {
            await saveUserData({ ...newUserData, sessionID: session.id, isOnAssignment: true });
          } else {
            await saveUserData({ ...newUserData, sessionID: session.id, isOnAssignment: false });
          };
        };
        setRefresh(!refresh);
        setLoading(false);
        console.log("Signed in", newUserData.username, "to session", session.id);
      }
    } catch (error) {
      console.error('Error signing in:', error);
    };
  };

  const closeAssignments = async () => {
    try {
      if (userData && userData.username) {
        await firestoreService.closeAllAssignmentsForOwner(Collection.assignment, userData.username);
        await updateUserData({ isOnAssignment: false });
        setDocList([]);
        console.log("All assignments closed");
      };
    } catch (error) {
      console.error("Error closing assignments. ", error);
    };
  };

  const appSignOut = async () => {
    setLoading(true);
    console.log("In appSignOut")
    try {
      setDocList([]);
      if (userData) {
        await firestoreService.closeAllAssignmentsForOwner(Collection.assignment, userData.username);
        await firestoreService.closeAllSessionsForOwner(Collection.session, userData.username);
        await firebaseSignOut();
        await updateUserData({ username: "", sessionID: "" });
        console.log(userData.username, 'signed out of application.');
      };
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
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
      {/* console.log("JSX: userData=", userData) */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.formContainer}>
          {/* Welcome banner */}
          <View style={styles.formSection}>
            {(userData && userData.username && userData.sessionID) ? (
              <View style={styles.bannerSection}>
                <Text style={styles.bannerText}>Thank you for taking part in the RideFair Gig Work Challenge, {userData.username}.</Text>
                <Link style={styles.bannerText} href="/modal_gig_challenge">Read more <Ionicons name="chevron-forward" size={20} />
                </Link>
              </View>
            ) : null}
            {(userData && !userData.sessionID) ? (
              <View style={styles.bannerSection}>
                <Text style={styles.bannerText}>Welcome to the RideFair Gig Work Challenge.</Text>
                <Text style={styles.bannerText} >Please choose a name and sign in.</Text>
                <Link style={styles.bannerText} href="/modal_gig_challenge">Read more <Ionicons name="chevron-forward" size={20} />
                </Link>
              </View>
            ) : null}
          </View>

          {/* Sign in section */}
          {(userData && !userData.sessionID) ? (
            <View style={styles.formSection}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Sign in:</Text>
                <HelpIcon
                  title="Sign In recommendations"
                  helpText="We suggest your given name, or other alias. We make reasonable attempts to be secure, but no guarantees"
                />
              </View>
              <TextInput
                style={styles.textInput}
                onChangeText={setLocalUsername}
                value={localUsername}
                placeholder={(userData.defaultUsername) ? userData.defaultUsername : "Type a user name..."}
                defaultValue={userData.defaultUsername}
                id="id-set-user-name"
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={appSignIn}
              >
                <Text style={styles.saveButtonText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Open assignments */}
          {(userData && userData.username && userData.sessionID && docList && docList.length > 0) ? (
            <View style={styles.formSection}>
              {/* console.log("Started at ", docList[docList.length - 1]["startTime"].toDate().toLocaleTimeString()) */}
              <View style={styles.labelRow}>
                <Text style={styles.label}>Current assignment...</Text>
              </View>
              <View style={styles.assignmentContainer}>
                <TouchableOpacity
                  onPress={() => openAssignmentForEdit(docList[docList.length - 1]["id"])} >
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
                </TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={closeAssignments} >
                  <Text style={styles.saveButtonText}>Close this assignment</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {/* Start an assignment Button */}
          {(userData && userData.sessionID && !userData.isOnAssignment) ? (
            <View style={styles.formSection}>
              <Text style={styles.bannerText} >You are online and available for work assignments.</Text>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={goToAddAssignment} >
                {docList.length > 0 ? (
                  <Text style={styles.saveButtonText}>Start a new assignment</Text>
                ) : (
                  <Text style={styles.saveButtonText}>Start an assignment</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Sign out Button */}
          {userData && userData.sessionID ? (
            <View style={styles.formSection}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={appSignOut} >
                {docList.length > 0 ? (
                  <Text style={styles.saveButtonText}>Close assignment and sign out of work</Text>
                ) : (
                  <Text style={styles.saveButtonText}>Sign out of work</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : null}

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView >
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
    // justifyContent: 'space-evenly', // This evenly distributes the form elements
  },
  formSection: {
    flex: 1,
    marginVertical: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    justifyContent: 'center',
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495e',
    marginHorizontal: 8,
  },
  bannerSection: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginHorizontal: 8,
    elevation: 1,
    backgroundColor: '#c2e8e8',
    borderRadius: 8, // Slightly rounded corners
    borderWidth: 2,
    borderColor: '#66B2B2',
  },
  bannerText: {
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginLeft: 2,
    padding: 8,
  },
  saveButton: {
    backgroundColor: '#66B2B2',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginVertical: 8,
    marginHorizontal: 8,
    boxShadow: [{
      color: '#66B2B2',
      offsetX: 2,
      offsetY: 4,
      blurRadius: 2,
    }],
    elevation: 5,
  },
  saveButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 16,
    marginVertical: 12,
    fontSize: 16,
    color: '#3e3e50',
    elevation: 1,
  },
  assignmentContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    marginVertical: 8,
    backgroundColor: '#FFFFFF', // White background
    borderRadius: 8, // Slightly rounded corners
    borderWidth: 1,
    borderColor: '#c0c0c0',
    boxShadow: [{
      offsetX: 4,
      offsetY: 4,
      color: '#E0E0E0',
    }],
    elevation: 4
  }
});