import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
    StyleSheet,
    Text,
    View,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    SectionList,
    FlatList,
    TouchableOpacity,
    SectionListComponent,
} from 'react-native';
import { useIsFocused } from "@react-navigation/native";
import SectionHeader from '@/components/SectionHeader';
import { Assignment, Collection, CATEGORIES, CategoryInfo, PayReport } from '@/types/types';
import { useUserContext } from '@/contexts/UserContext';
import { timelineUtils } from '@/lib/timelineUtils';

export default function ReportScreen() {
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);
    const isFocused = useIsFocused();
    const { userData } = useUserContext();
    const router = useRouter();

    function convertMinutesToHoursAndMinutes(totalMinutes: number): { hours: number; minutes: number } {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return { hours, minutes };
    }

    const createEmptyCategoryInfo = (): CategoryInfo => {
        return CATEGORIES.reduce((acc, category) => {
            acc[category.label] = { minutes: 0, assignmentCount: 0 };
            return acc;
        }, {} as CategoryInfo);
    };

    // Initialize with proper default values
    const [payReport, setPayReport] = useState<PayReport>({
        totalSessions: 0,
        totalAssignmentMinutes: 0,
        totalAssignments: 0,
        sessionInfo: { minutes: 0, sessions: 0 },
        paidMinutes: 0,
        paidAssignments: 0,
        categoryInfo: createEmptyCategoryInfo(),
        categorySections: {},
        assignmentsByDate: {},
        statisticsByDate: {},
    });

    useEffect(() => {
        // fetch the assignments for this user and construct the report
        const constructReport = async () => {
            if (isFocused && userData) {
                try {
                    const newReport = await timelineUtils.getReport(userData);
                    if (newReport) {
                        setPayReport(newReport);
                        setRefresh(!refresh);
                    }
                } catch (e) {
                    console.log("Error in constructReport", e);
                } finally {
                    setLoading(false);
                };
            };
        };
        constructReport();
    }, [isFocused]);

    const openAssignmentForEdit = (id: string) => {
        router.replace({
            pathname: '/(tabs)/add_assignment', // Navigate to the /add_assignment route
            params: { assignmentID: id }
        })
    };

    const displayItem = ({ id, category, description, startTime, endTime }: Assignment) => (
        <TouchableOpacity
            style={styles.reportItem}
            onPress={() => openAssignmentForEdit(id)}
        >
            <Text style={styles.text}>{category}: {description} </Text>
            {endTime ?
                (
                    <Text style={styles.text}>{startTime?.toLocaleDateString('en-CA',
                        {
                            weekday: 'short', day: 'numeric', month: 'short',
                            hour: 'numeric', minute: 'numeric'
                        })} to {endTime?.toLocaleTimeString('en-CA',
                            { hour: 'numeric', minute: 'numeric' })}</Text>
                )
                : (
                    <Text style={styles.text}>In progress, started at {startTime?.toLocaleDateString('en-CA',
                        { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric' })}</Text>
                )}
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.reportContainer}>
                <Text style={styles.text}>Loading data ...</Text>
            </View>
        );
    };

    if (userData && !userData.sessionID) {
        return (
            <SafeAreaView style={styles.safeAreaContainer}>
                <KeyboardAvoidingView
                    style={styles.keyboardAvoid}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={styles.reportSection}>
                        <View style={styles.reportItem}>
                            <Text style={[styles.text, { fontWeight: "bold" }]}>You must sign in to view your report</Text>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeAreaContainer}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
                <View style={styles.reportContainer}>
                    <View style={styles.reportSection}>
                        <Text style={styles.text}>If you see an incorrect assignment, press it to fix it.</Text>
                        <SectionList
                            style={styles.sectionList}
                            sections={payReport.assignmentsByDate}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => displayItem(item)}
                            renderSectionHeader={({ section: { title } }) => (
                                <SectionHeader title={title} />
                            )}
                        />
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    safeAreaContainer: {
        flex: 1,
        color: '#f8f9fa',
        backgroundColor: '#f6f6f6',
    },
    keyboardAvoid: {
        flex: 1,
    },
    reportContainer: {
        flex: 1,
        marginHorizontal: 8,
        paddingTop: 2,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        borderRadius: 4,
    },
    reportSection: {
        marginVertical: 8,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#a0a0a0',
        backgroundColor: '#f6f6f6',
    },
    reportItem: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginHorizontal: 24,
        marginVertical: 8,
        backgroundColor: '#ffffff',
        borderRadius: 8, // Slightly rounded corners
        borderWidth: 1,
        borderColor: '#E0E0E0', // Light gray border
        boxShadow: [{
            offsetX: 2,
            offsetY: 4,
            color: '#E0E0E0',
        }],
        elevation: 2
    },
    text: {
    },
    reportItemText: {
        fontSize: 16,
        //flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        width: 240,
    },
    flatList: {
        // width: '100%', // Ensures the container takes full width
        marginVertical: 0,
        borderBottomWidth: 6,
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#f6f6f6',
        elevation: 0,
    },
    sectionList: {
        // width: '100%', // Ensures the container takes full width
        backgroundColor: '#f9f8fa',
        elevation: 0,
        paddingVertical: 8,
        marginVertical: 8,
    },
    selectedListItem: {
        backgroundColor: '#dfffdf',
    },
    textBoxText: {
        fontSize: 16,
    },
    label: {
        fontSize: 18,
        fontWeight: '600',
        color: '#34495e',
        marginBottom: 8,
        marginLeft: 2,
    },
    item: {
        backgroundColor: '#f9c2ff',
        padding: 20,
        marginVertical: 8,
    },
    header: {
        fontSize: 32,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
    },
});