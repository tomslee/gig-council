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
import { FIRESTORE_DB, Assignment } from './index';
import { useIsFocused } from "@react-navigation/native";

export default function ReportScreen() {
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const isFocused = useIsFocused();
    type DisplayItem = {
        id: string;
        description: string;
        category: string;
        title: string;
    }
    const [displayList, setDisplayList] = useState([{
        "id": "dummyid",
        "description": "dummy description",
        "category": "Admin",
        "title": "Dummy title"
    }]);

    useEffect(() => {
        const fetchData = async () => {
            const q = query(collection(FIRESTORE_DB, "gig-council"),
                where("category", "==", "Admin"));
            if (isFocused) {
                try {
                    const snapshot = await getDocs(q)
                    snapshot.forEach((doc) => {
                        // doc.data() is never undefined for query doc snapshots
                        if (displayList.findIndex(obj => obj.id === doc.id) === -1) {
                            displayList.push({
                                "id": doc.id,
                                "category": doc.data()["category"],
                                "description": doc.data()["description"],
                                "title": doc.data()["description"]
                            })
                            console.log("Adding ", doc.id, " => ", doc.data()["description"]);
                        }
                    });
                    console.log("A total of " + displayList.length + " assignments");
                    setDisplayList(displayList);
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
                <Text style={styles.label}>Retrieved {displayList.length} assignments</Text>
                <FlatList
                    data={displayList}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    extraData={refresh}
                />
            </View>
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
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fbfafb',
        width: 320,
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