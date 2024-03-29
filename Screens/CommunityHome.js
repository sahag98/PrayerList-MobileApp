import {
  Dimensions,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useCallback, useEffect } from "react";
import { useSupabase } from "../context/useSupabase";
import { Container, HeaderTitle, HeaderView } from "../styles/appStyles";
import { PROJECT_ID } from "@env";
import { useSelector } from "react-redux";
import { Image } from "react-native";
import { useState } from "react";
import { TouchableOpacity, Platform } from "react-native";
import {
  Entypo,
  Ionicons,
  AntDesign,
  MaterialIcons,
  MaterialCommunityIcons,
  Feather,
  EvilIcons,
} from "@expo/vector-icons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { useRef } from "react";
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import WelcomeModal from "../components/WelcomeModal";
import cm2 from "../assets/cm2.png";
import CreateGroupModal from "../components/CreateGroupModal";
import { FlatList } from "react-native";
import JoinModal from "../components/JoinModal";
import ProfileModal from "../components/ProfileModal";
import communityReady from "../hooks/communityReady";
import * as Clipboard from "expo-clipboard";
import Constants from "expo-constants";
import * as Network from "expo-network";
import Toast from "react-native-toast-message";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
const duration = 2000;
const easing = Easing.bezier(0.25, -0.5, 0.25, 1);

const CommunityHome = ({ route }) => {
  const navigation = useNavigation();
  const {
    currentUser,
    setCurrentUser,
    session,
    refreshMembers,
    setRefreshMembers,
    logout,
    supabase,
  } = useSupabase();

  const theme = useSelector((state) => state.user.theme);
  const [modalVisible, setModalVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [joinVisible, setJoinVisible] = useState(false);
  const [extended, setExtended] = useState(true);
  const statusBarHeight = Constants.statusBarHeight;
  const [prayerModal, setPrayerModal] = useState(false);
  const [isShowingWelcome, setIsShowingWelcome] = useState(false);
  const isFocused = useIsFocused();
  const [visible, setVisible] = useState(true);
  const [prayers, setPrayers] = useState([]);
  const [userPrayers, setUserPrayers] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [groups, setGroups] = useState([]);
  const isIOS = Platform.OS === "ios";
  // const { current: velocity } = useRef(new Animated.Value(0));
  const [searchName, setSearchName] = useState("");
  const [isViewingGroups, setIsViewingGroups] = useState(false);
  const isReady = communityReady();
  const [hasConnection, setHasConnection] = useState(true);

  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateZ: `${rotation.value}deg` }],
    };
  });

  const showToast = (type, content) => {
    Toast.show({
      type,
      text1: "Copied to Clipboard.",
      visibilityTime: 3000,
    });
  };

  useEffect(() => {
    if (!isIOS) {
      setExtended(true);
    } else setExtended(extended);
  }, [extended, isIOS]);

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await Network.getNetworkStateAsync();
      console.log("connection: ", connected.isConnected);
      if (!connected.isConnected) {
        setHasConnection(false);
      }
    };
    checkConnection();
    const wavingAnimation = withSpring(15, { damping: 2, stiffness: 80 });

    rotation.value = withSequence(wavingAnimation);
    getUserPrayers();
    getGroupUsers();
    getUserGroups();
    getPermission();
    getPrayers();
  }, [isFocused]);

  useEffect(() => {
    if (route.params !== undefined) {
      navigation.navigate("PrayerGroup", {
        group: route.params.group,
        allGroups: route.params.allGroups,
      });
    }
  }, [route?.params]);

  // useEffect(() => {
  //   getUserPrayers();
  //   getGroupUsers();
  //   getUserGroups();
  //   getPermission();
  //   getPrayers();
  // }, [route.params]);

  useEffect(() => {
    getUserGroups();
    getGroupUsers();
  }, [refreshMembers]);

  async function getPrayers() {
    //prayers for production
    //prayers_test for testing
    let { data: prayers, error } = await supabase
      .from("prayers")
      .select("*, profiles(*)")
      .order("id", { ascending: false });
    setPrayers(prayers);
  }

  async function getUserPrayers() {
    //prayers for production
    //prayers_test for testing
    let { data: prayers, error } = await supabase
      .from("prayers")
      .select("*")
      .eq("user_id", currentUser?.id)
      .order("id", { ascending: false });
    setUserPrayers(prayers);
  }

  async function getUserGroups() {
    let { data: groups, error } = await supabase
      .from("members")
      .select("*,groups(*), profiles(*)")
      .eq("user_id", currentUser?.id)
      .order("id", { ascending: false });
    setUserGroups(groups);
  }

  async function getGroupUsers() {
    let { data: groups, error } = await supabase
      .from("members")
      .select("*,groups(*), profiles(*)")
      .order("id", { ascending: true });
    setGroups(groups);
    setRefreshMembers(false);
  }

  async function sendToken(expoPushToken) {
    const { data, error } = await supabase
      .from("profiles")
      .update({ expoToken: expoPushToken })
      .eq("id", currentUser?.id)
      .select();
  }

  const copyToClipboard = async (code) => {
    await Clipboard.setStringAsync(code);
    showToast("success");
  };

  async function getPermission() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        console.log(status);
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        console.log("not granted");
        return;
      }

      token = (
        await Notifications.getExpoPushTokenAsync({ projectId: PROJECT_ID })
      ).data;
    } else {
      console.log("Must use physical device for Push Notifications");
    }
    sendToken(token);
  }

  const ITEM_WIDTH = Dimensions.get("window").width / 2;

  const list = userGroups?.filter((item) =>
    searchName !== "" ? item.groups.name.includes(searchName) : true
  );

  // if (route.params !== undefined) {
  //   navigation.navigate("PrayerGroup", {
  //     group: route.params.group,
  //     allGroups: route.params.allGroups,
  //   });
  // }

  if (currentUser && currentUser?.full_name == null) {
    return (
      <WelcomeModal
        supabase={supabase}
        getUserGroups={getUserGroups}
        setCurrentUser={setCurrentUser}
        isShowingWelcome={true}
        setIsShowingWelcome={setIsShowingWelcome}
        user={currentUser}
      />
    );
  }

  if (!hasConnection) {
    return (
      <View
        style={{
          backgroundColor: theme == "dark" ? "#21212" : "#f2f7ff",
          flex: 1,
          justifyContent: "center",
          gap: 5,
          alignItems: "center",
        }}
      >
        <MaterialIcons name="network-check" size={50} color="black" />
        <Text
          style={{
            color: theme == "dark" ? "white" : "#2f2d51",
            fontFamily: "Inter-Medium",
          }}
        >
          No network connection. Try again...
        </Text>
      </View>
    );
  }

  return (
    <>
      {!isViewingGroups ? (
        <ScrollView
          contentContainerStyle={{ justifyContent: "center", gap: 10 }}
          style={
            theme == "dark"
              ? {
                  backgroundColor: "#121212",
                  padding: 15,
                  flex: 1,
                  paddingTop: statusBarHeight,
                  paddingBottom: 10,
                  position: "relative",
                }
              : {
                  backgroundColor: "#f2f7ff",
                  padding: 15,
                  flex: 1,
                  paddingTop: statusBarHeight,
                  paddingBottom: 10,
                  // justifyContent: "center",

                  position: "relative",
                }
          }
        >
          <View
            style={{
              position: "absolute",

              top: 0,
              right: 0,
            }}
          >
            <ProfileModal
              getUserPrayers={getUserPrayers}
              userPrayers={userPrayers}
              setPrayerModal={setPrayerModal}
              getPrayers={getPrayers}
              logout={logout}
              session={session}
              setCurrentUser={setCurrentUser}
              supabase={supabase}
              profileVisible={profileVisible}
              user={currentUser}
              setProfileVisible={setProfileVisible}
            />
            <TouchableOpacity style={styles.iconContainer}>
              <Image
                style={styles.profileImg}
                source={{
                  uri: currentUser?.avatar_url
                    ? currentUser?.avatar_url
                    : "https://cdn.glitch.global/bcf084df-5ed4-42b3-b75f-d5c89868051f/profile-icon.png?v=1698180898451",
                }}
              />
              <TouchableOpacity
                onPress={() => setProfileVisible(true)}
                style={
                  theme == "dark" ? styles.featherIconDark : styles.featherIcon
                }
              >
                <Ionicons name="settings" size={20} color="black" />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
          {/* <View
            style={{
              // flex: 1,
              gap: 10,
              justifyContent: "center",
            }}
          > */}
          <Image
            style={
              theme == "dark"
                ? [styles.img, { tintColor: "white" }]
                : styles.img
            }
            source={cm2}
          />
          <Animated.View
            entering={FadeIn.duration(500)}
            style={{
              flexDirection: "row",
              alignItems: "center",

              gap: 10,
            }}
          >
            <HeaderTitle
              style={
                theme == "dark"
                  ? {
                      fontFamily: "Inter-Bold",
                      fontSize: 20,
                      letterSpacing: 2,
                      color: "white",
                    }
                  : {
                      fontFamily: "Inter-Bold",
                      fontSize: 20,
                      color: "#2F2D51",
                    }
              }
            >
              <Text>Welcome {currentUser?.full_name}</Text>
            </HeaderTitle>
            <Animated.View style={animatedStyle}>
              <MaterialCommunityIcons
                name="hand-wave"
                size={30}
                color="#ffe03b"
              />
            </Animated.View>
          </Animated.View>
          <TouchableOpacity
            onPress={() => navigation.navigate("PublicCommunity")}
            style={
              theme == "dark"
                ? {
                    width: "100%",
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 15,
                    borderRadius: 10,
                    justifyContent: "space-between",
                    backgroundColor: "#212121",
                  }
                : {
                    width: "100%",
                    flexDirection: "row",
                    alignItems: "center",
                    shadowColor: "#bdbdbd",
                    shadowOffset: {
                      width: 0,
                      height: 3,
                    },
                    shadowOpacity: 0.17,
                    shadowRadius: 3.05,
                    elevation: 4,
                    padding: 15,
                    borderRadius: 10,
                    justifyContent: "space-between",
                    backgroundColor: "#93d8f8",
                  }
            }
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Text
                style={
                  theme == "dark"
                    ? {
                        fontFamily: "Inter-Medium",
                        color: "#a5c9ff",
                        fontSize: 15,
                      }
                    : {
                        fontFamily: "Inter-Medium",
                        color: "#2f2d51",
                        fontSize: 15,
                      }
                }
              >
                Public Prayers
              </Text>
              <Entypo
                name="globe"
                size={24}
                color={theme == "dark" ? "#a5c9ff" : "#2f2d51"}
              />
            </View>
            <AntDesign
              name="right"
              size={24}
              color={theme == "dark" ? "#a5c9ff" : "#2f2d51"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("Question")}
            style={
              theme == "dark"
                ? {
                    width: "100%",
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 15,
                    borderRadius: 10,
                    justifyContent: "space-between",
                    backgroundColor: "#212121",
                  }
                : {
                    width: "100%",
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 15,
                    shadowColor: "#bdbdbd",
                    shadowOffset: {
                      width: 0,
                      height: 3,
                    },
                    shadowOpacity: 0.17,
                    shadowRadius: 3.05,
                    elevation: 4,
                    borderRadius: 10,
                    justifyContent: "space-between",
                    backgroundColor: "#ffcd8b",
                  }
            }
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Text
                style={
                  theme == "dark"
                    ? {
                        fontFamily: "Inter-Medium",
                        color: "#f1d592",
                        fontSize: 15,
                      }
                    : {
                        fontFamily: "Inter-Medium",
                        color: "#2f2d51",
                        fontSize: 15,
                      }
                }
              >
                Question of the Week
              </Text>
              <MaterialIcons
                name="question-answer"
                size={24}
                color={theme == "dark" ? "#f1d592" : "#2f2d51"}
              />
              {/* <Entypo
                name="globe"
                size={24}
                color={theme == "dark" ? "#a5c9ff" : "#2f2d51"}
              /> */}
            </View>
            <AntDesign
              name="right"
              size={24}
              color={theme == "dark" ? "#f1d592" : "#2f2d51"}
            />
          </TouchableOpacity>
          <View
            style={{
              flexDirection: "row",

              alignItems: "center",
              gap: 10,
            }}
          >
            <Text
              style={
                theme == "dark"
                  ? {
                      fontFamily: "Inter-Bold",

                      color: "white",
                      fontSize: 18,
                    }
                  : {
                      fontFamily: "Inter-Bold",
                      color: "#2f2d51",
                      fontSize: 18,
                    }
              }
            >
              Prayer Groups
            </Text>
            <MaterialIcons
              name="groups"
              size={30}
              color={theme == "dark" ? "white" : "#2f2d51"}
            />
          </View>
          {userGroups?.length > 0 && (
            <FlatList
              pagingEnabled
              snapToInterval={ITEM_WIDTH}
              horizontal
              showsHorizontalScrollIndicator={false}
              data={userGroups}
              keyExtractor={(e, i) => i.toString()}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("PrayerGroup", {
                        group: item,
                        allGroups: groups.filter(
                          (g) => g.group_id === item.group_id
                        ),
                      })
                    }
                    style={
                      theme == "dark"
                        ? {
                            borderWidth: 1,
                            padding: 10,
                            paddingBottom: 20,
                            gap: 5,
                            marginRight: 15,
                            borderRadius: 10,
                            justifyContent: "space-between",
                            borderColor: item.groups.color.toLowerCase(),
                            backgroundColor: "#212121",
                            maxWidth: ITEM_WIDTH + 100,
                            height: "auto",
                          }
                        : {
                            borderWidth: 1,
                            marginRight: 15,
                            gap: 5,
                            justifyContent: "space-between",
                            padding: 10,
                            paddingBottom: 20,
                            borderRadius: 10,
                            borderColor: item.groups.color.toLowerCase(),
                            backgroundColor: "white",
                            maxWidth: ITEM_WIDTH + 100,
                            height: "auto",
                          }
                    }
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Text
                        style={
                          theme == "dark"
                            ? {
                                fontFamily: "Inter-Medium",
                                fontSize: 16,
                                color: "white",
                              }
                            : {
                                fontFamily: "Inter-Medium",
                                fontSize: 16,
                                color: "#2f2d51",
                              }
                        }
                      >
                        {item.groups.name}
                      </Text>

                      <TouchableOpacity
                        onPress={() =>
                          copyToClipboard(item.groups.code.toString())
                        }
                        style={
                          theme == "dark"
                            ? {
                                padding: 5,
                                flexDirection: "row",
                                alignItems: "center",
                                backgroundColor: "#121212",
                                borderRadius: 10,
                                gap: 8,
                              }
                            : {
                                padding: 5,
                                flexDirection: "row",
                                alignItems: "center",
                                backgroundColor: "#93d8f8",
                                borderRadius: 10,
                                gap: 8,
                              }
                        }
                      >
                        <Feather
                          name="copy"
                          size={15}
                          color={theme == "dark" ? "white" : "#2f2d51"}
                        />
                        <Text
                          style={
                            theme == "dark"
                              ? {
                                  color: "white",
                                  fontSize: 13,
                                  fontFamily: "Inter-Medium",
                                }
                              : {
                                  color: "#2f2d51",
                                  fontSize: 13,
                                  fontFamily: "Inter-Medium",
                                }
                          }
                        >
                          {item.groups.code}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Text
                      style={{
                        fontFamily: "Inter-Regular",
                        fontSize: 13,
                        color: "grey",
                      }}
                    >
                      {item.groups.description}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        paddingHorizontal: 10,

                        width: "100%",
                        alignItems: "center",
                      }}
                    >
                      {groups
                        .filter((g) => g.group_id === item.group_id)
                        .slice(0, 3) // Show only the first three joined users
                        .map((g, index) => (
                          <View
                            key={index}
                            style={{
                              position: "relative",
                              marginLeft: index > 0 ? -10 : 0,
                            }}
                          >
                            <Image
                              style={styles.joinedUserImg}
                              source={{
                                uri: g.profiles?.avatar_url
                                  ? g.profiles?.avatar_url
                                  : "https://cdn.glitch.global/bcf084df-5ed4-42b3-b75f-d5c89868051f/profile-icon.png?v=1698180898451",
                              }}
                            />
                          </View>
                        ))}
                      <View>
                        {groups?.length > 3 &&
                          groups.filter((g) => g.group_id === item.group_id)
                            ?.length > 3 && (
                            <Text
                              style={
                                theme == "dark"
                                  ? {
                                      marginLeft: 5,
                                      fontFamily: "Inter-Regular",
                                      color: "grey",
                                    }
                                  : {
                                      marginLeft: 5,
                                      fontFamily: "Inter-Regular",
                                      color: "#2f2d51",
                                    }
                              }
                            >
                              +
                              {groups.filter(
                                (g) => g.group_id === item.group_id
                              )?.length - 3}
                            </Text>
                          )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
          {userGroups?.length >= 3 && (
            <TouchableOpacity
              onPress={() => setIsViewingGroups(true)}
              style={{
                alignSelf: "center",
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Text
                style={
                  theme == "dark"
                    ? { color: "white", fontFamily: "Inter-Medium" }
                    : { color: "#2f2d51", fontFamily: "Inter-Medium" }
                }
              >
                View All
              </Text>
              <Entypo
                name="chevron-small-down"
                size={24}
                color={theme == "dark" ? "#a5c9ff" : "#2f2d51"}
              />
            </TouchableOpacity>
          )}
          <View style={{ marginTop: 5, gap: 10 }}>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={
                theme == "dark"
                  ? {
                      width: "100%",
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 15,
                      borderRadius: 10,
                      justifyContent: "space-between",
                      backgroundColor: "#a5c9ff",
                    }
                  : {
                      width: "100%",
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 15,
                      borderRadius: 10,
                      justifyContent: "space-between",
                      backgroundColor: "#2f2d51",
                    }
              }
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <Text
                  style={
                    theme == "dark"
                      ? {
                          fontFamily: "Inter-Medium",
                          color: "#121212",
                          fontSize: 15,
                        }
                      : {
                          fontFamily: "Inter-Medium",
                          color: "white",
                          fontSize: 15,
                        }
                  }
                >
                  Create a Group
                </Text>
                <AntDesign
                  name="addusergroup"
                  size={24}
                  color={theme == "dark" ? "#121212" : "white"}
                />
              </View>
              <AntDesign
                name="plus"
                size={24}
                color={theme == "dark" ? "#121212" : "white"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setJoinVisible(true)}
              style={
                theme == "dark"
                  ? {
                      width: "100%",
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 15,
                      borderRadius: 10,
                      justifyContent: "space-between",
                      borderColor: "#a5c9ff",
                      borderWidth: 1,
                    }
                  : {
                      width: "100%",
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 15,
                      borderRadius: 10,
                      justifyContent: "space-between",
                      borderColor: "#93d8f8",
                      borderWidth: 1,
                    }
              }
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <Text
                  style={
                    theme == "dark"
                      ? {
                          fontFamily: "Inter-Medium",
                          fontSize: 15,
                          color: "#a5c9ff",
                        }
                      : {
                          fontFamily: "Inter-Medium",
                          fontSize: 15,
                          color: "#2f2d51",
                        }
                  }
                >
                  Join a Group
                </Text>
                <MaterialIcons
                  name="group-add"
                  size={24}
                  color={theme == "dark" ? "#a5c9ff" : "#2f2d51"}
                />
              </View>
              <AntDesign
                name="plus"
                size={24}
                color={theme == "dark" ? "#a5c9ff" : "#2f2d51"}
              />
            </TouchableOpacity>
          </View>

          <CreateGroupModal
            getUserGroups={getUserGroups}
            getGroupUsers={getGroupUsers}
            supabase={supabase}
            theme={theme}
            user={currentUser}
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
          />
          <JoinModal
            getUserGroups={getUserGroups}
            getGroupUsers={getGroupUsers}
            supabase={supabase}
            theme={theme}
            user={currentUser}
            modalVisible={joinVisible}
            setModalVisible={setJoinVisible}
          />
        </ScrollView>
      ) : (
        <Animated.View
          entering={FadeIn.duration(500)}
          style={
            theme == "dark"
              ? {
                  backgroundColor: "#121212",
                  padding: 15,
                  paddingTop: statusBarHeight,
                  gap: 10,
                  flex: 1,
                  position: "relative",
                  paddingBottom: 0,
                }
              : {
                  backgroundColor: "#F2F7FF",
                  gap: 10,
                  padding: 15,
                  flex: 1,
                  paddingTop: statusBarHeight,
                  position: "relative",
                  paddingBottom: 0,
                }
          }
        >
          <HeaderView
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
              gap: 5,
              justifyContent: "flex-start",
            }}
          >
            <TouchableOpacity onPress={() => setIsViewingGroups(false)}>
              <AntDesign
                name="left"
                size={30}
                color={theme == "dark" ? "white" : "#2f2d51"}
              />
            </TouchableOpacity>
            <Text
              style={
                theme == "dark"
                  ? { fontFamily: "Inter-Bold", color: "white", fontSize: 18 }
                  : { fontFamily: "Inter-Bold", color: "#2f2d51", fontSize: 18 }
              }
            >
              Prayer Groups
            </Text>
          </HeaderView>
          <View
            style={
              theme == "dark"
                ? {
                    backgroundColor: "#212121",
                    borderRadius: 10,
                    padding: Platform.OS == "ios" ? 8 : 3,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }
                : {
                    backgroundColor: "white",
                    borderRadius: 10,
                    padding: Platform.OS == "ios" ? 8 : 3,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }
            }
          >
            <View
              style={{
                width: "80%",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <EvilIcons
                name="search"
                size={28}
                color={theme == "dark" ? "#A5C9FF" : "#2f2d51"}
              />
              <TextInput
                style={
                  theme == "dark"
                    ? styles.textInputStyleDark
                    : styles.textInputStyle
                }
                value={searchName}
                placeholder="Search groups..."
                placeholderTextColor={theme == "dark" ? "#A5C9FF" : "#212121"}
                selectionColor={theme == "dark" ? "#A5C9FF" : "#2f2d51"}
                onChangeText={(text) => setSearchName(text)}
                autoFocus={false}
              />
            </View>
            <TouchableOpacity
              onPress={() => {
                setSearchName("");
                Keyboard.dismiss();
              }}
            >
              <AntDesign
                name="close"
                size={22}
                color={theme == "dark" ? "#A5C9FF" : "#2f2d51"}
              />
            </TouchableOpacity>
          </View>
          <Animated.View>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={list}
              keyExtractor={(e, i) => i.toString()}
              ItemSeparatorComponent={
                <View
                  style={{
                    width: "100%",
                    height: 1,
                    backgroundColor: theme == "dark" ? "#212121" : "#2f2d51",
                  }}
                />
              }
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("PrayerGroup", {
                        group: item,
                        allGroups: groups.filter(
                          (g) => g.group_id === item.group_id
                        ),
                      })
                    }
                    style={
                      theme == "dark"
                        ? {
                            flex: 1,
                            flexDirection: "row",
                            justifyContent: "space-between",
                            backgroundColor: "#121212",
                            width: "100%",

                            alignItems: "center",
                          }
                        : {
                            flexDirection: "row",
                            justifyContent: "space-between",
                            backgroundColor: "#f2f7ff",
                            width: "100%",

                            alignItems: "center",
                          }
                    }
                  >
                    <View
                      style={
                        theme == "dark"
                          ? {
                              paddingVertical: 10,
                              justifyContent: "space-between",
                              gap: item.groups.description ? 5 : 10,
                              borderBottomColor: "#2f2d51",
                            }
                          : {
                              justifyContent: "space-between",
                              paddingVertical: 10,
                              gap: item.groups.description ? 5 : 10,
                              borderBottomColor: "#2f2d51",
                            }
                      }
                    >
                      <Text
                        style={
                          theme == "dark"
                            ? {
                                fontFamily: "Inter-Medium",
                                fontSize: 16,
                                color: "white",
                              }
                            : {
                                fontFamily: "Inter-Medium",
                                fontSize: 16,
                                color: "#2f2d51",
                              }
                        }
                      >
                        {item.groups.name}
                      </Text>
                      {item.groups.description && (
                        <Text
                          style={{
                            fontFamily: "Inter-Regular",
                            fontSize: 13,
                            color: "grey",
                          }}
                        >
                          {item.groups.description}
                        </Text>
                      )}

                      <View
                        style={{
                          flexDirection: "row",
                          paddingHorizontal: 10,
                          alignItems: "center",
                        }}
                      >
                        {groups
                          .filter((g) => g.group_id === item.group_id)
                          .slice(0, 6) // Show only the first three joined users
                          .map((g, index) => (
                            <View
                              key={index}
                              style={{
                                position: "relative",
                                marginLeft: index > 0 ? -10 : 0,
                              }}
                            >
                              <Image
                                style={styles.joinedUserImg}
                                source={{
                                  uri: g.profiles?.avatar_url
                                    ? g.profiles?.avatar_url
                                    : "https://cdn.glitch.global/bcf084df-5ed4-42b3-b75f-d5c89868051f/profile-icon.png?v=1698180898451",
                                }}
                              />
                              {/* <Text>{g.profiles.full_name}</Text> */}
                            </View>
                          ))}
                        <View>
                          {groups?.length > 6 &&
                            groups.filter((g) => g.group_id === item.group_id)
                              ?.length > 6 && (
                              <Text
                                style={
                                  theme == "dark"
                                    ? {
                                        marginLeft: 5,
                                        color: "grey",
                                        fontFamily: "Inter-Regular",
                                      }
                                    : {
                                        marginLeft: 5,
                                        color: "#2f2d51",
                                        fontFamily: "Inter-Regular",
                                      }
                                }
                              >
                                +
                                {groups.filter(
                                  (g) => g.group_id === item.group_id
                                )?.length - 6}
                              </Text>
                            )}
                        </View>
                      </View>
                    </View>
                    <AntDesign
                      name="right"
                      size={24}
                      color={theme == "dark" ? "#a5c9ff" : "#2f2d51"}
                    />
                  </TouchableOpacity>
                );
              }}
            />
          </Animated.View>
        </Animated.View>
      )}
    </>
  );
};

export default CommunityHome;

const styles = StyleSheet.create({
  joinedUserImg: {
    width: 30,
    height: 30,
    borderRadius: 50,
  },
  textInputStyle: {
    padding: 10,
    width: "100%",
    fontSize: 13,
  },
  textInputStyleDark: {
    padding: 10,
    width: "100%",
    fontSize: 13,
  },

  img: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginVertical: 15,
  },
  box: {
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "#b58df1",
    borderRadius: 20,
  },

  imgContainer: {
    marginBottom: 20,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  question: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderColor: "#93d8f8",
    borderWidth: 0.8,
    // backgroundColor: "#93d8f8",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 5,
    marginBottom: 15,
  },

  profileImg: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  iconContainer: {
    position: "relative",
    width: "100%",
    padding: 10,
    alignSelf: "flex-end",
  },
  questionDark: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderColor: "#f1d592",
    borderWidth: 0.3,
    // backgroundColor: "#f1d592",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 5,
    marginBottom: 15,
  },
  actionButtons: {
    position: "absolute",
    right: 15,
    bottom: 15,
    display: "flex",
  },
  fabStyleDark: {
    position: "relative",
    alignSelf: "flex-end",
    justifyContent: "center",
    backgroundColor: "#A5C9FF",
  },
  fabStyle: {
    position: "relative",
    alignSelf: "flex-end",
    justifyContent: "flex-end",
    backgroundColor: "#2f2d51",
  },
  profileImg: {
    width: 60,
    height: 60,
    borderRadius: 50,
  },
  iconContainer: {
    position: "relative",
    padding: 8,
  },
  featherIconDark: {
    position: "absolute",
    backgroundColor: "#A5C9FF",
    borderRadius: 50,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    bottom: 4,
    right: 2,
  },
  featherIcon: {
    position: "absolute",
    backgroundColor: "white",
    padding: 5,
    borderWidth: 1,
    borderColor: "#2f2d51",
    borderRadius: 50,

    alignItems: "center",
    justifyContent: "center",

    bottom: 4,
    right: 2,
  },
});
