// ModalProvider.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, Text, Modal, StyleSheet, Pressable } from 'react-native';

interface ModalContextType {
    showModal: (content: string) => void;
    hideModal: () => void;
    isVisible: boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};

interface ModalProviderProps {
    children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState('');

    const showModal = (content: string) => {
        setModalContent(content);
        setModalVisible(true);
    };

    const hideModal = () => {
        setModalVisible(false);
        setModalContent('');
    };

    return (
        <ModalContext.Provider value={{ showModal, hideModal, isVisible: modalVisible }}>
            {children}
            {/* The modal is rendered here at the provider level */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={hideModal}
            >
                <View style={styles.modalRootView}>
                    <View style={styles.modalView}>
                        <Text style={{ marginBottom: 15, fontSize: 16 }}>
                            {modalContent}
                        </Text>
                        <Pressable
                            style={({ pressed }) => [
                                {
                                    elevation: pressed ? 0 : 10
                                },
                                styles.button,
                            ]}
                            onPress={hideModal}>
                            <Text>OK</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </ModalContext.Provider>
    );
};

const styles = StyleSheet.create({
    modalRootView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalView: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        minWidth: 250,
        maxWidth: '80%'
    },
    button: {
        backgroundColor: "#66B2B2",
        borderRadius: 12,
        borderColor: '#117272',
        paddingHorizontal: 8,
        paddingVertical: 16,
        alignItems: 'center',
        marginVertical: 8,
        marginHorizontal: 8,
        boxShadow: [{
            color: '#66B2B2',
            offsetX: 2,
            offsetY: 4,
            blurRadius: 2,
        }],
    }
});