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
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Collection, Assignment } from '@/types/types';
import { firestoreService } from '@/services/firestoreService';
import { timelineUtils } from '@/lib/timelineUtils';
import { useUserContext } from '@/contexts/UserContext';

export default function AddAssignment() {
  const { userData, saveUserData, updateUserData, clearUserData, isLoading } = useUserContext();
  const [formAssignment, setFormAssignment] = useState<Assignment>({
    owner: (userData && userData.username ? userData.username : ""),
    description: "",
    category: "Admin",
    startTime: null,
    endTime: null,
  });
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const isFocused = useIsFocused();
  const { assignmentID } = useLocalSearchParams<{ assignmentID: string }>();
  const isReturningFromNavigation = useRef(false);

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
            endTime: activeAssignment?.endTime
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
      if (userData && userData.username) {
        await firestoreService.closeAllAssignmentsForOwner(Collection.assignment, userData.username);
      };
    } catch (e) {
      console.error('Error closing open assignments', e);
    }

    // Add the new assignment
    try {
      if (userData) {
        const now: Date = new Date();
        const thirtyMinutesFromNow: Date = new Date(now.setMinutes(now.getMinutes() + 30));
        const activeAssignment: Assignment = {
          owner: userData.username,
          description: formAssignment.description,
          category: formAssignment.category,
          startTime: new Date(),
          endTime: thirtyMinutesFromNow,
        };
        console.log("Creating new assignment:", activeAssignment);
        await firestoreService.createAssignment(Collection.assignment, activeAssignment);
        updateUserData({ isOnAssignment: true });
      };
    } catch (e) {
      console.error('Error adding assignment: ', e);
    };
    // Re-initialize the form data
    try {
      setFormAssignment({
        owner: "",
        description: "",
        category: "",
        startTime: null,
        endTime: null,
      });
      router.replace('/'); // Navigate to the Home Screen
    } catch (e) {
      console.error('Error re-initializing form: ', e);
    }
  };

  const updateAssignment = async () => {
    try {
      if (userData && formAssignment.endTime) {
        const checkedTime = await timelineUtils.getValidEndTime(userData, formAssignment);
        const activeAssignment: Assignment = {
          id: formAssignment.id,
          owner: userData.username,
          description: formAssignment.description,
          category: formAssignment.category,
          startTime: formAssignment.startTime,
          endTime: checkedTime,
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
      });
    } catch (e) {
      console.error('Error re-initializing form: ', e);
    }

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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView}>
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
            {(userData && assignmentID && formAssignment.endTime) && (
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
  container: {
    flex: 1,
    color: "#f8f9fa",
    backgroundColor: '#f6f6f6',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
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