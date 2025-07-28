import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
    StyleSheet,
    Text,
    View,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    FlatList,
    ScrollView,
    SectionList,
    TouchableOpacity,
} from 'react-native';
import { useIsFocused } from "@react-navigation/native";
import { Assignment, Collection, CATEGORIES } from '../../types/types';
import { firestoreService } from '../../services/firestoreService';
import { useUserContext } from '../../contexts/UserContext';
import SectionHeader from '../../components/SectionHeader';
import AssignmentItem from '../../components/AssignmentItem';
import InfoIcon from '../../components/InfoIcon';

export default function ReportScreen() {
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);
    const isFocused = useIsFocused();
    const { userData } = useUserContext();
    const router = useRouter();
    const [docList, setDocList] = useState<any>([]);

    function convertMinutesToHoursAndMinutes(totalMinutes: number): { hours: number; minutes: number } {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return { hours, minutes };
    }


    class SessionInfo {
        minutes: number;
        sessions: number;
        constructor(data: { minutes: number; sessions: number }) {
            this.minutes = data.minutes;
            this.sessions = data.sessions;
        }
    };

    type CategoryInfo = {
        [key: string]: {
            minutes: number;
            assignmentCount: number;
        };
    };

    const createEmptyCategoryInfo = (): CategoryInfo => {
        return CATEGORIES.reduce((acc, category) => {
            acc[category.label] = { minutes: 0, assignmentCount: 0 };
            return acc;
        }, {} as CategoryInfo);
    };

    // Define the Section interface that SectionList expects
    interface AssignmentSection {
        title: string; // This is the category name ("Phone call", "Meeting", etc.)
        data: Assignment[]; // Array of assignments in this category
    }

    // Helper function to group assignments by category
    const groupAssignmentsByCategory = (assignments: Assignment[]): AssignmentSection[] => {
        const grouped = assignments.reduce((acc, assignment) => {
            const { category } = assignment;

            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(assignment);

            return acc;
        }, {} as Record<string, Assignment[]>);

        return Object.entries(grouped).map(([title, data]) => ({
            title,
            data
        }));
    };

    type DailyPayReport = {
        "date": string;
        "totalSessions": number;
        "totalAssignmentMinutes": number;
        "totalAssignments": number;
        "sessionInfo": SessionInfo;
        "paidMinutes": number;
        "paidAssignments": number;
        "categoryInfo": CategoryInfo;
        "categorySections": {};
        "assignmentSections": {};
        "assignments": Assignment[];
    };

    // Initialize with proper default values
    const [payReport, setPayReport] = useState<DailyPayReport>({
        date: new Date().toDateString(),
        totalSessions: 0,
        totalAssignmentMinutes: 0,
        totalAssignments: 0,
        sessionInfo: { minutes: 0, sessions: 0 },
        paidMinutes: 0,
        paidAssignments: 0,
        categoryInfo: createEmptyCategoryInfo(),
        categorySections: {},
        assignmentSections: {},
        assignments: [],
    });

    useEffect(() => {
        // fetch the assignments for this user and construct the report
        const constructReport = async () => {
            try {
                if (isFocused && userData) {
                    setDocList([{}]);
                    // Create new report object instead of mutating state directly
                    let newReport: DailyPayReport = {
                        date: new Date().toDateString(),
                        totalSessions: 0,
                        totalAssignmentMinutes: 0,
                        totalAssignments: 0,
                        sessionInfo: { minutes: 0, sessions: 0 },
                        paidMinutes: 0,
                        paidAssignments: 0,
                        categoryInfo: createEmptyCategoryInfo(),
                        categorySections: {},
                        assignmentSections: {},
                        assignments: [],
                    };
                    for (const category of CATEGORIES) {
                        newReport.categoryInfo[category.label].minutes = 0;
                        newReport.categoryInfo[category.label].assignmentCount = 0;
                    };
                    try {
                        const sessions = await firestoreService.getAllSessionsByOwner(
                            Collection.session,
                            userData.username);
                        if (sessions) {
                            for (const session of sessions) {
                                if (session.startTime) {
                                    if (session.endTime == null) {
                                        const sessionMinutes = Math.abs(new Date().getTime() - session.startTime.getTime()) / (60000.0) || 0;
                                        newReport.sessionInfo["minutes"] += sessionMinutes;
                                        newReport.sessionInfo["sessions"] += 1;
                                    } else {
                                        const sessionMinutes = Math.abs(session.endTime.getTime() - session.startTime.getTime()) / (60000.0) || 0;
                                        newReport.sessionInfo["minutes"] += sessionMinutes;
                                        newReport.sessionInfo["sessions"] += 1;
                                    };
                                };
                            };
                        };
                        const assignments = await firestoreService.getAllAssignmentsByOwner(
                            Collection.assignment,
                            userData.username);
                        if (assignments) {
                            for (const assignment of assignments) {
                                if (assignment.category == '' || assignment.startTime == null || assignment.endTime == null) {
                                    continue;
                                };
                                const assignmentCategory = assignment.category;
                                const docDescription = assignment.description;
                                // doc.data() is never undefined for query doc snapshots
                                if (docList.findIndex(obj => obj.id === assignment.id) === -1) {
                                    docList.push({
                                        id: assignment.id,
                                        category: assignmentCategory,
                                        description: docDescription
                                    });
                                };
                                const assignmentMinutes = Math.abs(assignment.endTime.getTime() - assignment.startTime.getTime()) / (60000.0) || 0;
                                if (assignmentMinutes > 0 && assignmentCategory && assignmentCategory !== "") {
                                    newReport.categoryInfo[assignmentCategory].minutes += assignmentMinutes;
                                    newReport.categoryInfo[assignmentCategory].assignmentCount += 1;
                                };
                                const thisCategory = CATEGORIES.find(item => item["label"] === assignmentCategory) || {};
                                if ("label" in thisCategory && "payable" in thisCategory) {
                                    if (assignmentMinutes > 0) {
                                        newReport.totalAssignmentMinutes += assignmentMinutes;
                                        newReport.totalAssignments += 1;
                                        if (thisCategory["payable"]) {
                                            newReport["paidMinutes"] += assignmentMinutes;
                                            newReport["paidAssignments"] += 1;
                                        }
                                    };
                                };
                            };
                            console.log("Report includes", docList.length, "assignments.");
                            // Now group the assignments by category and add them in to the structure for presentation
                            assignments.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
                            newReport.assignmentSections = groupAssignmentsByCategory(assignments);
                            newReport.assignments = assignments;
                            setPayReport(newReport);
                            setDocList(docList);
                            setRefresh(!refresh);
                        }; // if (assignments)
                    } catch (err) {
                        console.error(err);
                    } finally {
                        setLoading(false);
                    };
                };
            } catch (e) {
                console.log("Error in constructReport", e);
            } finally {
                setLoading(false);
            };
        };
        constructReport();
    }, [isFocused]);

    const openAssignmentForEdit = (id: string) => {
        router.push({
            pathname: '/add_assignment', // Navigate to the /add_assignment route
            params: { assignmentID: id }
        })
    };

    const Item = ({ id, category, description, startTime, endTime }: Assignment) => (
        <View style={styles.reportItem}>
            <Text style={styles.label}>{id}</Text>
            <Text style={styles.label}>{category}</Text>
            <Text style={styles.label}>{description}</Text>
            <Text style={styles.label}>{startTime?.toLocaleDateString('en-CA',
                { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric' })}</Text>
            <Text style={styles.label}>{endTime?.toLocaleDateString('en-CA',
                { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric' })}</Text>
        </View>
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
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.reportContainer}>

                    {/* Categories */}
                    {/*
                    <View style={styles.reportSection}>
                        <Text style={styles.label}>Time spent on each category (minutes)</Text>
                        {Object.entries(payReport.categoryInfo).map(([key, value]) => (
                            <View key={key} style={styles.reportItem}>
                                <Text style={{ fontWeight: "bold" }}>{key}: </Text>
                                <Text >{value.minutes.toFixed()} mins.</Text>
                                <Text >{value.assignmentCount.toFixed()} assignments.</Text>
                            </View>
                        ))}
                    </View>
                    */}
                    <View style={styles.reportSection}>
                        <Text style={styles.text}>If you see an incorrect assignment, press it to fix it.</Text>
                        <FlatList
                            style={styles.flatList}
                            data={payReport.assignments}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.reportItem}
                                    onPress={() => openAssignmentForEdit(item.id)}
                                >
                                    <Text style={styles.text}>{item.category}: {item.description}</Text>
                                    <Text style={styles.text}>{item.startTime?.toLocaleDateString('en-CA',
                                        { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric' })}
                                        to {item.endTime?.toLocaleTimeString('en-CA',
                                            { hour: 'numeric', minute: 'numeric' })}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        {/*
                        <SectionList
                            style={styles.sectionList}
                            sections={payReport.assignmentSections}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => <AssignmentItem assignment={item} />}
                            renderSectionHeader={({ section: { title } }) => (
                                <SectionHeader title={title} />
                            )}
                        />
                        */}
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
    },
    keyboardAvoid: {
        flex: 1,
    },
    reportContainer: {
        flex: 1,
        marginHorizontal: 8,
        paddingHorizontal: 24,
        paddingTop: 2,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        borderRadius: 4,
    },
    reportContainerContent: {
    },
    reportSection: {
        marginTop: 8,
        marginBottom: 8,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    reportItem: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginHorizontal: 8,
        marginVertical: 8,
        backgroundColor: '#FFFFFF', // White background
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
    /*
    reportItem: {
        flexDirection: 'column', // Arranges children horizontally
        justifyContent: 'space-evenly', // This evenly distributes the form elements
        paddingHorizontal: 10, // Adds some padding for better visual appearance
        paddingVertical: 16,
        margin: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        borderRadius: 8,
        backgroundColor: '#fbfafb',
        boxShadow: [{
            color: '#E0E0E0',
            offsetX: 2,
            offsetY: 4,
            blurRadius: 2,
        }],
        elevation: 4,
    },
    */
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
        backgroundColor: '#f9f8fa',
        elevation: 0,
    },
    sectionList: {
        // width: '100%', // Ensures the container takes full width
        marginVertical: 0,
        borderBottomWidth: 6,
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#f9f8fa',
        elevation: 0,
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