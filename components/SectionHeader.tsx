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
        backgroundColor: '#f9f8fa',
        paddingVertical: 8,
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    sectionHeaderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#66B2B2',
        paddingHorizontal: 8,
    },
});

export default SectionHeader;