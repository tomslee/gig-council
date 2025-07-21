import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Reusable HelpIcon component
const HelpIcon = ({ helpText, title = "Help" }) => {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View>
            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={styles.iconContainer}
                accessibilityLabel="Help information"
                accessibilityHint={`Get help about ${title.toLowerCase()}`}
            >
                {/* <Ionicons name="information-circle-outline" size={20} color="#66B2B2" /> */}
                <Ionicons name="help-circle-outline" size={20} color="#66B2B2" />
            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <Text style={styles.modalText}>{helpText}</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    input: {
        flex: 1,
        height: 44,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
    },
    iconContainer: {
        marginLeft: 8,
        padding: 4,
    },

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        margin: 20,
        maxWidth: 300,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333',
    },
    modalText: {
        fontSize: 16,
        lineHeight: 22,
        color: '#666',
        marginBottom: 16,
    },
    closeButton: {
        backgroundColor: '#66B2B2',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignSelf: 'flex-end',
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },

    // Tooltip styles
    tooltipContainer: {
        position: 'relative',
    },
    tooltip: {
        position: 'absolute',
        top: 30,
        right: 0,
        backgroundColor: '#333',
        padding: 12,
        borderRadius: 8,
        maxWidth: 200,
        zIndex: 1000,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    tooltipText: {
        color: 'white',
        fontSize: 14,
        lineHeight: 18,
        flex: 1,
    },
    tooltipClose: {
        marginLeft: 8,
        padding: 2,
    },
});

export default HelpIcon;