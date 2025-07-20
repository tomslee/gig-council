import { View, Text, StyleSheet } from 'react-native';
interface SectionHeaderProps {
    title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
    return (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    sectionHeader: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    sectionHeaderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
});

export default SectionHeader;