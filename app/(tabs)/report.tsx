import { useState, useEffect } from 'react';
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
} from 'react-native';
import { useIsFocused } from "@react-navigation/native";
import { Assignment, Collection, CATEGORIES } from '../../types/types';
import { firestoreService } from '../../services/firestoreService';
import { useUserContext } from '../../contexts/UserContext';
import InfoIcon from '../../components/InfoIcon';

export default function ReportScreen() {
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);
    const isFocused = useIsFocused();
    const { userData } = useUserContext();
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
            assignments: number;
        };
    };

    const createEmptyCategoryInfo = (): CategoryInfo => {
        return CATEGORIES.reduce((acc, category) => {
            acc[category.label] = { minutes: 0, assignments: 0 };
            return acc;
        }, {} as CategoryInfo);
    };

    // Define the Section interface that SectionList expects
    interface AssignmentSection {
        title: string; // This is the category name ("Phone call", "Meeting", etc.)
        data: Assignment[]; // Array of assignments in this category
    }

    // Helper function to group assignments by category
    const groupAssignmentsByCategory = (
        assignments: Assignment[]
    ): AssignmentSection[] => {
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
        "date": Date;
        "totalSessions": number;
        "totalAssignmentMinutes": number;
        "totalAssignments": number;
        "sessionInfo": SessionInfo;
        "paidMinutes": number;
        "paidAssignments": number;
        "categoryInfo": CategoryInfo;
        "assignmentSections": {};
    };

    function isDateToday(someDate: Date): boolean {
        const today = new Date(); // Creates a Date object for the current moment

        // Compares year, month (0-indexed), and day of the month
        return (
            someDate.getFullYear() === today.getFullYear() &&
            someDate.getMonth() === today.getMonth() &&
            someDate.getDate() === today.getDate()
        );
    }

    // Initialize with proper default values
    const [payReport, setPayReport] = useState<DailyPayReport>({
        date: new Date(),
        totalSessions: 0,
        totalAssignmentMinutes: 0,
        totalAssignments: 0,
        sessionInfo: { minutes: 0, sessions: 0 },
        paidMinutes: 0,
        paidAssignments: 0,
        categoryInfo: createEmptyCategoryInfo(),
        assignmentSections: {},
    });

    useEffect(() => {
        // fetch the assignments for this user and construct the report
        const constructReport = async () => {
            try {
                if (isFocused && userData) {
                    setDocList([{}]);
                    // Create new report object instead of mutating state directly
                    let todayReport: DailyPayReport = {
                        date: new Date(),
                        totalSessions: 0,
                        totalAssignmentMinutes: 0,
                        totalAssignments: 0,
                        sessionInfo: { minutes: 0, sessions: 0 },
                        paidMinutes: 0,
                        paidAssignments: 0,
                        categoryInfo: createEmptyCategoryInfo(),
                        assignmentSections: {},
                    };
                    for (const category of CATEGORIES) {
                        todayReport.categoryInfo[category.label].minutes = 0;
                        todayReport.categoryInfo[category.label].assignments = 0;
                    };
                    try {
                        // Handle sessions
                        const sessions = await firestoreService.getAllSessionsByOwner(
                            Collection.session,
                            userData.username);
                        if (sessions) {
                            for (const session of sessions) {
                                if (session.startTime && isDateToday(session.startTime)) {
                                    if (session.endTime == null) {
                                        const sessionMinutes = Math.abs(new Date().getTime() - session.startTime.getTime()) / (60000.0) || 0;
                                        todayReport.sessionInfo["minutes"] += sessionMinutes;
                                        todayReport.sessionInfo["sessions"] += 1;
                                    } else {
                                        const sessionMinutes = Math.abs(session.endTime.getTime() - session.startTime.getTime()) / (60000.0) || 0;
                                        todayReport.sessionInfo["minutes"] += sessionMinutes;
                                        todayReport.sessionInfo["sessions"] += 1;
                                    };
                                };
                            };
                        };
                        // Handle assignments
                        const assignments = await firestoreService.getAllAssignmentsByOwner(
                            Collection.assignment,
                            userData.username);
                        if (assignments) {
                            for (const assignment of assignments) {
                                if (assignment.category == '' ||
                                    assignment.startTime == null ||
                                    !isDateToday(assignment.startTime) ||
                                    assignment.endTime == null) {
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
                                    todayReport.categoryInfo[assignmentCategory].minutes += assignmentMinutes;
                                    todayReport.categoryInfo[assignmentCategory].assignments += 1;
                                };
                                const thisCategory = CATEGORIES.find(item => item["label"] === assignmentCategory) || {};
                                if ("label" in thisCategory && "payable" in thisCategory) {
                                    if (assignmentMinutes > 0) {
                                        todayReport.totalAssignmentMinutes += assignmentMinutes;
                                        todayReport.totalAssignments += 1;
                                        if (thisCategory["payable"]) {
                                            todayReport["paidMinutes"] += assignmentMinutes;
                                            todayReport["paidAssignments"] += 1;
                                        }
                                    };
                                };
                            };
                            // Now group the assignments by category and add them in to the structure for presentation
                            todayReport.assignmentSections = groupAssignmentsByCategory(assignments);
                            setPayReport(todayReport);
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

    const Item = ({ id, category, description, startTime, endTime }: Assignment) => (
        <View style={styles.reportItem}>
            <Text style={styles.label}>{id}</Text>
            <Text style={styles.label}>{category}</Text>
            <Text style={styles.label}>{description}</Text>
            <Text style={styles.label}>{startTime?.toLocaleDateString('en-CA', { weekday: 'short', day: 'numeric', month: 'short' })}</Text>
            <Text style={styles.label}>{endTime?.toLocaleDateString('en-CA', { weekday: 'short', day: 'numeric', month: 'short' })}</Text>
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
                <ScrollView
                    style={styles.keyboardAvoid}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={styles.reportSection}>
                        <View style={styles.reportItem}>
                            <Text style={[styles.text, { fontWeight: "bold" }]}>You must sign in to view your report</Text>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeAreaContainer}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView>
                    <View style={styles.reportContainer}>
                        {/* Descriptive report*/}
                        <Text style={styles.titleText}>
                            Congratulations!
                        </Text>
                        <Text style={styles.paragraph}>
                            Today you spent <Text style={{ fontWeight: 'bold' }}>{payReport.paidMinutes.toFixed()} minutes</Text> engaged in paid assignments.
                            Thanks to the Ontario Digital Platform Workers' Rights Act, you are guaranteed a minimum
                            wage of $17.20 / hour for those minutes, for a total of <Text style={{ fontWeight: 'bold' }}>${(17.20 * payReport.paidMinutes / 60).toFixed(2)}!</Text>
                        </Text>.
                        <Text style={styles.paragraph}>
                            Thanks also for spending a total of <Text style={{ fontWeight: 'bold' }}>{(payReport.totalAssignmentMinutes - payReport.paidMinutes).toFixed()}&nbsp;minutes</Text> on unpaid assignments, like office work
                            and administrative tasks. Even though you won't get paid for that time,
                            we love that you're investing in your future, ensuring that you present your best self to your constituents and to the City of Toronto.
                        </Text>
                        <Text style={styles.paragraph}>
                            And let's not forget, thanks also for spending a total of <Text style={{ fontWeight: 'bold' }}>{payReport.sessionInfo.minutes.toFixed()} minutes</Text> signed on and
                            available for work. Even though you won't get paid for much of that time, it is great to know you were available for your
                            constituents and coworkers in case anyone needed you.
                        </Text>
                        <Text style={styles.paragraph}>Let's make tomorrow an even better day!</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView >
    );
};

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
        backgroundColor: 'white',
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
        flexDirection: 'row', // Arranges children horizontally
        justifyContent: 'space-evenly', // This evenly distributes the form elements
        width: '100%', // Ensures the container takes full width
        paddingHorizontal: 10, // Adds some padding for better visual appearance
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        borderRadius: 4,
        backgroundColor: '#fbfafb',
        elevation: 2,
    },
    text: {
        fontSize: 18,
        marginTop: 8,
    },
    reportItemText: {
        fontSize: 16,
        //flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        width: 240,
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
    titleText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#34495e',
        marginBottom: 8,
        marginLeft: 2,
        alignSelf: 'center',
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
    paragraph: {
        fontFamily: 'serif',
        fontSize: 18,
        lineHeight: 24,
        marginBottom: 16,
        color: '#333',
    },
});