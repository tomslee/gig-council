// import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, Text, View } from 'react-native';
type Props = {
    label: string;
    theme: 'primary';
    onPress?: () => void;
};

export default function Button({ label, theme, onPress }: Props) {
    if (theme === 'primary') {
        return (
            < View style={styles.buttonContainer}>
                <Pressable
                    style={styles.button}
                    onPress={onPress}>
                    <Text style={styles.buttonLabel}>{label}</Text>
                </Pressable>
            </View >
        );
    }

    return (
        <View style={styles.buttonContainer}>
            <Pressable style={styles.button} onPress={() => alert('You pressed a button.')}>
                <Text style={styles.buttonLabel}>{label}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        width: 320,
        height: 58,
        marginHorizontal: 20,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
        backgroundColor: '#ddd',
    },
    button: {
        backgroundColor: '#8498db',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 16,
        shadowColor: '#3498db',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonIcon: {
        paddingRight: 8,
    },
    buttonLabel: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
    },
});
