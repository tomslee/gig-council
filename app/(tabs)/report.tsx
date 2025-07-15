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
import {
    collection,
    query,
    where,
    getDocs,
} from "firebase/firestore";
import { FIRESTORE_DB, CATEGORIES } from './index';
import { useIsFocused } from "@react-navigation/native";
import { useUser } from '../../contexts/UserContext';

export default function ReportScreen() {
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const isFocused = useIsFocused();
    const { sharedUserData } = useUser();
    const [docList, setDocList] = useState([{}]);

    type DailyPayReport = {
        "date": string;
        "categoryMinutes": { [key: string]: number };
        "totalMinutes": number;
        "paidMinutes": number;
    };
    type DisplayItem = {
        id: string;
        description: string;
        category: string;
    }
    const today = new Date().toDateString();

    const [payReport, setPayReport] = useState<DailyPayReport>({
        "date": today,
        "categoryMinutes": {},
        "totalMinutes": 0,
        "paidMinutes": 0
    });

    useEffect(() => {
        const fetchData = async () => {
            setDocList([{}]);
            const q = query(collection(FIRESTORE_DB, "gig-council"),
                where('owner', '==', sharedUserData["username"])
            );
            for (const category of CATEGORIES) {
                payReport["categoryMinutes"][category["label"]] = 0;
                console.log("Setting categoryMinutes to zero for", category["label"]);
            };
            payReport["totalMinutes"] = 0;
            payReport["paidMinutes"] = 0;
            if (isFocused) {
                try {
                    const snapshot = await getDocs(q)
                    snapshot.forEach((doc) => {
                        if (doc.data()["endTime"] == null) {
                            return;
                        }
                        let category = doc.data()["category"];
                        // doc.data() is never undefined for query doc snapshots
                        if (docList.findIndex(obj => obj.id === doc.id) === -1) {
                            docList.push({
                                "id": doc.id,
                                "category": doc.data()["category"],
                                "description": doc.data()["description"],
                            })
                            console.log("Downloading ", doc.id,
                                "=>", category,
                                "=>", doc.data()["descriotion"]);
                        };
                        let minutes = Math.abs(doc.data()["endTime"].toDate() -
                            doc.data()["startTime"].toDate()) / (60000.0) || 0;
                        console.log("Elapsed time:", minutes);
                        if (minutes > 0 && category != "") {
                            payReport["categoryMinutes"][category] += minutes;
                        };
                        let thisCategory = CATEGORIES.find(item => item["label"] === category) || {};
                        if ("label" in thisCategory && "payable" in thisCategory) {
                            console.log("thisCategory = " + thisCategory["label"] + ", " + minutes + " minutes");
                            if (minutes > 0) {
                                payReport["totalMinutes"] += minutes;
                                if (thisCategory["payable"]) {
                                    payReport["paidMinutes"] += minutes;
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
        )
    };

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
                        </View>
                        <View style={styles.reportItem}>
                            <Text style={{ fontWeight: "bold" }}>Paid minutes:</Text>
                            <Text >{payReport["paidMinutes"].toFixed()}</Text>
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