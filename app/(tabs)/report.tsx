import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
    StyleSheet,
    Text,
    View,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    SectionList,
    TouchableOpacity,
} from 'react-native';
import { useIsFocused } from "@react-navigation/native";
import SectionHeader from '@/components/SectionHeader';
import { Assignment, CATEGORIES, Collection, CategoryInfo, PayReport, StatisticsByDate } from '../../types/types';
import { useUserContext } from '@/contexts/UserContext';
import { useStatistics } from '@/contexts/StatisticsContext';
import { timelineUtils } from '@/lib/timelineUtils';
import InfoIcon from '../../components/InfoIcon';

export default function ReportScreen() {
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);
    const isFocused = useIsFocused();
    const { userData } = useUserContext();
    const router = useRouter();
    const [docList, setDocList] = useState<any>([]);
    const { setCurrentStatistics } = useStatistics();

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

    // Define the Section interface that SectionList expects
    interface AssignmentSection {
        title: string; // This is the category name ("Phone call", "Meeting", etc.)
        data: Assignment[]; // Array of assignments in this category
    }

    const midnightLastNight = new Date(new Date().setHours(0, 0, 0, 0));

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

    const displayTextReport = ({ id, date, sessionMinutes, assignmentMinutes, paidMinutes }: StatisticsByDate) => {
        setCurrentStatistics({ id, date, sessionMinutes, assignmentMinutes, paidMinutes });
        router.push({
            pathname: '../modal_text_report', // Navigate to the /add_assignment route
        })
    };

    const displayItem = ({ id, date, sessionMinutes, assignmentMinutes, paidMinutes }: StatisticsByDate) => (
        <TouchableOpacity
            style={styles.reportItem}
            onPress={() => displayTextReport({ id, date, sessionMinutes, assignmentMinutes, paidMinutes })}
        >
            {/*
            <Text style={styles.text}>Time on paid assignment: {(paidMinutes / 60).toFixed()}h:{(paidMinutes % 60).toFixed()}m</Text>
            <Text style={styles.text}>Time on assignment: {(assignmentMinutes / 60).toFixed()}h:{(assignmentMinutes % 60).toFixed()}m</Text>
            <Text style={styles.text}>Time online {(sessionMinutes / 60).toFixed()}h:{(sessionMinutes % 60).toFixed()}m</Text>
                */}
            <Text style={styles.text}>
                You made ${(17.20 * paidMinutes / 60).toFixed(2)} before expenses, which is...
            </Text>
            <Text style={styles.text}>
                $17.20/hr of "engaged time"
            </Text>
            <Text style={styles.text}>
                ${(17.20 * paidMinutes / assignmentMinutes).toFixed(2)}/hr on all assignments.
            </Text>
            <Text style={styles.text}>
                ${(17.20 * paidMinutes / sessionMinutes).toFixed(2)}/hr online.
            </Text>
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
                <View style={styles.reportContainer}>
                    <View style={styles.reportSection}>
                        <SectionList style={styles.sectionList}
                            sections={payReport.statisticsByDate}
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
        paddingVertical: 8,
        marginVertical: 8,
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