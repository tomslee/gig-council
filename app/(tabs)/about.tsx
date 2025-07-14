import { StyleSheet, Text, View, Linking } from 'react-native';

export default function AboutScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.bannerSection}>
                <Text style={styles.bannerText}>The Gig Council Challenge is a project of RideFair, a Toronto campaign to
                    address the impact of ride-hailing apps on workers, existing transportation
                    systems, climate change, public health and the public realm.
                </Text>
                <Text style={[styles.bannerText, { color: 'blue', textDecorationLine: 'underline', textAlign: 'center' }]}
                    onPress={() => Linking.openURL('https://ridefair.ca')}>
                    Learn more about RideFair
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
    bannerSection: {
        paddingVertical: 20,
        marginVertical: 8,
        elevation: 1,
        backgroundColor: '#ffffff',
    },
    bannerText: {
        fontSize: 20,
        textAlign: 'center',
        color: '#34495e',
        marginBottom: 8,
        marginLeft: 2,
        padding: 8,
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
});
