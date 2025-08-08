import { Tabs } from 'expo-router';

import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#66B2B2',
                headerStyle: { backgroundColor: 'white' },
                headerTitleAlign: 'center',
                headerShadowVisible: true,
                headerTintColor: '#66B2B2', // '#b2d8d8',
                tabBarStyle: {},
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
                    ),
                }}
            />
            <Tabs.Screen
                name="report"
                options={{
                    title: 'Reports',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'document-text-sharp' : 'document-text-outline'} color={color} size={24} />
                    ),
                }}
            />
            <Tabs.Screen
                name="timeline"
                options={{
                    title: 'Timeline',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'document-text-sharp' : 'time-outline'} color={color} size={24} />
                    ),
                }}
            />
            <Tabs.Screen
                name="about"
                options={{
                    title: 'About',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'information-circle-sharp' : 'information-circle-outline'} color={color} size={24} />
                    ),
                }}
            />
        </Tabs>
    );
}
