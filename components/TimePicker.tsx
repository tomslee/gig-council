// import Button from '@/components/Button';
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';

type Props = {
    time: Date;
    inputHandler: (text: string) => void;
};

// Only import on mobile platforms
let DateTimePicker: React.JSX.IntrinsicAttributes;
if (Platform.OS !== 'web') {
    DateTimePicker = require('@react-native-community/datetimepicker').default;
}

const TimePicker = ({ time, inputHandler }: Props) => {
    const [showPicker, setShowPicker] = useState(false);
    const [displayTime, setDisplayTime] = useState(time);

    const onChange = (event: { type: string; }, selectedTime: Date) => {
        if (event.type === 'set' && selectedTime) {
            setDisplayTime(selectedTime);
            inputHandler(formatTime(selectedTime))
        }
        setShowPicker(Platform.OS === 'ios');
    };

    const onWebTimeChange = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        const newTime = new Date();
        newTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        setDisplayTime(newTime);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatTimeForWeb = (date: Date) => {
        return date.toTimeString().slice(0, 5); // HH:MM format
    };

    return (
        <View>
            {Platform.OS === 'web' ? (
                <TextInput
                    style={{
                        borderWidth: 1,
                        borderColor: '#ccc',
                        padding: 10,
                        fontSize: 16,
                        minWidth: 120,
                        textAlign: 'center',
                    }}
                    value={formatTimeForWeb(time)}
                    onChangeText={onWebTimeChange}
                    placeholder="HH:MM"
                />
            ) : (
                <>
                    <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => setShowPicker(true)} >
                        <Text
                            style={styles.pickerButtonText}>
                            {formatTime(displayTime) || 'Select time...'}
                        </Text>
                        <Text style={styles.pickerArrow}>🕐</Text>
                    </TouchableOpacity>

                    {showPicker && DateTimePicker && (
                        <DateTimePicker
                            value={time}
                            mode="time"
                            is24Hour={false}
                            display="default"
                            onChange={onChange}
                        />
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#34495e',
        marginBottom: 8,
        marginLeft: 2,
    },
    pickerButton: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e1e8ed',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    pickerButtonText: {
        fontSize: 16,
        color: '#2c3e50',
    },
    pickerArrow: {
        fontSize: 14,
        color: '#7f8c8d',
    },
});

export default TimePicker;