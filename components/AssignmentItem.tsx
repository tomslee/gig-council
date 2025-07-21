// Individual category item component
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    LayoutAnimation,
} from 'react-native';
import { Assignment } from '../types/types';
interface AssignmentItemProps {
    assignment: Assignment;
}
import { Ionicons } from '@expo/vector-icons';


const AssignmentItem: React.FC<AssignmentItemProps> = ({ assignment }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpanded = () => {
        // Smooth animation for expand/collapse
        LayoutAnimation.configureNext({
            duration: 300,
            create: { type: 'easeInEaseOut', property: 'opacity' },
            update: { type: 'easeInEaseOut' },
        });
        setExpanded(!expanded);
    };

    return (
        <View style={styles.assignmentContainer}>
            {/* Main category header */}
            <TouchableOpacity
                style={styles.assignmentHeader}
                onPress={toggleExpanded}
                activeOpacity={0.7}
            >
                <View style={styles.categoryLeft}>
                    {/* <View style={[styles.colorIndicator, { backgroundColor: item.color }]} /> */}
                    <View style={styles.assignmentInfo}>
                        {assignment.endTime && <Text style={styles.completed}>✓ </Text>}
                        <Text style={styles.categoryName}>{assignment.startTime?.toLocaleDateString('en-CA')}: {assignment.description}</Text>
                        {/* <Text style={styles.categoryTime}>{item.totalTime}</Text> */}
                        {/* </View> */}
                    </View>
                </View>
            </TouchableOpacity>

            {/* Progress bar */}
            {/*
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${item.percentage}%`, backgroundColor: item.color }
                        ]}
                    />
                </View>
            </View>
            */}

            {/* Expanded details */}
            {expanded && (
                <View style={styles.detailsContainer}>
                    <View style={styles.detailsHeader}>
                        <Text style={styles.detailsTitle}>Breakdown</Text>
                    </View>
                    <View key={assignment.id} style={styles.detailItem}>
                        <View style={styles.detailLeft}>
                            <Text style={styles.activityDescription}>{assignment.description}</Text>
                        </View>
                        <Text style={styles.activityName}>{assignment.startTime?.toLocaleDateString('en-CA')}</Text>
                        {assignment.endTime && <Text style={styles.completed}> ✓ </Text>}
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    listContent: {
        padding: 16,
    },

    // Category item styles
    assignmentContainer: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 12,
        marginHorizontal: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    assignmentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    categoryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    colorIndicator: {
        width: 4,
        height: 40,
        borderRadius: 2,
        marginRight: 12,
    },
    assignmentInfo: {
        flexDirection: 'row',
        flex: 1,
    },
    categoryName: {
        fontSize: 16,
        //fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    categoryTime: {
        fontSize: 16,
        color: '#666',
    },
    categoryRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    percentage: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginRight: 8,
    },
    chevron: {
        marginLeft: 4,
    },

    // Progress bar styles
    progressContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },

    // Details styles
    detailsContainer: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        backgroundColor: '#fafafa',
    },
    detailsHeader: {
        padding: 16,
        paddingBottom: 8,
    },
    detailsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    detailLeft: {
        flex: 1,
        marginRight: 12,
    },
    activityName: {
        fontSize: 16,
        // fontWeight: '500',
        color: '#333',
        marginBottom: 2,
    },
    activityDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 18,
    },
    activityTime: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    summaryStats: {
        padding: 16,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e8e8e8',
    },
    summaryText: {
        fontSize: 12,
        color: '#888',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    completed: {
        fontSize: 16,
        color: '#66B2B2',
        //fontWeight: 'bold',
    },
});


export default AssignmentItem;