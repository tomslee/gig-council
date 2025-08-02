import { StyleSheet, Text, View, Linking } from 'react-native';
import { Link } from 'expo-router';
import * as Application from 'expo-application';


export default function AboutScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.bannerSection}>
                <Text style={styles.text}>The Gig Council Challenge is a project of RideFair, a Toronto campaign to
                    address the impact of ride-hailing apps on workers, existing transportation
                    systems, climate change, public health and the public realm.
                </Text>
                <Text style={styles.bannerText}>Gig Council version {Application.nativeApplicationVersion}</Text>
                <Text style={[styles.bannerText, { textDecorationLine: 'underline', textAlign: 'center' }]}
                    onPress={() => Linking.openURL('https://ridefair.ca')}>
                    Learn more about RideFair
                </Text>
                <Link style={[styles.bannerText, { textDecorationLine: 'underline', textAlign: 'center' }]}
                    href='/modal_gig_challenge'>Learn more about the RideFair Gig Challenge
                </Link>
            </View>
        </View >
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
        paddingVertical: 8,
        paddingHorizontal: 8,
        marginHorizontal: 8,
        elevation: 1,
        backgroundColor: '#c2e8e8',
        borderRadius: 8, // Slightly rounded corners
        borderWidth: 2,
        borderColor: '#66B2B2',
    },
    bannerText: {
        fontSize: 20,
        textAlign: 'center',
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginLeft: 2,
        padding: 8,
    },
    text: {
        fontSize: 20,
        color: '#333',
        marginBottom: 8,
        marginHorizontal: 4,
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
