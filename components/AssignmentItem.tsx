import { View, Text, StyleSheet } from 'react-native';
import { Assignment } from '../app/(tabs)/index';
interface AssignmentItemProps {
    assignment: Assignment;
}

const AssignmentItem: React.FC<AssignmentItemProps> = ({ assignment }) => {
    return (
        <View style={styles.assignmentItem}>
            <Text style={styles.title}>{assignment.title}</Text>
            {assignment.description && (
                <Text style={styles.description}>{assignment.description}</Text>
            )}
            <Text style={styles.priority}>Priority: {assignment.priority}</Text>
            {assignment.completed && <Text style={styles.completed}>✓ Completed</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    assignmentItem: {
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    priority: {
        fontSize: 12,
        color: '#888',
    },
    completed: {
        fontSize: 12,
        color: 'green',
        fontWeight: 'bold',
    },
});

export default AssignmentItem;