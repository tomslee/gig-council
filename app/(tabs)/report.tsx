import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { collection, query, where, orderBy, limit, getDocs } from '@react-native-firebase/firestore';
import { FIRESTORE_DB, Assignment } from './index';

export default function ReportScreen() {
    const getAssignments = async () => {
        try {
            const q = query(
                collection(FIRESTORE_DB, 'gig-council'),
                limit(10)
            );

            const querySnapshot = await getDocs(q);
            const assignments = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return assignments.length;
        } catch (error) {
            console.error('Error fetching assignments:', error);
            return 0;
        }
    };

    useEffect(() => {
        const assignments = collection(FIRESTORE_DB, 'git-council').get();
        return assignments;

        return onValue(collection(FIRESTORE_DB, 'gig-council'), (querySnapShot: { val: () => {}; }) => {
            let data = querySnapShot.val() || {};
            let assignments = { ...data };
            setReport(assignments);
        });
    }, []);

    const setReport = (assignments: {}) => {
    };


    return (
        <View style={styles.container}>
            <Text style={styles.text}>Report has items</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
    },
});