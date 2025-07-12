// Import the functions you need from the SDKs you need
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ListRenderItemInfo
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
import { getAuth } from 'firebase/auth';
import { useIsFocused } from "@react-navigation/native";

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
  { value: 'catoffice', label: 'Office work', payable: false },
  { value: 'catphone', label: 'Phone call', payable: true },
  { value: 'catcommittee', label: 'Committee meeting', payable: true },
  { value: 'catcouncil', label: 'Council meeting', payable: true },
  { value: 'catbreak', label: 'Coffee break', payable: false },
  { value: 'catadmin', label: 'Admin', payable: false },
];
export interface Assignment {
  id?: string;
  description?: string;
  category?: string;
  startTime?: string;
  endTime?: string;
  done?: boolean;
}

/*
 * Home Screen
 */
export default function HomeScreen() {
  const isFocused = useIsFocused();
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [docList, setDocList] = useState<Assignment[]>([{}]);
  //"id": "dummyid",
  //"description": "dummy description",
  //"category": "Admin",
  //"startTime": "",
  //"endTime": "",
  //"done": false,
  //}]);
  type DisplayItem = {
    id: string;
    description: string;
    category: string;
    done: Boolean;
  };

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
              console.log("Adding ", doc.id, " => ", doc.data()["description"]);
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

  const updateAssignment = async (assignment) => {
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

  const renderItem = ({ item }: ListRenderItemInfo<Assignment>) => {
    return (
      <TouchableOpacity
        style={[
          styles.listItem,
          item.id === selectedItem?.id && styles.selectedListItem,
        ]}
        onPress={() => updateAssignment(item)}
      >
        <Text style={styles.listItemText}>{item["description"]}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading data ...</Text>
      </View>
    )
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.text}>Welcome to Gig Councillor</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>{docList.length} open assignments: click to mark as Done</Text>
        <FlatList
          data={docList}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          extraData={refresh}
        />
      </View>
    </View >
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginVertical: 8,
  },
  text: {
  },
  listItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fbfafb',
    width: 320,
  },
  selectedListItem: {
    backgroundColor: '#dfffdf',
  },
  listItemText: {
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 8,
    marginLeft: 2,
  },
});
