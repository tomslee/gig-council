import Button from '@/components/Button';
import React, { useState } from 'react';
import { View, Text, Platform, TextInput } from 'react-native';

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
    const [displayTime, setDisplayTime] = useState(new Date());

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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, marginBottom: 20 }}>
                Start Time: {formatTime(displayTime)}
            </Text>

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
                    <Button theme="primary" label="Select Start Time" onPress={() => setShowPicker(true)} />

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

export default TimePicker;