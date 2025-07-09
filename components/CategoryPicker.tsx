import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

type Props = {
    selectedValue: "";
    inputHandler: (text: string) => void;
};

const CategoryPicker = ({ selectedValue, inputHandler }: Props) => {
    // const [selectedValue, setSelectedValue] = useState('cat1');

    const categories = [
        { value: 'catoffice', label: 'Office work' },
        { value: 'catphone', label: 'Phone call' },
        { value: 'catcommittee', label: 'Committee meeting' },
        { value: 'catcouncil', label: 'Council meeting' },
        { value: 'catbreak', label: 'Coffee break' },
        { value: 'catadmin', label: 'Admin' },
    ];

    const onChange = (itemValue: string) => {
        const selectedItem = categories.find(item => item.value === itemValue)
        if (selectedItem) {
            inputHandler(selectedItem.label)
        }
        //setShowPicker(Platform.OS === 'ios');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pick a work category:</Text>
            <Picker
                selectedValue={selectedValue}
                onValueChange={(itemValue) => onChange(itemValue)}
                style={styles.picker}
            >
                {categories.map((category) => (
                    <Picker.Item
                        key={category.value}
                        label={category.label}
                        value={category.value}
                    />
                ))}
            </Picker>
        </View>
    );
};

// <Text style={styles.result}>
// Selected: {categories.find(category => category.value === selectedValue)?.label}
// </Text>
const styles = StyleSheet.create({
    container: {
        flex: 0.5,
        justifyContent: 'center',
        padding: 10,
    },
    title: {
        fontSize: 18,
        marginBottom: 10,
        textAlign: 'center',
    },
    picker: {
        height: 80,
        width: 320,
        marginBottom: 10,
        backgroundColor: '#ddd',
    },
    result: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
    },
});

export default CategoryPicker;