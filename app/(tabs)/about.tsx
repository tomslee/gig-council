import { StyleSheet, Text, View, Linking } from 'react-native';

export default function AboutScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.textContainer}>
                <Text style={styles.text}>Gig Council is a project of RideFair, a campaign to
                    address the impact of ride-hailing apps on workers, existing transportation
                    systems, climate change, public health and the public realm.
                </Text>
                <Text />
                <Text style={[styles.text, { color: 'blue', textAlign: 'center' }]}
                    onPress={() => Linking.openURL('https://ridefair.ca')}>
                    Learn more about RideFair.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#F8F9FA',
    },
    textContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 32,
        paddingVertical: 24,
        borderRadius: 12,
        maxWidth: 340,
        boxShadow: [{
            color: '#000',
            offsetX: 0,
            offsetY: 1,
            blurRadius: 8,
        }],
        elevation: 3,
    },
    text: {
        color: '#666666',        // Muted gray instead of pure black
        fontSize: 18,            // Slightly smaller than default
        lineHeight: 24,          // Good readability
        fontWeight: '400',       // Regular weight
        opacity: 0.8,           // Slight transparency
    },
});
