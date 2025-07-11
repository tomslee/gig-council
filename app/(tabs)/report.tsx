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

export default function ReportScreen() {
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<DocumentData | null>({});
    type DisplayItem = {
        id: string;
        description: string;
        category: string;
        title: string;
    }
    let docList: DocumentData[] = []; // Declare an empty array 
    let displayList: DisplayItem[] = [{
        "id": "dummyid",
        "description": "dummy description",
        "category": "Admin",
        "title": "Dummy title"
    }];

    useEffect(() => {
        const fetchData = async () => {
            const q = query(collection(FIRESTORE_DB, "gig-council"),
                where("category", "==", "Admin"));
            try {
                const snapshot = await getDocs(q)
                snapshot.forEach((doc) => {
                    // doc.data() is never undefined for query doc snapshots
                    docList.push(doc.data());
                    displayList.push({
                        "id": doc.id,
                        "category": doc.data()["category"],
                        "description": doc.data()["description"],
                        "title": doc.data()["description"]
                    })
                    console.log(doc.id, " => ", doc.data()["description"]);
                });
                console.log("A total of " + displayList.length + " assignments");
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const renderItem = ({ item }: ListRenderItemInfo<DisplayItem>) => {
        return (
            <TouchableOpacity
                style={styles.listItem}
                //item["description"] === selectedItem["description"] &&
                //styles.selectedListItem,
                onPress={() => setSelectedItem(item)}
            >
                <Text style={styles.listItemText}>Here is an item {item["title"]}</Text>
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
            <Text style={styles.label}>Retrieved {displayList.length} assignments</Text>
            <FlatList
                data={displayList}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#ffcfcf",
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
        backgroundColor: '#101010',
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
});