import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { CATEGORIES } from '@/app/(tabs)/index';

type Props = {
    inputHandler: (text: string) => void;
};

const CategoryPicker = ({ inputHandler }: Props) => {
    const [selectedValue, setSelectedValue] = useState("Admin");

    const onChange = (itemValue: string) => {
        const selectedItem = CATEGORIES.find(item => item.id === itemValue)
        if (selectedItem) {
            inputHandler(selectedItem.label)
            setSelectedValue(selectedItem.label);
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
                {CATEGORIES.map((category) => (
                    <Picker.Item
                        key={category.id}
                        label={category.label}
                        value={category.id}
                    />
                ))}
            </Picker>
            <Text>Selected item is {selectedValue}</Text>
        </View>
    );
};

// <Text style={styles.result}>
// Selected: {categories.find(category => category.value === selectedValue)?.label}
// </Text>
const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: 320,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#34495e',
        marginBottom: 8,
        marginLeft: 2,
    },
    picker: {
        fontSize: 16,
        backgroundColor: '#fff',
        elevation: 1,
    },
});

export default CategoryPicker;