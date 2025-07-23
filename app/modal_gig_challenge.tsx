// app/modal.tsx
import { Link, router } from 'expo-router';
import { KeyboardAvoidingView, Platform, Linking, StyleSheet, SafeAreaView, ScrollView, StatusBar, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function ReadMore() {
    const isPresented = router.canGoBack();
    const insets = useSafeAreaInsets();

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <StatusBar
                    barStyle="dark-content"
                    backgroundColor="white"
                    translucent={false}
                    hidden={false}
                />
                <View style={[styles.header, { paddingTop: insets.top }]}>
                    <Text style={styles.headerText}
                        onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={30} color="white" />
                    </Text>
                    <Text style={styles.headerText}>
                        The RideFair Gig Challenge
                    </Text>
                    <Text></Text>
                </View>
                <ScrollView style={styles.scrollview} contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.paragraph}>
                        What if you worked your current job as a gig worker? You would be paid only
                        when "engaged" on an assignment, and you would be responsible for your
                        own work-related expenses.
                    </Text>
                    <Text style={styles.paragraph} >What does this mean in reality? The RideFair Gig Challenge
                        tracks your time and earnings as if you were a gig worker, to shine a light on
                        the implications of gig-work.
                    </Text>
                    <Text style={styles.h1}>Minimum wage and gig worker reality
                    </Text>
                    <Text style={styles.paragraph}>
                        On July 1 2025 the <Text style={styles.linkStyle} onPress={() => Linking.openURL('https://www.ontario.ca/laws/statute/22d07')}>Ontario
                            Digital Platform Workers' Rights Act</Text> came into effect.
                    </Text>
                    <Text style={styles.paragraph}>
                        "Digital platform workers" includes ridehail drivers for Uber and Lyft, delivery workers for DoorDash and
                        UberEats, and anyone else providing a service to a customer through an online platform, whether they are classified
                        as an employee or, as is far more common, an "independent contractor".
                    </Text>
                    <Text style={styles.paragraph}>
                        The Act claims to provide new rights for these "gig workers", including a minimum wage. Unfortunately, these new "rights"
                        are worse than useless, cementing in place an arrangement that leaves many gig workers struggling to make ends meet.
                    </Text>
                    <Text style={styles.paragraph}>
                        The Act essentially creates a new underclass of worker in Ontario, excluded from the minimum wage protections that
                        others enjoy, and working instead under a separate --- and worse --- regime.
                    </Text>
                    <Text style={styles.paragraph}>
                        Specifically, a minimum wage is guaranteed only when a worker is "engaged" on an assignment: from the time an Uber driver accepts
                        a trip request until the passenger is dropped off. As a large part of any gig worker's day involves being available to
                        respond to new requests, any worker paid this "minimum wage" would actually end their day earning far below it.
                    </Text>
                    <Text style={styles.paragraph}>
                        In addition, the minimum wage does not recognize any costs that the gig worker undertakes. For ridehail and delivery
                        drivers this means that the cost of fuel, car maintenance, insurance, and more all have to come out of this "minimum wage".
                    </Text>
                    <Text style={styles.paragraph}>
                        How much difference does this make? A lot. A 2024 study carried out for the City of Toronto showed that a typical Uber driver earned $33 per engaged hour in 2024,
                        well above the new "minimum wage". After expenses, this fell to $15 per engaged hour. And once the time waiting for ride requests was accounted for,
                        a typical driver was taking home only $6 per hour after expenses. The new law fails to deal with the real world of gig workers.
                    </Text>
                    <Text style={styles.headerText}
                        onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={30} color="black" />
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView >
    );
};


const styles = StyleSheet.create({
    safeAreaView: {
        flex: 1,
        backgroundColor: 'white',
    },
    keyboardAvoid: {
        flex: 1,
    },
    header: {
        //marginTop: 48,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        //backgroundColor: '#b2d8d8',
        backgroundColor: '#66b2b2',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerText: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'white',
    },
    scrollview: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    paragraph: {
        fontFamily: 'serif',
        fontSize: 18,
        lineHeight: 24,
        marginBottom: 16,
        color: '#333',
    },
    h1: {
        fontFamily: 'sans-serif',
        fontSize: 20,
        fontWeight: 'bold',
        lineHeight: 24,
        marginTop: 24,
        marginBottom: 16,
    },
    linkStyle: {
        color: "black",
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});
