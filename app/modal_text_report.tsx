// app/modal.tsx
import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, Linking, StyleSheet, SafeAreaView, ScrollView, StatusBar, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatisticsByDate } from '@/types/types';
import { useStatistics } from '@/contexts/StatisticsContext';

export default function TextReport() {
    const isPresented = router.canGoBack();
    const insets = useSafeAreaInsets();
    const { currentStatistics } = useStatistics();
    const { id, date, sessionMinutes, assignmentMinutes, paidMinutes } = currentStatistics;

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
                    <Text style={[styles.headerText, { margin: 0 }]}>
                        Report for {date}
                    </Text>
                </View>
                <ScrollView style={styles.scrollview}
                    contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.h1}>
                        Your pay today (before expenses)
                    </Text>
                    <Text style={styles.paragraph}>
                        You made ${(17.20 * paidMinutes / 60).toFixed(2)}, which is...
                    </Text>
                    <Text style={styles.paragraph}>
                        $17.20 per hour of "engaged time"
                    </Text>
                    <Text style={styles.paragraph}>
                        ${(17.20 * paidMinutes / assignmentMinutes).toFixed(2)} per hour on all assignments.
                    </Text>
                    <Text style={styles.paragraph}>
                        ${(17.20 * paidMinutes / sessionMinutes).toFixed(2)} per hour online.
                    </Text>
                    <Text style={styles.h1}>
                        Congratulations!
                    </Text>
                    <Text style={styles.paragraph}>
                        On {date}, you spent
                        <Text style={{ fontWeight: 'bold' }}> {paidMinutes.toFixed()} minutes</Text> engaged in paid assignments.
                        Thanks to the Ontario Digital Platform Workers' Rights Act, you are guaranteed a minimum
                        wage of $17.20 / hour for those minutes, for a total of
                        <Text style={{ fontWeight: 'bold' }}> ${(17.20 * paidMinutes / 60).toFixed(2)}!</Text>
                    </Text>
                    {(assignmentMinutes > paidMinutes) &&
                        <Text style={styles.paragraph}>
                            You also spent
                            <Text style={{ fontWeight: 'bold' }}> {(assignmentMinutes - paidMinutes).toFixed()}&nbsp;minutes </Text>
                            on unpaid assignments, like office work and administrative tasks.
                            Even though you won't get paid for that time, we love that you're investing in your future, ensuring that you present
                            your best self to your constituents and to the City of Toronto.
                        </Text>}
                    <Text style={styles.paragraph}>
                        You did spend <Text style={{ fontWeight: 'bold' }}>{sessionMinutes.toFixed()} minutes</Text> signed on and
                        available for work. Even though you won't get paid for much of that time, it is great to know you were available for your
                        constituents and coworkers in case anyone needed you.
                    </Text>
                    <Text style={styles.paragraph}>
                        Your earnings were
                        <Text style={{ fontWeight: 'bold' }} > ${(17.20 * paidMinutes / sessionMinutes).toFixed(2)} per hour online!</Text>
                    </Text>
                    <Text style={styles.paragraph}>
                        And of course you know that that's before your expenses of office rental, IT resources, phone, supply and maintenance of your equipment,
                        clothes to show your professionalism and more. But surely that's a minor price to pay for the flexibility you now have as a gig worker.
                    </Text>
                    <Text style={styles.paragraph}>Let's make tomorrow an even better day!</Text>

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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
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
        paddingHorizontal: 16,
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
