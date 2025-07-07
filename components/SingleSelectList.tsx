import React, { useState } from 'react';
import { FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';

const SingleSelectList = () => {
    const [selectedItem, setSelectedItem] = useState(null);

    const data = [
        { id: '1', name: 'Office work' },
        { id: '2', name: 'Phone call' },
        { id: '3', name: 'Committee meeting' },
        { id: '4', name: 'Council meeting' },
        { id: '5', name: 'Coffee break' },
        { id: '6', name: 'Admin' },
    ];

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.listItem,
                item.id === selectedItem?.id && styles.selectedListItem,
            ]}
            onPress={() => setSelectedItem(item)}
        >
            <Text style={styles.listItemText}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
        />
    );
};

const styles = StyleSheet.create({
    listItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#a0a0a0',
    },
    selectedListItem: {
        backgroundColor: '#e0e0e0',
    },
    listItemText: {
        fontSize: 16,
    },
});

export default SingleSelectList;
