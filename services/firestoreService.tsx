// services/firestoreService.js
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  FieldPath
} from 'firebase/firestore';
import { FIRESTORE_DB } from '../lib/firebase';

export const firestoreService = {

  // Get all documents owned by one user
    async getAllAssignmentsByOwner(collectionName: string, owner: string) {
        try {
            const q = query(collection(FIRESTORE_DB, "gig-council"),
                where('owner', '==', owner));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
        }  catch (error) {
            console.error('Error getting documents ', error);
        };
    },

  // Get all open documents owned by one user
    async getAllOpenAssignmentsByOwner(collectionName: string, owner: string) {
        try {
            const q = query(collection(FIRESTORE_DB, "gig-council"),
                where('owner', '==', owner),
            where('endTime', '==', null));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
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

  // Query with filters
  async queryWhere(collectionName: string, filters = [], orderByField = null, limitCount = null) {
    try {
      const collectionRef = collection(FIRESTORE_DB, collectionName);
      let q = collectionRef;

      // Apply where filters
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });

      // Apply ordering
      if (orderByField) {
        q = query(q, orderBy(orderByField.field, orderByField.direction || 'asc'));
      }

      // Apply limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error querying ${collectionName}:`, error);
      throw error;
    }
  },

  // Paginated query
  async queryPaginated(collectionName: string, options = {}) {
    try {
      const {
        filters = [],
        orderByField = null,
        limitCount = 10,
        lastDoc = null
      } = options;

      const collectionRef = collection(FIRESTORE_DB, collectionName);
      let q = collectionRef;

      // Apply filters
      filters.forEach((filter: { field: string | FieldPath; operator: string; value: unknown; }) => {
        return q = query(q, where(filter.field, filter.operator, filter.value));
      });

      // Apply ordering (required for pagination)
      if (orderByField) {
        q = query(q, orderBy(orderByField.field, orderByField.direction || 'asc'));
      }

      // Apply pagination
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      q = query(q, limit(limitCount));

      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        data: results,
        lastDoc: snapshot.docs[snapshot.docs.length - 1], // For next page
        hasMore: snapshot.docs.length === limitCount
      };
    } catch (error) {
      console.error(`Error with paginated query:`, error);
      throw error;
    }
  },

  // Create a new document
  async create(collectionName: string, data: any) {
    try {
      const collectionRef = collection(FIRESTORE_DB, collectionName);
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return {
        id: docRef.id,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error(`Error creating document:`, error);
      throw error;
    }
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

  // Real-time listener
  subscribe(collectionName: string, callback: (arg0: { id: string; }[]) => void, options = {}) {
    try {
      const { filters = [], orderByField = null, limitCount = null } = options;
      
      const collectionRef = collection(FIRESTORE_DB, collectionName);
      let q = collectionRef;

      // Apply filters
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });

      // Apply ordering
      if (orderByField) {
        q = query(q, orderBy(orderByField.field, orderByField.direction || 'asc'));
      }

      // Apply limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const results = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(results);
      });

      return unsubscribe; // Return function to unsubscribe
    } catch (error) {
      console.error(`Error setting up listener:`, error);
      throw error;
    }
  }
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