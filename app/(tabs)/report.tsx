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
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Assignment, Collection, CATEGORIES } from '../../types/types';
import { firestoreService } from '../../services/firestoreService';
import { useUserContext } from '../../contexts/UserContext';
import { timelineUtils } from '@/lib/timelineUtils';
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

    const groupAssignmentsByDate = (assignments: Assignment[]): AssignmentSection[] => {
        const grouped = assignments.reduce((acc, assignment) => {
            if (assignment.startTime) {
                const t = new Date(assignment.startTime.getTime());
                const assignmentDate = new Date(t.setHours(0, 0, 0, 0)).toLocaleDateString(
                    'en-CA', { weekday: 'short', day: 'numeric', month: 'short' });
                if (assignmentDate) {
                    if (!acc[assignmentDate]) {
                        acc[assignmentDate] = [];
                    }
                    acc[assignmentDate].push(assignment);
                };
            };
            return acc;
        }, {} as Record<string, Assignment[]>);
        return Object.entries(grouped).map(([title, data]) => ({
            title,
            data
        }));
    };

    type PayReport = {
        "totalSessions": number;
        "totalAssignmentMinutes": number;
        "totalAssignments": number;
        "sessionInfo": SessionInfo;
        "paidMinutes": number;
        "paidAssignments": number;
        "categoryInfo": CategoryInfo;
        "categorySections": {};
        "assignmentsByDate": {};
    };

    const midnightLastNight = new Date(new Date().setHours(0, 0, 0, 0));

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
    });

    useEffect(() => {
        // fetch the assignments for this user and construct the report
        const constructReport = async () => {
            if (isFocused && userData) {
                try {
                    const newReport = await timelineUtils.getReport(userData, midnightLastNight);
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
                    {/* Descriptive report*/}
                    {userData && (
                        <View style={styles.reportContainer}>
                            <Text style={styles.titleText}>
                                Congratulations {userData.username}!
                            </Text>
                            <Text style={styles.paragraph}>
                                So far today, you have spent
                                <Text style={{ fontWeight: 'bold' }}> {payReport.paidMinutes.toFixed()} minutes</Text> engaged in paid assignments.
                                Thanks to the Ontario Digital Platform Workers' Rights Act, you are guaranteed a minimum
                                wage of $17.20 / hour for those minutes, for a total of
                                <Text style={{ fontWeight: 'bold' }}> ${(17.20 * payReport.paidMinutes / 60).toFixed(2)}!</Text>
                            </Text>
                            {(payReport.totalAssignmentMinutes > payReport.paidMinutes) &&
                                <Text style={styles.paragraph}>
                                    So far today you have also spent a total of
                                    <Text style={{ fontWeight: 'bold' }}> {(payReport.totalAssignmentMinutes - payReport.paidMinutes).toFixed()}&nbsp;minutes </Text>
                                    on unpaid assignments, like office work and administrative tasks.
                                    Even though you won't get paid for that time, we love that you're investing in your future, ensuring that you present
                                    your best self to your constituents and to the City of Toronto.
                                </Text>}
                            <Text style={styles.paragraph}>
                                So far today you have spent a total of <Text style={{ fontWeight: 'bold' }}>{payReport.sessionInfo.minutes.toFixed()} minutes</Text> signed on and
                                available for work. Even though you won't get paid for much of that time, it is great to know you were available for your
                                constituents and coworkers in case anyone needed you. Your earnings were
                                <Text style={{ fontWeight: 'bold' }} > ${(17.20 * payReport.paidMinutes / payReport.sessionInfo.minutes).toFixed(2)} per hour online!</Text>
                            </Text>
                            <Text style={styles.paragraph}>
                                And of course you know that that's before your expenses of office rental, IT resources, phone, supply and maintenance of your equipment,
                                clothes to show your professionalism and more. But surely that's a minor price to pay for the flexibility you now have as a gig worker.
                            </Text>
                            <Text style={styles.paragraph}>Let's make tomorrow an even better day!</Text>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView >
    );
};

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
        paddingHorizontal: 24,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
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