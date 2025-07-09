
import SingleSelectList from '@/components/SingleSelectList';
import { StyleSheet, Text, View } from 'react-native';

export default function AddScreen() {
    return (
        <View style={styles.container}>
            <SingleSelectList />
            <View>
                <Text style={styles.text}>Some text</Text>
            </View>
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