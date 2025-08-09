import CategoryPicker from '@/components/CategoryPicker';
import TimePicker from '@/components/TimePicker';
import React, { useState, useEffect, useRef } from 'react';
import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router';
import { useIsFocused } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Collection, Assignment, MINIMUM_HOURLY_WAGE } from '@/types/types';
import { firestoreService } from '@/services/firestoreService';
import { timelineUtils } from '@/lib/timelineUtils';
import { useUserContext } from '@/contexts/UserContext';
import { useModal } from '@/contexts/ModalContext';

export default function AddAssignment() {
  const { userName, userData, updateUserData } = useUserContext();
  const [formAssignment, setFormAssignment] = useState<Assignment>({
    owner: (userName && userName.username ? userName.username : ""),
    description: "",
    category: "Admin",
    startTime: null,
    endTime: null,
    rating: null,
    payRateFactor: 1.0,
  });
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const isFocused = useIsFocused();
  const { assignmentID } = useLocalSearchParams<{ assignmentID: string }>();
  const isReturningFromNavigation = useRef(false);
  const insets = useSafeAreaInsets();
  const { showModal } = useModal();

  const handleInputChange = (field: string, value: string) => {
    if (value) {
      if (field == 'endTime') {
        // endTime validation is a special case
        try {
          const valueDate = new Date(
            formAssignment.startTime ? formAssignment.startTime.getFullYear() : new Date().getFullYear(),
            formAssignment.startTime ? formAssignment.startTime.getMonth() : new Date().getMonth(),
            formAssignment.startTime ? formAssignment.startTime.getDate() : new Date().getDate(),
            new Date(value).getHours(),
            new Date(value).getMinutes()
          );
          setFormAssignment((prevFormAssignment) => ({
            ...prevFormAssignment,
            [field]: valueDate,
          }));
        } catch (e) {
          console.log("handleInputChange endTime error:", e);
        };
      } else {
        setFormAssignment((prevFormAssignment) => ({
          ...prevFormAssignment,
          [field]: value,
        }));
      };
    };
  };

  useEffect(() => {
    setLoading(true);
    const loadAssignment = async () => {
      if (assignmentID) {
        const activeAssignment = await firestoreService.getAssignmentByID(Collection.assignment, assignmentID);
        if (activeAssignment) {
          setFormAssignment({
            id: activeAssignment?.id,
            owner: activeAssignment?.owner,
            description: activeAssignment.description,
            category: activeAssignment?.category,
            startTime: activeAssignment?.startTime,
            endTime: activeAssignment?.endTime,
            rating: activeAssignment.rating,
            payRateFactor: activeAssignment.payRateFactor,
          });
        };
      }
    };
    loadAssignment();
    setLoading(false);
  }, [isFocused, userData]);

  useFocusEffect(
    // Memoize the logic with React.useCallback to avoid re-running the effect on every render.
    React.useCallback(() => {
      // If we're returning from programmatic navigation and have params, clear them
      if (isReturningFromNavigation.current && assignmentID) {
        // We navigated to this page from an edit. 
        isReturningFromNavigation.current = false;
      }
    }, [assignmentID]));

  const addAssignment = async () => {
    // Close any open assignments
    try {
      if (userName && userName.username) {
        await firestoreService.closeAllAssignmentsForOwner(Collection.assignment, userName.username);
      };
    } catch (e) {
      console.error('Error closing open assignments', e);
    }

    // Add the new assignment
    try {
      if (userName) {
        const now: Date = new Date();
        const thirtyMinutesFromNow: Date = new Date(now.setMinutes(now.getMinutes() + 30));
        const activeAssignment: Assignment = {
          owner: userName.username,
          description: formAssignment.description,
          category: formAssignment.category,
          startTime: new Date(),
          endTime: thirtyMinutesFromNow,
          rating: null,
          payRateFactor: timelineUtils.assignPayRateFactor(formAssignment.category),
        };
        const newAssignment: Assignment = await firestoreService.createAssignment(Collection.assignment, activeAssignment);
        console.log("AddAssignment.addAssignment: created assignment id=", newAssignment.id);
        showModal("Our algorithms have optimized your pay rate. You will be paid $" +
          (activeAssignment.payRateFactor * MINIMUM_HOURLY_WAGE).toFixed(2) +
          " per hour of engaged time for this assignment.");
        await updateUserData({ assignmentID: newAssignment.id });
      };
    } catch (e) {
      console.error('AddAssignment.addAssignment: error creating assignment: ', e);
    };
    // Re-initialize the form data
    try {
      setFormAssignment({
        owner: "",
        description: "",
        category: "",
        startTime: null,
        endTime: null,
        rating: null,
        payRateFactor: 1.0,
      });
      router.replace('/'); // Navigate to the Home Screen
    } catch (e) {
      console.error('Error re-initializing form: ', e);
    }
  };

  const updateAssignment = async () => {
    try {
      if (userName && formAssignment.endTime) {
        const checkedTime = await timelineUtils.getValidEndTime(userName, formAssignment);
        const activeAssignment: Assignment = {
          id: formAssignment.id,
          owner: userName.username,
          description: formAssignment.description,
          category: formAssignment.category,
          startTime: formAssignment.startTime,
          endTime: checkedTime,
          rating: null,
          payRateFactor: 1.0,
        };
        await firestoreService.updateAssignment(Collection.assignment, activeAssignment);
      };
    } catch (e) {
      console.error('Error updating assignment: ', e);
    };
    // for navigation purposes.
    const fromTimeline = formAssignment.endTime;
    // Re-initialize the form data
    try {
      setFormAssignment({
        owner: "",
        description: "",
        category: "",
        startTime: null,
        endTime: null,
        rating: null,
        payRateFactor: 1.0,
      });
    } catch (e) {
      console.error('Error re-initializing form: ', e);
    }

    if (fromTimeline) {
      // must have come from the timeline
      isReturningFromNavigation.current = true;
      // We navigated to this page from an edit. Clean the parameters before leaving.
      router.back();
      //router.replace('/(tabs)/timeline');
    } else {
      // go home
      isReturningFromNavigation.current = false;
      router.back();
      // router.replace('/');
    };
  };

  const deleteAssignment = async () => {
    // Delete the current assignment
    if (formAssignment.id) {
      try {
        await firestoreService.deleteAssignment(Collection.assignment, formAssignment.id);
      } catch (e) {
        console.error('Error deleting assignment: ', e);
      };
      const fromTimeline = formAssignment.endTime;
      if (fromTimeline) {
        // must have come from the timeline
        isReturningFromNavigation.current = true;
        // We navigated to this page from an edit. Clean the parameters before leaving.
        // router.replace('/(tabs)/add_assignment');
        router.replace('/(tabs)/timeline');
      } else {
        // go home
        isReturningFromNavigation.current = false;
        router.replace('/');
      };
    };
  };

  /*
  const onReset = () => {
    setShowAppOptions(false);
  };
  */

  /*
  const onReset = () => {
    setShowAppOptions(false);
  };
  */

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor="white"
          translucent={false}
          hidden={false}
        />
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Text style={styles.headerText}
            onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={30} color="white" />
          </Text>
          <Text style={styles.headerText}>
            Assignment
          </Text>
        </View>
        <ScrollView style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>

            {/* Category picker */}
            <View style={styles.formSection}>
              <Text style={styles.label}>Work category:</Text>
              <CategoryPicker
                initialCategory={assignmentID && formAssignment.category}
                inputHandler={(text: string) => handleInputChange('category', text)}
              />
            </View>

            {/* Description */}
            <View style={styles.formSection}>
              <Text style={styles.label}>
                Assignment description (optional):
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="Type an assignment description..."
                placeholderTextColor="gray" // Sets
                onChangeText={(text: string) => handleInputChange('description', text)}
                id="description"
                value={formAssignment.description}
              />
            </View>

            {/* End time picker for edits */}
            {(userName && assignmentID && formAssignment.endTime) && (
              <View style={styles.formSection}>
                <Text style={styles.label}>
                  This assignment is recorded as starting at {formAssignment.startTime?.toLocaleDateString('en-CA',
                    { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric' })}
                  {/* console.log("above TimePicker: displaying formAssignment", formAssignment) */}
                  and ending at {formAssignment.endTime?.toLocaleDateString('en-CA',
                    { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric' })}</Text>
                <Text style={styles.text}>You cannot fix the start time, but you can fix the end time here, for example if you forgot to close the
                  assignment when you completed it, but every assignment must end on the same day it started.
                </Text>
                <TimePicker
                  time={formAssignment.endTime ? formAssignment.endTime : new Date()}
                  inputHandler={(text: string) => handleInputChange('endTime', text)}
                />
              </View>
            )}

            {/* Start/Save Button */}
            {(userData && assignmentID ? (
              <View style={styles.formSection}>
                <TouchableOpacity
                  style={[styles.saveButton, userData.sessionID === "" && styles.disabledButton]}
                  onPress={updateAssignment}
                  disabled={!userData.sessionID}>
                  <Text style={styles.saveButtonText}>
                    {userData.sessionID !== "" ? 'Save Assignment' : 'You must sign in to edit an assignment'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.formSection}>
                <TouchableOpacity
                  style={[styles.saveButton, userData.sessionID === "" && styles.disabledButton]}
                  onPress={addAssignment}
                  disabled={!userData.sessionID}>
                  <Text style={styles.saveButtonText}>
                    {userData.sessionID !== "" ? 'Start Assignment' : 'You must sign in to start an assignment'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Delete Button */}
            {((userData && assignmentID) && (
              <View style={styles.formSection}>
                <TouchableOpacity
                  style={[styles.saveButton, userData.sessionID === "" && styles.disabledButton]}
                  onPress={deleteAssignment}
                  disabled={!userData.sessionID}>
                  <Text style={styles.saveButtonText}>
                    {userData.sessionID !== "" ? 'Delete Assignment' : 'You must sign in to edit an assignment'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView >
  );
}


const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    //marginTop: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    //backgroundColor: '#b2d8d8',
    backgroundColor: '#66b2b2',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    justifyContent: 'space-evenly', // This evenly distributes the form elements
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    // justifyContent: 'space-evenly', // This evenly distributes the form elements
  },
  formSection: {
    // marginVertical: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    //justifyContent: 'center',
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    paddingHorizontal: 8,
    paddingVertical: 16,
    alignItems: 'center',
    boxShadow: [{
      color: '#66B2B2',
      offsetX: 2,
      offsetY: 4,
      blurRadius: 2,
    }],
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#b2d8d8',
    boxShadow: [{
      color: '#b2d8d8',
      offsetX: 2,
      offsetY: 4,
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