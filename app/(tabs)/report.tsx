import { StyleSheet, Text, View } from 'react-native';

export default function ReportScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Report has items</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
    },
});