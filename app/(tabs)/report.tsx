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
    const { userData, setUserData } = useUserContext();
    const [docList, setDocList] = useState([{}]);

    type DailyPayReport = {
        "date": string;
        "totalSessionMinutes": number;
        "totalSessions": number;
        "totalAssignmentMinutes": number;
        "totalAssignments": number;
        "paidMinutes": number;
        "paidAssignments": number;
        "categoryMinutes": { [key: string]: number };
        "categoryAssignments": { [key: string]: number };
    };
    const today = new Date().toDateString();

    const [payReport, setPayReport] = useState<DailyPayReport>({
        "date": today,
        "totalSessionMinutes": 0,
        "totalSessions": 0,
        "totalAssignmentMinutes": 0,
        "totalAssignments": 0,
        "paidMinutes": 0,
        "paidAssignments": 0,
        "categoryMinutes": {},
        "categoryAssignments": {},
    });

    useEffect(() => {
        // fetch the assignments for this user and construct the report
        const constructReport = async () => {
            setDocList([{}]);
            payReport["totalSessionMinutes"] = 0;
            payReport["totalSessions"] = 0;
            payReport["totalAssignmentMinutes"] = 0;
            payReport["totalAssignments"] = 0;
            payReport["paidMinutes"] = 0;
            payReport["paidAssignments"] = 0;
            for (const category of CATEGORIES) {
                payReport["categoryMinutes"][category["label"]] = 0;
                payReport["categoryAssignments"][category["label"]] = 0;
            };
            if (isFocused) {
                try {
                    const sessions = await firestoreService.getAllSessionsByOwner(
                        Collection.session,
                        userData.username);
                    console.log("Fetched ", sessions?.length, "sessions for report");
                    if (sessions) {
                        for (const session of sessions) {
                            if (session.endTime == null) {
                                const sessionMinutes = Math.abs(new Date().getTime() - session.startTime.getTime()) / (60000.0) || 0;
                                payReport["totalSessionMinutes"] += sessionMinutes;
                                payReport["totalSessions"] += 1;
                            } else {
                                const sessionMinutes = Math.abs(session.endTime.getTime() - session.startTime.getTime()) / (60000.0) || 0;
                                payReport["totalSessionMinutes"] += sessionMinutes;
                                payReport["totalSessions"] += 1;
                            };
                        };
                    };
                    const assignments = await firestoreService.getAllAssignmentsByOwner(
                        Collection.assignment,
                        userData.username);
                    console.log("Fetched ", assignments?.length, "assignments for report");
                    if (assignments) {
                        for (const assignment of assignments) {
                            if (assignment.startTime == null || assignment.endTime == null) {
                                console.log("Unfinished assignment, id=", assignment.id);
                                continue;
                            };
                            const docCategory = assignment.category;
                            const docDescription = assignment.description;
                            // doc.data() is never undefined for query doc snapshots
                            if (docList.findIndex(obj => obj.id === assignment.id) === -1) {
                                docList.push({
                                    "id": assignment.id,
                                    "category": docCategory,
                                    "description": docDescription
                                });
                                console.log("Adding ", assignment.id,
                                    "=>", docCategory,
                                    "=>", docDescription,
                                    "to report"
                                );
                            };
                            const assignmentMinutes = Math.abs(assignment.endTime.getTime() - assignment.startTime.getTime()) / (60000.0) || 0;
                            if (assignmentMinutes > 0 && docCategory && docCategory !== "") {
                                payReport["categoryMinutes"][docCategory] += assignmentMinutes;
                                payReport["categoryAssignments"][docCategory] += 1;
                            };
                            const thisCategory = CATEGORIES.find(item => item["label"] === docCategory) || {};
                            if ("label" in thisCategory && "payable" in thisCategory) {
                                console.log("thisCategory = " + thisCategory["label"] + ", " + assignmentMinutes + " minutes");
                                if (assignmentMinutes > 0) {
                                    payReport["totalAssignmentMinutes"] += assignmentMinutes;
                                    payReport["totalAssignments"] += 1;
                                    if (thisCategory["payable"]) {
                                        payReport["paidMinutes"] += assignmentMinutes;
                                        payReport["paidAssignments"] += 1;
                                    }
                                };
                            };
                        };
                        console.log("Report includes ", docList.length, " assignments");
                        setPayReport(payReport);
                        setDocList(docList);
                        setRefresh(!refresh);
                    }; // if (assignments)
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                };
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
                        <View style={styles.reportItem}>
                            <Text style={{ fontWeight: "bold" }}>Total minutes online:</Text>
                            <Text >{payReport["totalSessionMinutes"].toFixed()}</Text>
                            <Text style={{ fontWeight: "bold" }}>Total minutes on assignments:</Text>
                            <Text >{payReport["totalAssignmentMinutes"].toFixed()}</Text>
                            <Text style={{ fontWeight: "bold" }}>Total assignments:</Text>
                            <Text >{payReport["totalAssignments"].toFixed()}</Text>
                        </View>
                        <View style={styles.reportItem}>
                            <Text style={{ fontWeight: "bold" }}>Paid minutes:</Text>
                            <Text >{payReport["paidMinutes"].toFixed()}</Text>
                            <Text style={{ fontWeight: "bold" }}>Paid assignments:</Text>
                            <Text >{payReport["paidAssignments"].toFixed()}</Text>
                        </View>
                    </View>

                    {/* Categories */}
                    <View style={styles.reportSection}>
                        <Text style={styles.label}>Time spent on each category (minutes)</Text>
                        {Object.entries(payReport["categoryMinutes"]).map(([key, value]) => (
                            <View key={key} style={styles.reportItem}>
                                <Text style={{ fontWeight: "bold" }}>{key}: </Text>
                                <Text >{value.toFixed()}</Text>
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