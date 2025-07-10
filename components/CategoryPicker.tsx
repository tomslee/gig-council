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
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#34495e',
        marginBottom: 8,
        marginLeft: 2,
    },
    picker: {
        backgroundColor: '#ddd',
    },
});

export default CategoryPicker;