import { TimerPickerModal } from "react-native-timer-picker";
import { LinearGradient } from "expo-linear-gradient"; // or `import LinearGradient from "react-native-linear-gradient"`
import { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet
} from 'react-native';

type Props = {
    time: Date;
    inputHandler: (text: string) => void;
};

const TimerPicker = ({ time, inputHandler }: Props) => {
    // const [selectedValue, setSelectedValue] = useState('cat1');
    const [showPicker, setShowPicker] = useState(false);
    const [alarmString, setAlarmString] = useState<string | null>(null);

    const formatTime = ({
        hours,
        minutes,
        seconds,
    }: {
        hours?: number;
        minutes?: number;
        seconds?: number;
    }) => {
        const timeParts = [];

        if (hours !== undefined) {
            timeParts.push(hours.toString().padStart(2, "0"));
        }
        if (minutes !== undefined) {
            timeParts.push(minutes.toString().padStart(2, "0"));
        }
        if (seconds !== undefined) {
            timeParts.push(seconds.toString().padStart(2, "0"));
        }

        return timeParts.join(":");
    };

    return (
        <View style={{
            backgroundColor: "#F1F1F1",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <Text style={{ fontSize: 18, color: "#202020" }}>
                {alarmStringExample !== null
                    ? "Alarm set for"
                    : "No alarm set"}
            </Text>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowPicker(true)}>
                <View style={{ alignItems: "center" }}>
                    {alarmString !== null ? (
                        <Text style={{ color: "#202020", fontSize: 48 }}>
                            {alarmString}
                        </Text>
                    ) : null}
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setShowPicker(true)}>
                        <View style={{ marginTop: 30 }}>
                            <Text
                                style={{
                                    paddingVertical: 10,
                                    paddingHorizontal: 18,
                                    borderWidth: 1,
                                    borderRadius: 10,
                                    fontSize: 16,
                                    overflow: "hidden",
                                    borderColor: "#8C8C8C",
                                    color: "#8C8C8C"
                                }}>
                                Set Alarm 🔔
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
            <TimerPickerModal
                visible={showPicker}
                setIsVisible={setShowPicker}
                onConfirm={(pickedDuration) => {
                    setAlarmString(formatTime(pickedDuration));
                    setShowPicker(false);
                }}
                modalTitle="Set Assignment Duration"
                onCancel={() => setShowPicker(false)}
                closeOnOverlayPress
                use12HourPicker
                LinearGradient={LinearGradient}
                styles={{
                    theme: "light",
                }}
            />
        </View>
    )
};
