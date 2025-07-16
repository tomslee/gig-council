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
import { CATEGORIES } from './index';
import { firestoreService } from '../../services/firestoreService';
import { useIsFocused } from "@react-navigation/native";
import { useUserContext } from '../../contexts/UserContext';

export default function ReportScreen() {
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);
    const isFocused = useIsFocused();
    const { userData } = useUserContext();
    const [docList, setDocList] = useState([{}]);

    type DailyPayReport = {
        "date": string;
        "categoryMinutes": { [key: string]: number };
        "categoryAssignments": { [key: string]: number };
        "totalMinutes": number;
        "totalAssignments": number;
        "paidMinutes": number;
        "paidAssignments": number;
    };
    const today = new Date().toDateString();

    const [payReport, setPayReport] = useState<DailyPayReport>({
        "date": today,
        "categoryMinutes": {},
        "categoryAssignments": {},
        "totalMinutes": 0,
        "totalAssignments": 0,
        "paidMinutes": 0,
        "paidAssignments": 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            setDocList([{}]);
            for (const category of CATEGORIES) {
                payReport["categoryMinutes"][category["label"]] = 0;
                payReport["categoryAssignments"][category["label"]] = 0;
                console.log("Setting categoryMinutes to zero for", category["label"]);
            };
            payReport["totalMinutes"] = 0;
            payReport["paidMinutes"] = 0;
            payReport["totalAssignments"] = 0;
            payReport["paidAssignments"] = 0;
            if (isFocused) {
                try {
                    const snapshot = await firestoreService.getAllAssignmentsByOwner('gig-council', userData.username);
                    snapshot.forEach(assignment => {
                        if (assignment.endTime == null) {
                            return;
                        }
                        const docCategory = assignment.category;
                        const docDescription = assignment.description;
                        // doc.data() is never undefined for query doc snapshots
                        if (docList.findIndex(obj => obj.id === assignment.id) === -1) {
                            docList.push({
                                "id": assignment.id,
                                "category": docCategory,
                                "description": docDescription
                            });
                            console.log("Downloading ", assignment.id,
                                "=>", docCategory,
                                "=>", docDescription
                            );
                        };
                        const minutes = Math.abs(assignment.endTime.toDate() -
                            assignment.startTime.toDate()) / (60000.0) || 0;
                        console.log("Elapsed time:", minutes);
                        if (minutes > 0 && docCategory != "") {
                            payReport["categoryMinutes"][docCategory] += minutes;
                            payReport["categoryAssignments"][docCategory] += 1;
                        };
                        const thisCategory = CATEGORIES.find(item => item["label"] === docCategory) || {};
                        if ("label" in thisCategory && "payable" in thisCategory) {
                            console.log("thisCategory = " + thisCategory["label"] + ", " + minutes + " minutes");
                            if (minutes > 0) {
                                payReport["totalMinutes"] += minutes;
                                payReport["totalAssignments"] += 1;
                                if (thisCategory["payable"]) {
                                    payReport["paidMinutes"] += minutes;
                                    payReport["paidAssignments"] += 1;
                                }
                            };
                        };
                    });
                    console.log("A total of " + docList.length + " assignments");
                    setPayReport(payReport);
                    setDocList(docList);
                    setRefresh(!refresh);
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
        };
        fetchData();
    }, [isFocused]);

    /*
    const renderItem = ({ item }: ListRenderItemInfo<DisplayItem>) => {
        return (
            <TouchableOpacity
                style={[
                    styles.reportItem,
                    item.id === selectedItem?.id && styles.selectedListItem,
                ]}
                onPress={() => setSelectedItem(item)}
            >
                <Text style={styles.reportItemText}>{item["description"]}</Text>
            </TouchableOpacity>
        );
    };
    */

    if (loading) {
        return (
            <View style={styles.reportContainer}>
                <Text style={styles.text}>Loading data ...</Text>
            </View>
        );
    };

    if (!userData.isSignedIn) {
        return (
            <SafeAreaView style={styles.safeAreaContainer}>
                <KeyboardAvoidingView
                    style={styles.keyboardAvoid}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView style={styles.reportContainer}>
                    <View style={styles.reportSection}>
                        <View style={styles.reportItem}>
                        <Text style={[styles.text, {fontWeight: "bold"}]}>You must sign in to view your report</Text>
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
                            <Text style={{ fontWeight: "bold" }}>Total minutes:</Text>
                            <Text >{payReport["totalMinutes"].toFixed()}</Text>
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