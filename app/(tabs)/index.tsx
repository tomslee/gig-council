// Import the functions you need from the SDKs you need
import { useState, useEffect } from 'react';
import { useNavigation, useRouter } from 'expo-router';
import { Link } from 'expo-router';
import { useIsFocused } from "@react-navigation/native";
import { UserName, UserData, useUserContext } from '@/contexts/UserContext';
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
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { FIREBASE_AUTH } from "@/lib/firebase";
import { firestoreService } from '@/services/firestoreService';
import HelpIcon from '@/components/HelpIcon';
import { Ionicons } from '@expo/vector-icons';
import { Collection, Assignment, MINIMUM_HOURLY_WAGE, Session } from '@/types/types';
import { useModal } from '@/contexts/ModalContext';
import { ratingStrings } from '@/lib/stringResources';

// End of imports

/*
 * Home Screen
 */
export default function HomeScreen() {
  //const [refresh, setRefresh] = useState(false);
  const [docList, setDocList] = useState<Assignment[]>([]);
  const [localUsername, setLocalUsername] = useState('');
  const router = useRouter();
  const isFocused = useIsFocused();
  const { userName, userData,
    loadUserName, loadUserData,
    saveUserName, saveUserData,
    updateUserName, updateUserData, isLoadingUser } = useUserContext();
  const [isLoadingData, setLoadingData] = useState<boolean>(false);
  const navigation = useNavigation();
  const { showModal } = useModal();

  // console.log("HomeScreen: isLoadingData=", isLoadingData, ", isLoadingUser=", isLoadingUser);
  // SignIn to Firebase and load userName on app start
  useEffect(() => {
    const startUp = async () => {
      console.log("useEffect[]: signing in to Firebase on app start.");
      console.log('useEffect[]: navigation stack depth:', navigation.getState()?.history?.length);
      await firebaseSignIn();
      // Now load the userName: loadUserName also does a setUserName to make it available
      // elsewhere. See the userName useEffect below.
      await loadUserData();
      await loadUserName();
    };
    startUp();
    return () => {
      console.log('Component unmounting');
    };
  }, []);

  useEffect(() => {
    console.log("useEffect[userName]: userName=", userName);
    console.log('useEffect[userName]: navigation stack depth:', navigation.getState()?.history?.length);
    fetchSessionsAndAssignments();
  }, [userName]);

  useEffect(() => {
    console.log("useEffect[isFocused]: isFocused=", isFocused);
    console.log('useEffect[isFocused]: navigation stack depth:', navigation.getState()?.history?.length);
    if (isFocused) {
      fetchSessionsAndAssignments();
      // setLoadingData(false);
    } else {
      // leaving?
      setLoadingData(true);
    }
  }, [isFocused]);

  /*
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      // Reset loading state when leaving screen
      console.log("navigation effect");
      setLoadingData(true);
    });
    return unsubscribe;
  }, [navigation]);
  */

  const fetchSessionsAndAssignments = async () => {
    const callId = `fsa-${Math.random().toString(36).slice(2, 5)}`;
    try {
      setLoadingData(true);
      const docs = [];
      console.log(callId, "userName=", userName?.username);
      if (userName && userName.username) {
        // setLocalUsername(userName.username);
        const openSessions = await firestoreService.getAllOpenSessionsByOwner(Collection.session, userName.username);
        const openSessionID = (openSessions.length > 0 && openSessions[0].id) ? openSessions[0].id : '';
        console.log(callId, "fetched", openSessions.length, "open sessions for", userName.username);
        const openAssignments = await firestoreService.getAllOpenAssignmentsByOwner(Collection.assignment, userName.username);
        const openAssignmentID = (openAssignments.length > 0 && openAssignments[0].id) ? openAssignments[0].id : '';
        console.log(callId, "fetched", openAssignments.length, "open assignments for", userName.username);
        for (const openAssignment of openAssignments) {
          docs.push(openAssignment)
        };
        const fetchedUserData: UserData = { sessionID: openSessionID, assignmentID: openAssignmentID };
        await saveUserData(fetchedUserData);
        setDocList(docs);
      } else {
        console.log(callId, "has no userName.username, so did not fetch sessions or assignments.");
      }; // if userData.username
    } catch (error) {
      console.error(callId, ":", error);
    } finally {
      setLoadingData(false);
    }; // try-catch
  }; // fetchAssignments

  const openAssignmentForCreate = () => {
    router.push({
      pathname: '../modal_assignment', // Navigate to the modal text report
      params: { assignmentID: null }
    });
  };

  const openAssignmentForEdit = (id: string) => {
    console.log("Opening assignment", id);
    router.push({
      pathname: '../modal_assignment', // Navigate to the /add_assignment route
      params: { assignmentID: id }
    })
  };

  const openRatingModal = (rating: number) => {
    const randomIndex = Math.floor(Math.random() * ratingStrings[rating].length);
    const ratingString = ratingStrings[rating][randomIndex] + "! You were rated " + rating.toFixed() + " stars for this assignment.";
    console.log("showModal, ratingString=", ratingString);
    showModal(ratingString);
  };

  const openModalWithContent = (content: string) => {
    console.log("showModal, content=", content);
    showModal(content);
  };

  const firebaseSignIn = async () => {
    await signInWithEmailAndPassword(FIREBASE_AUTH,
      process.env.EXPO_PUBLIC_FIREBASE_EMAIL,
      process.env.EXPO_PUBLIC_FIREBASE_PASSWORD)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("useEffect[]: Firebase sign-in succeeded: user UID:", user.uid);
      })
      .catch((error) => {
        // Handle errors during sign-in: network missing?
        console.error("useEffect[] Firebase sign-in failed:", error);
        openModalWithContent("NickelNDimr could not reach the server. Are you sure you have internet?");
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
   * Login management
   */
  // To save a username
  const appSignIn = async (username: string) => {
    try {
      setLoadingData(true);
      console.log("In appSignIn");
      await firebaseSignIn();
      if (userName) {
        const finalUsername = username || userName?.previousUsername || '';
        const docs = [];
        const trimmedUsername = finalUsername.trim();
        if (trimmedUsername) {
          const tempUsername: UserName = { username: trimmedUsername, previousUsername: trimmedUsername };
          saveUserName(tempUsername);
        } else {
          openModalWithContent("Please type a username to sign in. ");
          return;
        }
        await firestoreService.closeAllSessionsForOwner(Collection.session, trimmedUsername);
        //TS: I don't know what's going on here
        const newUserName: UserName = {
          username: userName ? userName.username : '',
          previousUsername: '',
        }
        const newUserData: UserData = {
          sessionID: '',
          assignmentID: '',
        };
        const newSession: Session = {
          owner: newUserName.username,
          startTime: null,
          endTime: null
        };
        const session = await firestoreService.createSession(Collection.session, newSession);
        const assignments = await firestoreService.getAllOpenAssignmentsByOwner(Collection.assignment, newUserName.username);
        if (assignments) {
          for (const assignment of assignments) {
            docs.push(assignment)
            console.log("Fetching ", assignment.id,
              ", ", assignment.description,
              ", ", assignment.category,
              ", ", assignment.startTime);
          };
          console.log("HomeScreen.appSignIn: fetched", docs.length, "open assignments for", newUserName.username, ".");
          setDocList(docs);
          // Now save the userData with the proper settings, for later 
          if (docs.length > 0 && docs[0].id) {
            await updateUserData({
              sessionID: session.id,
              assignmentID: docs[0].id,
            });
          } else {
            await updateUserData({
              sessionID: session.id,
              assignmentID: '',
            });
          }
        };
        console.log("Signed in", newUserName.username, "to session", session.id);
      }
    } catch (error) {
      console.error('Error signing in:', error);
    } finally {
      setLoadingData(false);
    };
  };

  const closeAssignments = async () => {
    try {
      if (userName && userName.username) {
        const closedAssignment = await firestoreService.closeAllAssignmentsForOwner(Collection.assignment, userName.username);
        console.log("closedAssignment=", closedAssignment);
        openRatingModal(closedAssignment?.rating);
        await updateUserData({ assignmentID: '' });
        setDocList([]);
        console.log("All assignments closed");
      };
    } catch (error) {
      console.error("HomeScreen.closeAssignments: Error closing assignments. ", error);
    };
  };

  const appSignOut = async () => {
    console.log("In appSignOut")
    try {
      setLoadingData(true);
      setDocList([]);
      console.log("appSignOut: userName=", userName);
      if (userName) {
        await firestoreService.closeAllAssignmentsForOwner(Collection.assignment, userName.username);
        await firestoreService.closeAllSessionsForOwner(Collection.session, userName.username);
        await firebaseSignOut();
        console.log(userName.username, 'signed out of application.');
        await updateUserName({ username: '' });
        await updateUserData({ sessionID: '' });
      };
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoadingData(false);
    }

  };

  if (isLoadingUser || isLoadingData) {
    return (
      <View style={styles.safeAreaContainer}>
        <Text style={styles.text}>Loading user or data ...</Text>
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
            {(userName && userName.username && userData && userData.sessionID) ? (
              <View style={styles.bannerSection}>
                <Text style={styles.bannerText}>Thank you for taking part in the RideFair Gig Work Challenge, {userName.username}.</Text>
                <Link style={styles.bannerText} href="/modal_gig_challenge">Read more <Ionicons name="chevron-forward" size={20} />
                </Link>
              </View>
            ) : (
              <View style={styles.bannerSection}>
                <Text style={styles.bannerText}>Welcome to the RideFair Gig Work Challenge.</Text>
                <Text style={styles.bannerText} >Please choose a name and sign in.</Text>
                <Link style={styles.bannerText} href="/modal_gig_challenge">Read more <Ionicons name="chevron-forward" size={20} />
                </Link>
              </View>
            )}
          </View>

          {/* App sign in section if no username or if no open session*/}
          {(userName && (!userName?.username || !userData?.sessionID)) && (
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
                placeholder={(userName.previousUsername) ? userName.previousUsername : "Type a user name..."}
                defaultValue={userName.previousUsername}
                id="id-set-user-name"
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => appSignIn(localUsername)}
              >
                <Text style={styles.saveButtonText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* If there is an open assignment, diaplay it.*/}
          {(userName && userName.username &&
            userData?.assignmentID &&
            docList.length > 0) && (
              <View style={styles.formSection}>
                {console.log("JSX: assignmentID=", userData.assignmentID, "docList length=", docList.length)}
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Current assignment...</Text>
                </View>
                <View style={styles.assignmentContainer}>
                  <TouchableOpacity
                    onPress={() => openAssignmentForEdit(docList[docList.length - 1].id)} >
                    <Text style={styles.listItemText}>
                      Category: {docList[docList.length - 1].category}
                    </Text>
                    <Text style={styles.listItemText}>
                      Description: {docList[docList.length - 1].description}
                    </Text>
                    {docList[docList.length - 1]["startTime"] && (
                      <Text style={styles.listItemText}>
                        Started at {docList[docList.length - 1].startTime
                          .toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                      </Text>
                    )}
                    {docList[docList.length - 1]["endTime"] && (
                      <Text style={styles.listItemText}>
                        ...scheduled to finish at {docList[docList.length - 1].endTime
                          .toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                      </Text>
                    )}
                    {(docList[docList.length - 1].payRateFactor) ?
                      (<Text style={styles.listItemText}>
                        Your pay rate:  ${(docList[docList.length - 1].payRateFactor! * MINIMUM_HOURLY_WAGE).toFixed(2)}/hr.
                      </Text>
                      ) :
                      (<Text style={styles.listItemText}>
                        No pay rate available for this assignment.
                      </Text>)}
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
            )}

          {/* Start an assignment Button if there is no current assignment */}
          {(userName?.username && userData && userData.sessionID && !userData.assignmentID) ? (
            <View style={styles.formSection}>
              <Text style={styles.bannerText} >You are online and available for work assignments.</Text>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={openAssignmentForCreate} >
                {docList.length > 0 ? (
                  <Text style={styles.saveButtonText}>Start a new assignment</Text>
                ) : (
                  <Text style={styles.saveButtonText}>Start an assignment</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Sign out Button */}
          {(userName?.username && userData && userData.sessionID) && (
            <View style={styles.formSection}>
              <Text style={styles.comment}>You will be signed out automatically at 5pm,
                or one hour after you signed in, whichever is later.</Text>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={appSignOut} >
                {docList.length > 0 ? (
                  <Text style={styles.saveButtonText}>Close assignment and sign out</Text>
                ) : (
                  <Text style={styles.saveButtonText}>Sign out</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
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
  comment: {
    paddingHorizontal: 8,
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
    // fontWeight: '600',
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
    borderColor: '#117272',
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