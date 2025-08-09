// ModalProvider.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Modal from 'react-native-modal';

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
    const AUTO_CLOSE_TIME = 2000; // 

    useEffect(() => {
        let timer: number;

        if (modalVisible) {
            timer = setTimeout(() => {
                setModalVisible(false);
            }, AUTO_CLOSE_TIME);
        }

        // Cleanup timer if modal is closed manually or component unmounts
        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [modalVisible]);

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
                animationIn={"slideInLeft"}
                animationInTiming={500}
                animationOut={"slideOutRight"}
                animationOutTiming={500}
                hasBackdrop={false}
                onBackdropPress={() => setModalVisible(false)}
                useNativeDriver={false}
                transparent={true}
                isVisible={modalVisible}
            >
                <View style={styles.modalRootView}>
                    <View style={styles.modalView}>
                        <Text style={styles.contentText}>
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
                            <Text style={styles.buttonText}>OK</Text>
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
        backgroundColor: 'rgba(0,0,0,0.0)'
    },
    modalView: {
        backgroundColor: '#ffffff',
        padding: 16,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 12,
        minWidth: 250,
        maxWidth: '80%',
        boxShadow: [{
            color: '#E0E0E0',
            offsetX: 2,
            offsetY: 4,
            blurRadius: 2,
        }],
        elevation: 8,
    },
    contentText: {
        paddingVertical: 8,
        fontSize: 18,
        fontWeight: 500,
        color: '#666666',
    },
    buttonText: {
        //paddingVertical: 4,
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    button: {
        backgroundColor: "#66B2B2",
        borderRadius: 12,
        borderWidth: 0,
        borderColor: '#449191',
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