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
} from 'firebase/firestore';
import { FIRESTORE_DB } from '../lib/firebase';
import { Assignment, Session } from '../app/(tabs)/index';

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
        startTime: doc.data().startTime.toDate(),
        endTime: doc.data().endTime ? doc.data().endTime.toDate() : null,
      })) as Assignment[];
    } catch (error) {
      console.error('Error getting documents ', error);
    };
  },

  // Get all open assignments owned by one user
  async getAllOpenAssignmentsByOwner(collectionName: string, owner: string) {
    try {
      const q = query(collection(FIRESTORE_DB, collectionName),
        where('owner', '==', owner),
        where('endTime', '==', null));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime.toDate(),
      })) as Assignment[];
    } catch (error) {
      console.error('Error getting assignments ', error);
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
          ...docSnap.data(),
          startTime: docSnap.data().startTime.toDate(),
          endTime: docSnap.data().endTime ? docSnap.data().endTime.toDate() : null,
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error getting document ${docId}:`, error);
      throw error;
    }
  },

  // Create a new assignment
  async createAssignment(collectionName: string, newAssignment: Assignment) {
    try {
      const collectionRef = collection(FIRESTORE_DB, collectionName);
      const startTime = new Date();
      const docRef = await addDoc(collectionRef, {
        ...newAssignment,
        startTime: startTime,
      });
      console.log(`Created assignment id=`, docRef.id);
      return {
        id: docRef.id,
        ...newAssignment,
        startTime: startTime,
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
      const endTime = new Date();
      await updateDoc(docRef, {
        ...assignment,
        endTime: endTime,
      });
      console.log('Assignment ', assignment.id, 'closed');

      return {
        ...assignment,
        endTime: endTime,
      };
    } catch (error) {
      console.error(`Error closing assignment:`, error);
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

  // Create a new session (log in for work)
  async createSession(collectionName: string, newSession: Session) {
    try {
      const collectionRef = collection(FIRESTORE_DB, collectionName);
      const startTime = new Date();
      const docRef = await addDoc(collectionRef, {
        ...newSession,
        startTime: startTime,
      });
      console.log(`Created session id=`, docRef.id);
      return {
        id: docRef.id,
        ...newSession,
        startTime: startTime,
      };
    } catch (error) {
      console.error(`Error creating session:`, error);
      throw error;
    }
  },

  // Get all sessions owned by one user
  async getAllSessionsByOwner(collectionName: string, owner: string) {
    try {
      const q = query(collection(FIRESTORE_DB, collectionName),
        where('owner', '==', owner));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime.toDate(),
      })) as Session[];
    } catch (error) {
      console.error('Error getting sessions ', error);
    };
  },

  // Get all open sessions owned by one user (there should be only one)
  async getAllOpenSessionsByOwner(collectionName: string, owner: string) {
    try {
      const q = query(collection(FIRESTORE_DB, collectionName),
        where('owner', '==', owner),
        where('endTime', '==', null));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime.toDate(),
      })) as Session[];
    } catch (error) {
      console.error('Error getting sessions ', error);
    };
  },

  // Close a session
  async closeSession(collectionName: string, session: Session) {
    try {
      const endTime = new Date();
      const docRef = doc(collection(FIRESTORE_DB, collectionName),
        session.id);
      await updateDoc(docRef, {
        ...session,
        endTime: endTime,
      });
      console.log('Session ', session.id, 'closed');

      return {
        ...session,
        endTime: endTime,
      };
    } catch (error) {
      console.error('Error closing session', session.id, error);
      throw error;
    }
  },

  // Close a session (log out of work)
  async closeAllSessionsForOwner(collectionName: string, owner: string) {
    try {
      const openSessions = await firestoreService.getAllOpenSessionsByOwner(
        collectionName, owner);
      if (openSessions) {
        for (const openSession of openSessions) {
          console.log("Calling closeSession for session", openSession.id);
          await firestoreService.closeSession(
            collectionName, openSession);
        };
      };
    } catch (e) {
      console.error('Error closing sessions', e);
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