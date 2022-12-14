import React, { useRef, useState } from 'react';
import { Alert, Animated, Modal, Linking, Appearance, TouchableOpacity, View, FlatList, StyleSheet, Text } from 'react-native';
import {
    ModalView, StyledInput,
    ModalAction2,
    ModalActionGroup2,
    ModalIcon, HeaderTitle, ModalContainer, Container1, ModalButton4
} from '../styles/appStyles';
import { useFonts } from 'expo-font'
import AppLoading from 'expo-app-loading';
import { AntDesign } from '@expo/vector-icons'

const Message = [
    {
        id: 1,
        title: "GOD LOVES YOU",
        verse: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
        chapter: "John 3:16"
    },
    {
        id: 2,
        title: "EVERYONE NEEDS A SAVIOR",
        verse: "For all have sinned, and come short of the glory of God.",
        chapter: "Romans 3:23"
    },
    {
        id: 3,
        title: "SIN HAS A PRICE THAT MUST BE PAID",
        verse: "For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord.",
        chapter: "Romans 6:23"
    },
    {
        id: 4,
        title: "JESUS DIED TO PAY FOR YOUR SIN",
        verse: "But God commendeth his love towards us, in that, while we were yet sinners, Christ died for us.",
        chapter: "Romans 5:8"
    },
    {
        id: 5,
        title: "RECIEVE JESUS AS YOUR SAVIOUR",
        verse: "For whosoever shall call upon the name of the Lord shall be saved.",
        chapter: "Romans 10:13"
    },
]

const Gospel = ({ navigation }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current

    const fadeIn = () => {
        Animated.timing(fadeAnim, {
            useNativeDriver: true,
            toValue: 1,
            duration: 2000,
        }).start();
    }
    fadeIn()

    const Item = ({ title, verse, chapter }) => (

        <View style={styles.item}>
            <Text style={theme == 'dark' ? styles.titleDark : styles.title}>{title}</Text>
            <Text style={theme == 'dark' ? styles.verseDark : styles.verse}>{verse}</Text>
            <Text style={theme == 'dark' ? styles.chapterDark : styles.chapter}>-{chapter}</Text>
        </View>
    );
    const renderItem = ({ item }) => <Item title={item.title} verse={item.verse} chapter={item.chapter} />;

    const [theme, setTheme] = useState(Appearance.getColorScheme());
    const [modalVisible, setModalVisible] = useState(false)
    const [clearModalVisible, setClearModalVisible] = useState(false)

    const handleCloseModal = () => {
        setClearModalVisible(false)
    }

    const handleSubmit = () => {
        setClearModalVisible(false)
        Alert.alert(
            "Amen",
            "Let us know on the community page that you have accepted Jesus so that we can celebrate with you!",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                { text: "OK", onPress: () => navigation.navigate('Community') }

            ]
        )
    }


    Appearance.addChangeListener((scheme) => {
        setTheme(scheme.colorScheme)
    })

    let [fontsLoaded] = useFonts({
        'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
        'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
        'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
        'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
        'Inter-Light': require('../assets/fonts/Inter-Light.ttf'),
    })

    if (!fontsLoaded) {
        return <AppLoading />
    }
    return (
        <Container1 style={theme == 'dark' ? { backgroundColor: '#121212' } : { backgroundColor: '#F2F7FF' }}>
            <Text style={theme == 'dark' ? styles.headingDark : styles.heading}>The Gospel</Text>
            <Animated.FlatList
                style={{ opacity: fadeAnim }}
                data={Message}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />
            <TouchableOpacity
                style={theme == 'dark' ? styles.buttonDark : styles.button}
                title='Create a prayer list'
                onPress={() => { setClearModalVisible(true) }}
            >
                <Text style={theme == 'dark' ? styles.startedDark : styles.started}>Take Next Step</Text>
            </TouchableOpacity>
            <ModalButton4 style={theme == 'dark' ? { zIndex: 99, backgroundColor: '#7272FF' } : { zIndex: 99, backgroundColor: '#2F2D51' }}>
                <AntDesign name='back' size={40} color={theme == 'dark' ? 'black' : 'white'} onPress={() => navigation.goBack()} />
            </ModalButton4>
            <Modal
                animationType='slide'
                transparent={true}
                visible={clearModalVisible}
                onRequestClose={handleCloseModal}
            >
                <ModalContainer style={theme == 'dark' ? { backgroundColor: '#121212' } : { backgroundColor: '#F2F7FF' }}>
                    <ModalView style={theme == 'dark' ? { backgroundColor: '#FFDAA5' } : { backgroundColor: '#2F2D51' }}>
                        <ModalIcon>
                            <Text style={theme == 'dark' ? styles.prayTitleDark : styles.prayTitle}>Make the best decision of your life and pray this from your heart:</Text>
                            <Text style={theme == 'dark' ? styles.prayDark : styles.pray}>Dear God, I recognize that I am a sinner and have been seperated from you.
                                From this point on I accept you Jesus as my Lord and Saviour and I open my heart to you.
                                Forgive me from my sins and help me to follow you in all areas of my life.
                                In Jesus name I pray, Amen.</Text>
                        </ModalIcon>
                        <ModalActionGroup2>
                            <ModalAction2 color={theme == "dark" ? '#6D5D46' : '#9E9DB9'} onPress={handleCloseModal}>
                                <Text style={{ color: 'black' }}>Not ready yet</Text>
                            </ModalAction2>
                            <ModalAction2 color={theme == 'dark' ? '#212121' : '#E3E3EB'} onPress={handleSubmit}>
                                <Text style={theme == 'dark' ? { color: 'white' } : { color: 'black' }}>Just prayed that!</Text>
                            </ModalAction2>
                        </ModalActionGroup2>
                    </ModalView>
                </ModalContainer>
            </Modal>
        </Container1>
    );
};

const styles = StyleSheet.create({
    heading: {
        fontSize: 30,
        color: '#2F2D51',
        textAlign: 'center',
        padding: 10
    },

    headingDark: {
        fontSize: 30,
        color: 'white',
        textAlign: 'center',
        padding: 10
    },

    button: {
        alignSelf: 'center',
        marginVertical: 10,
        backgroundColor: '#2F2D51',
        padding: 15,
        width: 150,
        borderRadius: 35,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999
    },

    buttonDark: {
        alignSelf: 'center',
        marginVertical: 10,
        backgroundColor: '#A5C9FF',
        padding: 15,
        width: 150,
        borderRadius: 35,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999
    },

    started: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        fontFamily: 'Inter-Medium'
    },

    startedDark: {
        color: '#080808',
        textAlign: 'center',
        fontSize: 16,
        fontFamily: 'Inter-Medium'
    },

    footer: {
        fontFamily: 'Inter-Medium',
        fontSize: 15,
        color: '#2F2D51',
        textAlign: 'center',
        padding: 10
    },

    footerDark: {
        fontFamily: 'Inter-Medium',
        fontSize: 15,
        color: 'white',
        textAlign: 'center',
        padding: 10
    },

    footerContainer: {
        padding: 0,
    },

    footerDarkContainer: {
        padding: 0,
    },

    item: {
        padding: 10,
        borderRadius: 5,
    },

    title: {
        color: '#384FFF',
        fontSize: 23,
        fontFamily: 'Inter-SemiBold'
    },

    titleDark: {
        color: '#A5C9FF',
        fontSize: 23,
        fontFamily: 'Inter-SemiBold'
    },

    prayTitle: {
        color: 'white',
        fontSize: 20,
        fontFamily: 'Inter-SemiBold',
        paddingBottom: 5
    },

    prayTitleDark: {
        color: 'black',
        fontSize: 20,
        fontFamily: 'Inter-SemiBold',
        paddingBottom: 5
    },

    verse: {
        fontSize: 18,
        fontFamily: 'Inter-Regular'
    },

    verseDark: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'Inter-Regular'
    },

    pray: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'Inter-Regular'
    },

    prayDark: {
        color: 'black',
        fontSize: 18,
        fontFamily: 'Inter-Regular'
    },

    chapter: {
        color: '#2F2D51',
        fontSize: 15,
        fontFamily: 'Inter-Light'
    },

    chapterDark: {
        color: '#FFDAA5',
        fontSize: 15,
        fontFamily: 'Inter-Light'
    },

});

export default Gospel;