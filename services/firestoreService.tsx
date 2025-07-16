// services/firestoreService.js
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { FIRESTORE_DB } from '../lib/firebase';
import { Assignment } from '../app/(tabs)/index';

export const firestoreService = {

  // Get all documents owned by one user
    async getAllAssignmentsByOwner(collectionName: string, owner: string) {
        try {
            const q = query(collection(FIRESTORE_DB, collectionName),
                where('owner', '==', owner));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Assignment[];
        }  catch (error) {
            console.error('Error getting documents ', error);
        };
    },

  // Get all open documents owned by one user
    async getAllOpenAssignmentsByOwner(collectionName: string, owner: string) {
        try {
            const q = query(collection(FIRESTORE_DB, collectionName),
                where('owner', '==', owner),
            where('endTime', '==', null));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Assignment[];
        }  catch (error) {
            console.error('Error getting documents ', error);
        };
    },

  // Get a single document by ID
  async getAssignmentById(collectionName: string, docId: string) {
    try {
      const docRef = doc(FIRESTORE_DB, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error getting document ${docId}:`, error);
      throw error;
    }
  },

  // Create a new document
  async createAssignment(collectionName: string, newAssignment: Assignment) {
    try {
      const collectionRef = collection(FIRESTORE_DB, collectionName);
      const docRef = await addDoc(collectionRef, {
        ...newAssignment,
          startTime: serverTimestamp()
      });
      console.log(`Created assignment id=`, docRef.id);
      return {
        id: docRef.id,
        ...newAssignment,
        startTime: serverTimestamp()
      };
    } catch (error) {
      console.error(`Error creating assignment:`, error);
      throw error;
    }
  },

  // Close an assignment
  async closeAssignment(collectionName: string, assignment: Assignment) {
    try {
        const docRef = doc(collection(FIRESTORE_DB, collectionName),
            assignment.id);
        await updateDoc(docRef, {
            ...assignment,
            endTime: serverTimestamp()
        });
        console.log('Assignment ', doc.bind, 'closed');
      
        return {
            ...assignment,
            endTime: serverTimestamp()
        };
    } catch (error) {
        console.error(`Error updating document:`, error);
        throw error;
    }
  },

  async closeAllAssignmentsForOwner(collectionName: string, owner: string) {
    try {
        const openAssignments = await firestoreService.getAllOpenAssignmentsByOwner(
            collectionName, owner);
        if (openAssignments) {
            for (const openAssignment of openAssignments) {
                await firestoreService.closeAssignment(
                    collectionName, openAssignment);
            };
        };
    } catch (e) {
        console.error(`Error closing assignment {docRef.id}: `, e);
    };
  },

  // Update a document
  async update(collectionName: string, docId: string, data: any) {
    try {
      const docRef = doc(FIRESTORE_DB, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      });
      
      return {
        id: docId,
        ...data,
        updatedAt: new Date()
      };
    } catch (error) {
      console.error(`Error updating document:`, error);
      throw error;
    }
  },

  // Delete a document
  async delete(collectionName: string, docId: string) {
    try {
      const docRef = doc(FIRESTORE_DB, collectionName, docId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`Error deleting document:`, error);
      throw error;
    }
  },

};

// Example usage:
/*
// Get all users
const users = await firestoreService.getAll('users');

// Get user by ID
const user = await firestoreService.getById('users', 'user123');

// Query with filters
const activeUsers = await firestoreService.queryWhere(
  'users',
  [{ field: 'status', operator: '==', value: 'active' }],
  { field: 'createdAt', direction: 'desc' },
  10
);

// Paginated query
const result = await firestoreService.queryPaginated('posts', {
  filters: [{ field: 'published', operator: '==', value: true }],
  orderByField: { field: 'createdAt', direction: 'desc' },
  limitCount: 5
});

// Real-time listener
const unsubscribe = firestoreService.subscribe('users', (users) => {
  console.log('Users updated:', users);
}, {
  filters: [{ field: 'status', operator: '==', value: 'active' }]
});

// Don't forget to unsubscribe when component unmounts
// unsubscribe();
*/