import { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView
} from 'react-native';
import { Collection, CATEGORIES } from './index';
import { firestoreService } from '../../services/firestoreService';
import { useIsFocused } from "@react-navigation/native";
import { useUserContext } from '../../contexts/UserContext';

export default function ReportScreen() {
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);
    const isFocused = useIsFocused();
    const { userData } = useUserContext();
    const [docList, setDocList] = useState<any>([]);

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

    type DailyPayReport = {
        "date": string;
        "totalSessions": number;
        "totalAssignmentMinutes": number;
        "totalAssignments": number;
        "sessionInfo": SessionInfo;
        "paidMinutes": number;
        "paidAssignments": number;
        "categoryInfo": CategoryInfo;
        "categoryAssignments": { [key: string]: number };
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
        categoryAssignments: {},
    });

    useEffect(() => {
        // fetch the assignments for this user and construct the report
        const constructReport = async () => {
            try {
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
                    categoryAssignments: {},
                };
                for (const category of CATEGORIES) {
                    newReport.categoryInfo[category.label].minutes = 0;
                    newReport.categoryInfo[category.label].assignments = 0;
                };
                if (isFocused && userData) {
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
                                if (assignment.startTime == null || assignment.endTime == null) {
                                    continue;
                                };
                                const docCategory = assignment.category;
                                const docDescription = assignment.description;
                                // doc.data() is never undefined for query doc snapshots
                                if (docList.findIndex(obj => obj.id === assignment.id) === -1) {
                                    docList.push({
                                        id: assignment.id,
                                        category: docCategory,
                                        description: docDescription
                                    });
                                    console.log("Adding ", assignment.id,
                                        "=>", docCategory,
                                        "=>", docDescription,
                                        "to report"
                                    );
                                };
                                const assignmentMinutes = Math.abs(assignment.endTime.getTime() - assignment.startTime.getTime()) / (60000.0) || 0;
                                if (assignmentMinutes > 0 && docCategory && docCategory !== "") {
                                    newReport.categoryInfo[docCategory].minutes += assignmentMinutes;
                                    newReport.categoryInfo[docCategory].assignments += 1;
                                    newReport.categoryAssignments[docCategory] += 1;
                                };
                                const thisCategory = CATEGORIES.find(item => item["label"] === docCategory) || {};
                                if ("label" in thisCategory && "payable" in thisCategory) {
                                    console.log("thisCategory = " + thisCategory["label"] + ", " + assignmentMinutes + " minutes");
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
                            console.log("Report includes ", docList.length, " assignments");
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
                    <ScrollView style={styles.reportContainer}>
                        <View style={styles.reportSection}>
                            <View style={styles.reportItem}>
                                <Text style={[styles.text, { fontWeight: "bold" }]}>You must sign in to view your report</Text>
                            </View>
                        </View>
                    </ScrollView>
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
                <ScrollView style={styles.reportContainer}
                    contentContainerStyle={styles.reportContainerContent}
                >

                    {/* Overview */}
                    <View style={styles.reportSection}>
                        <Text style={styles.label}>Overview</Text>
                        <View style={[styles.reportItem, { flexDirection: 'column' }]}>
                            <Text style={{ fontWeight: "bold" }}>Total minutes online:</Text>
                            <Text >{payReport.sessionInfo.minutes.toFixed()}</Text>
                            <Text style={{ fontWeight: "bold" }}>Total minutes on assignments:</Text>
                            <Text >{payReport.totalAssignmentMinutes.toFixed()}</Text>
                            <Text style={{ fontWeight: "bold" }}>Total assignments:</Text>
                            <Text >{payReport.totalAssignments.toFixed()}</Text>
                        </View>
                        <View style={styles.reportItem}>
                            <Text style={{ fontWeight: "bold" }}>Paid minutes:</Text>
                            <Text >{payReport.paidMinutes.toFixed()}</Text>
                            <Text style={{ fontWeight: "bold" }}>Paid assignments:</Text>
                            <Text >{payReport.paidAssignments.toFixed()}</Text>
                        </View>
                    </View>

                    {/* Categories */}
                    <View style={styles.reportSection}>
                        <Text style={styles.label}>Time spent on each category (minutes)</Text>
                        {/* console.log(payReport.categoryInfo) */}
                        {Object.entries(payReport.categoryInfo).map(([key, value]) => (
                            <View key={key} style={styles.reportItem}>
                                <Text style={{ fontWeight: "bold" }}>{key}: </Text>
                                <Text >{value.minutes.toFixed()}</Text>
                            </View>
                        ))}
                    </View>
                    {/*
            <View style={styles.reportSection}>
                <Text style={styles.label}>Retrieved {docList.length} assignments</Text>
                <FlatList
                    data={docList}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    extraData={refresh}
                />
            </View>
            */}
                </ScrollView>
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
        marginVertical: 8,
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
    },
    reportItemText: {
        fontSize: 16,
        //flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        width: 240,
    },
    selectedListItem: {
        backgroundColor: '#dfffdf',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#34495e',
        marginBottom: 8,
        marginLeft: 2,
    },
});