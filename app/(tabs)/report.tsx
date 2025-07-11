import { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    ListRenderItemInfo
} from 'react-native';
import {
    collection,
    query,
    where,
    getDocs,
    DocumentData
} from "firebase/firestore";
import { FIRESTORE_DB, CATEGORIES } from './index';
import { useIsFocused } from "@react-navigation/native";

export default function ReportScreen() {
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const isFocused = useIsFocused();
    type DailyPayReport = {
        "date": string;
        "categoryMinutes": { [key: string]: number };
    };
    type DisplayItem = {
        id: string;
        description: string;
        category: string;
        title: string;
    }
    const [docList, setDocList] = useState([{
        "id": "dummyid",
        "description": "dummy description",
        "category": "Admin",
        "title": "Dummy title"
    }]);
    const today = new Date().toDateString();

    const [payReport, setPayReport] = useState<DailyPayReport>({
        "date": today,
        "categoryMinutes": {}
    });

    useEffect(() => {
        const fetchData = async () => {
            const q = query(collection(FIRESTORE_DB, "gig-council"));
            for (const category of CATEGORIES) {
                payReport["categoryMinutes"][category["label"]] = 0;
            };
            if (isFocused) {
                try {
                    const snapshot = await getDocs(q)
                    snapshot.forEach((doc) => {
                        // doc.data() is never undefined for query doc snapshots
                        if (docList.findIndex(obj => obj.id === doc.id) === -1) {
                            docList.push({
                                "id": doc.id,
                                "category": doc.data()["category"],
                                "description": doc.data()["description"],
                                "title": doc.data()["description"]
                            })
                            console.log("Adding ", doc.id, " => ", doc.data()["category"]);
                        };
                        let minutes = Math.abs(doc.data()["endTime"] - doc.data()["startTime"]) / 60.0;
                        if (minutes > 0 && doc.data()["category"] != "") {
                            payReport["categoryMinutes"][doc.data()["category"]] += minutes;
                            console.log("payReport[\"categoryMinutes\"][\"" + doc.data()["category"] + "\"]=" + payReport["categoryMinutes"][doc.data()["category"]]);
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

    const renderItem = ({ item }: ListRenderItemInfo<DisplayItem>) => {
        return (
            <TouchableOpacity
                style={[
                    styles.listItem,
                    item.id === selectedItem?.id && styles.selectedListItem,
                ]}
                onPress={() => setSelectedItem(item)}
            >
                <Text style={styles.listItemText}>{item["title"]}</Text>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Loading data ...</Text>
            </View>
        )
    };

    return (
        <View style={styles.container}>
            <View style={styles.reportSection}>
                <Text style={styles.label}>Time spent on each category (minutes)</Text>
                {Object.entries(payReport["categoryMinutes"]).map(([key, value]) => (
                    <Text key={key} style={styles.listItem}>
                        <Text style={{ fontWeight: "bold" }}>{key}: </Text>
                        <Text >{value}</Text>
                    </Text>
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        color: "#f8f9fa",
    },
    text: {
    },
    listItem: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fbfafb',
        width: '100%',
    },
    selectedListItem: {
        backgroundColor: '#dfffdf',
    },
    listItemText: {
        fontSize: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#34495e',
        marginBottom: 8,
        marginLeft: 2,
    },
    reportSection: {
        marginVertical: 8,
    },
});