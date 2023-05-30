import React, { useRef, useState, useEffect, useCallback } from 'react'
import { ActivityIndicator, Platform, Linking, View, Text, StyleSheet, TouchableOpacity, Image, Animated } from "react-native"
import prayer from '../assets/prayer-nobg.png'
import { Ionicons, AntDesign, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useFonts } from 'expo-font'
import Unorderedlist from 'react-native-unordered-list';
import { useSelector } from 'react-redux';
import { Divider } from 'react-native-paper';
import { Container, ModalContainer } from '../styles/appStyles';
import { Modal } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useIsFocused } from '@react-navigation/native';
import { PROJECT_ID } from '@env'
import GreetingAnimation from '../components/GreetingAnimation';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
        const data = notification.request.content.data;

        if (data && data.screen) {
            // navigate to the screen specified in the data object
            navigation.navigate(data.screen);
        }
        return {
            shouldShowAlert: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
        };
    },
});

async function sendToken(expoPushToken) {
    const message = {
        to: expoPushToken,
        sound: 'default',
        title: 'Original Title',
        body: 'And here is the body!',
        data: { someData: 'goes here' },
    };
    await fetch('http://192.168.1.206:8800/api/testtokens', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
    });
}

async function registerForPushNotificationsAsync() {
    let token;
    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }
    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            console.log(status)
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {

            alert('To recieve notifications in the future, enable Notifications from the App Settings.');
            return;
        }

        token = (await Notifications.getExpoPushTokenAsync({ projectId: PROJECT_ID })).data;
        console.log(token)
    } else {
        alert('Must use physical device for Push Notifications');
    }
    return token;
}

export default function Welcome({ navigation }) {
    const theme = useSelector(state => state.user.theme)
    const token = useSelector(state => state.user.expoToken)
    const [greeting, setGreeting] = useState('')
    const [toolVisible, setToolVisible] = useState(false)
    const [icon, setIcon] = useState(null)
    const [expanded, setExpanded] = useState(true);
    const handlePress = () => setExpanded(!expanded);

    const BusyIndicator = () => {
        return (
            <View style={{ flex: 1, justifyContent: "center" }}>
                <ActivityIndicator size="large" color={theme == 'dark' ? "white" : "#2f2d51"} />
            </View>
        );
    };

    function handleCloseTooltip() {
        setToolVisible(false)
    }

    const fadeAnim = useRef(new Animated.Value(0)).current
    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();
    const isFocused = useIsFocused();

    useEffect(() => {
        Animated.timing(
            fadeAnim,
            {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true
            }
        ).start()

        getHour()
        function getHour() {
            const currentHour = new Date().getHours()
            if (currentHour >= 5 && currentHour < 12) {
                setGreeting('Good morning ')
                setIcon(<Feather name="sun" size={24} color={theme == 'dark' ? "#d8d800" : "#ffff27"} />)
            } else if (currentHour < 18) {
                setGreeting('Good afternoon ')
                setIcon(<Feather name="sun" size={24} color={theme == 'dark' ? "#d8d800" : "#c4c400"} />)
            } else {
                setGreeting('Good Evening ')
                setIcon(<Feather name="moon" size={24} color={theme == 'dark' ? "#a6a6a6" : "#9a9a9a"} />)
            }
        }

    }, [isFocused])

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => sendToken(token).then(console.log('token sent'))).catch(err => console.log(err))
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            const body = response.notification.request.content.body
            const res = response.notification.request.content.data
            // console.log(response)
            // if (res && res.updateLink) {
            //     console.log('in update')
            //     if (Platform.OS === 'ios') {
            //         Linking.openURL('https://apps.apple.com/us/app/prayerlist-app/id6443480347')
            //     } else if (Platform.OS === 'android') {
            //         Linking.openURL('https://play.google.com/store/apps/details?id=com.sahag98.prayerListApp')
            //     }
            // }
            // if (res && res.screen) {
            //     console.log('in screen')
            //     // navigate to the screen specified in the data object
            //     if (res.screen == 'VerseOfTheDay') {
            //         navigation.navigate(res.screen, {
            //             verse: body,
            //             title: res.verseTitle
            //         });
            //     } else {
            //         navigation.navigate(res.screen)
            //     }

            // }
        });
        return () => {
            Notifications.removeNotificationSubscription(notificationListener.current);
            Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, []);

    const [fontsLoaded] = useFonts({
        'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
        'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
        'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
        'Inter-Light': require('../assets/fonts/Inter-Light.ttf'),
    })

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return <BusyIndicator />;
    }

    return (
        <Container onLayout={onLayoutRootView} style={theme == 'dark' ? { display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' } : { display: 'flex', position: 'relative', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F7FF' }}>
            <Animated.View style={{ flexDirection: 'row', alignItems: 'center', opacity: fadeAnim }}>
                <Text style={theme == 'dark' ? styles.greetingDark : styles.greeting}>{greeting}</Text>
                {icon}
            </Animated.View>
            <Text style={theme == 'dark' ? styles.welcomeDark : styles.welcome}>Welcome to Prayse</Text>
            <View style={styles.imgContainer}>
                <Image
                    style={styles.img}
                    source={prayer}
                />
            </View>
            <Modal
                animationType='fade'
                transparent={true}
                visible={toolVisible}
                onRequestClose={handleCloseTooltip}
                statusBarTranslucent={true}
            >
                <ModalContainer style={theme == 'dark' ? { backgroundColor: 'rgba(0, 0, 0, 0.8)' } : { backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
                    <TouchableOpacity onPress={handleCloseTooltip} style={theme == 'dark' ? { borderRadius: 5, position: 'relative', padding: 15, width: '100%', backgroundColor: '#212121' } : { borderRadius: 5, position: 'relative', padding: 15, width: '100%', backgroundColor: '#93D8F8' }}>
                        <TouchableOpacity style={{ position: 'absolute', top: 5, right: 5, padding: 10 }} onPress={handleCloseTooltip}>
                            <AntDesign name="close" size={22} color={theme == 'dark' ? 'white' : "#2f2d51"} />
                        </TouchableOpacity>

                        <Text style={theme == 'dark' ? { color: 'white', marginBottom: 5, fontFamily: 'Inter-Bold', fontSize: 15 } : { color: '#2f2d51', fontFamily: 'Inter-Bold', marginBottom: 5, fontSize: 15 }}>What's New in v7 :</Text>
                        <Unorderedlist
                            color={theme == 'dark' ? 'white' : 'black'}
                            bulletUnicode={0x2713}
                        >
                            <Text style={theme == 'dark' ? styles.listTextDark : styles.listText}>Verse of the Day page to meditate on the daily verse & favorite it</Text>
                        </Unorderedlist>
                        <Unorderedlist
                            color={theme == 'dark' ? 'white' : 'black'}
                            bulletUnicode={0x2713}
                        >
                            <Text style={theme == 'dark' ? styles.listTextDark : styles.listText}>Whole new notification system</Text>
                        </Unorderedlist>
                        <Unorderedlist
                            color={theme == 'dark' ? 'white' : 'black'}
                            bulletUnicode={0x2713}
                        >
                            <Text style={theme == 'dark' ? styles.listTextDark : styles.listText}>
                                Answered Prayer section to keep track of answered prayers
                            </Text>
                        </Unorderedlist>
                        <Unorderedlist
                            color={theme == 'dark' ? 'white' : 'black'}
                            bulletUnicode={0x2713}
                        >
                            <Text style={theme == 'dark' ? styles.listTextDark : styles.listText}>
                                Simplified folders layout
                            </Text>
                        </Unorderedlist>
                        <Unorderedlist
                            color={theme == 'dark' ? 'white' : 'black'}
                            bulletUnicode={0x2713}
                        >
                            <Text style={theme == 'dark' ? styles.listTextDark : styles.listText}>
                                Changes to edit functionality on prayers
                            </Text>
                        </Unorderedlist>
                        <Unorderedlist
                            color={theme == 'dark' ? 'white' : 'black'}
                            bulletUnicode={0x2713}
                        >
                            <Text style={theme == 'dark' ? styles.listTextDark : styles.listText}>
                                Added privacy policies, settings and more on the More page
                            </Text>
                        </Unorderedlist>
                    </TouchableOpacity>
                </ModalContainer>
            </Modal>
            <View style={{ width: '100%' }}>
                <Text style={theme == 'dark' ? { color: 'white', fontFamily: 'Inter-Regular', fontSize: 15 } : { color: '#2f2d51', fontFamily: 'Inter-Regular', fontSize: 15 }}>Quick links</Text>
                <Divider style={{ marginBottom: 10, marginTop: 5 }} />
                <TouchableOpacity onPress={() => setToolVisible(true)} style={theme == 'dark' ? styles.refreshDark : styles.refresh}>
                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <Feather name="info" size={24} color={theme == 'dark' ? "#f1d592" : "#bb8b18"} />
                        <Text style={theme == 'dark' ? { color: '#f1d592', marginLeft: 5, fontFamily: 'Inter-Regular' } : { color: '#bb8b18', marginLeft: 5, fontFamily: 'Inter-Regular' }}>Check What's New!</Text>
                    </View>
                    <AntDesign name="right" size={18} color={theme == 'dark' ? "#f1d592" : '#bb8b18'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Gospel')} style={theme == 'dark' ? styles.refreshDark : styles.refresh}>
                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="cross" size={24} color="#8cbaff" />
                        <Text style={theme == 'dark' ? { color: '#A5C9FF', marginLeft: 5, fontFamily: 'Inter-Regular' } : { color: '#738cb2', marginLeft: 5, fontFamily: 'Inter-Regular' }}>The Gospel of Jesus</Text>
                    </View>
                    <AntDesign name="right" size={18} color={theme == 'dark' ? "#8cbaff" : '#738cb2'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openURL('https://www.buymeacoffee.com/arzsahag')} style={theme == 'dark' ? styles.refreshDark : styles.refresh}>
                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <AntDesign name="hearto" size={24} color="#DE3163" />
                        <Text style={theme == 'dark' ? { color: '#e24774', marginLeft: 5, fontFamily: 'Inter-Regular' } : { color: '#cb3f68', marginLeft: 5, fontFamily: 'Inter-Regular' }}>Donate to support future updates!</Text>
                    </View>
                    <AntDesign name="right" size={18} color={theme == 'dark' ? "#e24774" : '#cb3f68'} />
                </TouchableOpacity>
                {
                    Platform.OS === 'android' &&
                    <TouchableOpacity
                        style={theme == 'dark' ? styles.refreshDark : styles.refresh}
                        onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=com.sahag98.prayerListApp')}
                    >
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="logo-google-playstore" size={24} color={theme == 'dark' ? "#d6d6d6" : "#606060"} />
                            <Text
                                style={theme == 'dark' ? { color: '#f0f0f0', fontFamily: 'Inter-Regular', marginLeft: 5 } : { color: '#606060', fontFamily: 'Inter-Regular', marginLeft: 5 }}
                            >
                                Check for Updates
                            </Text>
                        </View>
                        <AntDesign name="right" size={18} color={theme == 'dark' ? "#d6d6d6" : '#606060'} />
                    </TouchableOpacity>
                }
                {
                    Platform.OS === 'ios' &&
                    <TouchableOpacity
                        style={theme == 'dark' ? styles.refreshDark : styles.refresh}
                        onPress={() => Linking.openURL('https://apps.apple.com/us/app/prayerlist-app/id6443480347')}
                    >
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <AntDesign name="apple1" size={24} color={theme == 'dark' ? "#d6d6d6" : "#606060"} />
                            <Text
                                style={theme == 'dark' ? { color: '#f0f0f0', fontFamily: 'Inter-Regular', marginLeft: 5 } : { color: '#606060', fontFamily: 'Inter-Regular', marginLeft: 5 }}
                            >
                                Check for Updates
                            </Text>
                        </View>
                        <AntDesign name="right" size={18} color={theme == 'dark' ? "#d6d6d6" : '#2f2d51'} />
                    </TouchableOpacity>
                }
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Folders')} style={theme == 'dark' ? styles.buttonDark : styles.button}>
                <Text style={theme == 'dark' ? { fontFamily: 'Inter-Medium' } : { color: 'white', fontFamily: 'Inter-Medium' }}>Create a Folder</Text>
                <AntDesign style={{ marginLeft: 10 }} name="right" size={18} color={theme == 'dark' ? "black" : 'white'} />
            </TouchableOpacity>
        </Container>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F7FF',
        justifyContent: "center",
        alignItems: 'center'
    },
    containerDark: {
        flex: 1,
        backgroundColor: '#121212',
        justifyContent: "center",
        alignItems: 'center'
    },
    refreshDark: {
        width: '100%',
        backgroundColor: '#212121',
        paddingHorizontal: 6,
        paddingVertical: 12,
        marginBottom: 10,
        borderRadius: 15,
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center'
    },
    refresh: {
        width: '100%',
        backgroundColor: 'white',
        paddingHorizontal: 6,
        paddingVertical: 12,
        marginBottom: 10,
        borderRadius: 15,
        borderColor: '#dddddd',
        borderWidth: 0.4,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    section: {
        backgroundColor: '#a6c8ff'
    },
    sectionDark: {

        backgroundColor: '#212121',
    },
    wrapper: {
        width: '80%'
    },
    listText: {
        fontFamily: 'Inter-Regular',
        color: '#2f2d51',
        fontSize: 15,
        lineHeight: 20,
        marginBottom: 2
    },
    listTextDark: {
        fontFamily: 'Inter-Regular',
        fontSize: 15,
        lineHeight: 20,
        color: 'white',
        marginBottom: 2
    },
    instructions: {
        marginBottom: 5,
        fontSize: 16,
        fontFamily: 'Inter-Medium',
    },
    instructionsDark: {
        marginBottom: 5,
        fontSize: 16,
        fontFamily: 'Inter-Medium',
        color: 'white'
    },
    welcome: {
        fontSize: 20,
        marginVertical: 15,
        fontFamily: 'Inter-Bold',
        letterSpacing: 2,
        alignSelf: 'center',
        color: '#2F2D51'

    },
    welcomeDark: {
        marginVertical: 15,
        fontSize: 20,
        fontFamily: 'Inter-Bold',
        alignSelf: 'center',
        letterSpacing: 2,
        color: 'white'
    },
    greeting: {
        fontSize: 19,
        marginVertical: 5,
        fontFamily: 'Inter-Medium',
        letterSpacing: 2,
        alignSelf: 'center',
        color: '#2F2D51'

    },
    greetingDark: {
        marginVertical: 5,
        fontSize: 19,
        fontFamily: 'Inter-Medium',
        alignSelf: 'flex-start',
        letterSpacing: 2,
        color: 'white'
    },
    imgContainer: {
        backgroundColor: 'white',
        height: 180,
        width: 180,
        borderRadius: 100,
        marginVertical: 15,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center'
    },
    img: {
        width: 250,
        height: 250,
    },
    button: {
        marginTop: 30,
        width: 160,
        backgroundColor: '#2f2d51',
        padding: 15,
        borderRadius: 5,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonDark: {
        marginTop: 30,
        width: 160,
        backgroundColor: '#A5C9FF',
        padding: 15,
        borderRadius: 5,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    }
})