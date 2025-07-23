// app/modal.tsx
import { Link, router } from 'expo-router';
import { KeyboardAvoidingView, Platform, StyleSheet, SafeAreaView, ScrollView, StatusBar, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function ReadMore() {
    const isPresented = router.canGoBack();
    const insets = useSafeAreaInsets();

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor="white"
                translucent={false}
                hidden={false}
            />
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <Link style={styles.headerText} href="/">
                    <Ionicons name="chevron-back" size={30} color="white" />
                </Link>
                <Text style={styles.headerText}>
                    RideFair Gig Challenge
                </Text>
                <Text></Text>
            </View>
            <ScrollView style={styles.scrollview} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.paragraph}>
                    What if you worked your current job as a gig worker? You would be paid only
                    when "engaged" on an assignment, and you would be responsible for your
                    own work-related expenses. The RideFair Gig Challenge
                    lets you track your time as if you were a gig worker, to shine a light on
                    the implications of the gig-employment model.
                </Text>
                <Text style={styles.h1}>Minimum wage and gig worker reality
                </Text>
                <Text style={styles.paragraph}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                    eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
                    nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                    reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                    deserunt mollit anim id est laborum.
                </Text>
                <Text style={styles.paragraph}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                    eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
                    nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                    reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                    deserunt mollit anim id est laborum.
                </Text>
                <Text style={styles.paragraph}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                    eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
                    nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                    reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                    deserunt mollit anim id est laborum.
                </Text>
                <Text style={styles.paragraph}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                    eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
                    nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                    reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                    deserunt mollit anim id est laborum.
                </Text>
                <Text> {isPresented && (
                    <Link href="../" style={styles.linkStyle}>
                        Go back
                    </Link>
                )}</Text>
            </ScrollView>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    safeAreaView: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        //marginTop: 48,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#b2d8d8',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
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
        color: 'teal',
        fontWeight: '600',
        textAlign: 'center',
    },
});
