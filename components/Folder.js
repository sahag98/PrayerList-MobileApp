import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  FlatList,
  Dimensions,
} from "react-native";
import {
  HeaderTitle,
  ModalContainer,
  ModalView,
  ModalAction,
  ModalActionGroup,
  ModalIcon,
  TodoText,
  ListView2,
} from "../styles/appStyles";
import { useDispatch, useSelector } from "react-redux";
import { TouchableOpacity, Animated } from "react-native";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { AnimatedFAB, Divider } from "react-native-paper";
import { Modal } from "react-native";
import {
  addFolder,
  deleteFolder,
  deleteQuickFolder,
} from "../redux/folderReducer";
import uuid from "react-native-uuid";
import { useFonts } from "expo-font";
import { useRef } from "react";
import AnsweredPrayer from "./AnsweredPrayer";
import { SectionList } from "react-native";
import FolderItem from "./FolderItem";
import AddFolderModal from "./AddFolderModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { deletePrayerByFolderId } from "../redux/prayerReducer";

const Folder = ({ navigation, todos }) => {
  const theme = useSelector((state) => state.user.theme);
  const folders = useSelector((state) => state.folder.folders);
  const answeredPrayers = useSelector(
    (state) => state.answered.answeredPrayers
  );
  const [open, setOpen] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderClicked, setFolderClicked] = useState(true);
  const [isExtended, setIsExtended] = useState(true);
  const [idToDelete, setIdToDelete] = useState(null);
  const [extended, setExtended] = useState(true);
  const isIOS = Platform.OS === "ios";
  const [fabvisible, setFabvisible] = useState(true);
  const { current: velocity } = useRef(new Animated.Value(0));
  const sections = [];

  const [showNewBadge, setShowNewBadge] = useState(false);

  useEffect(() => {
    const checkFirstTime = async () => {
      // await AsyncStorage.removeItem("hasPressedPrayerTab");
      try {
        const value = await AsyncStorage.getItem("hasPressedChecklist");
        if (value === null) {
          // First time pressing the "Prayer" tab
          setShowNewBadge(true);
          AsyncStorage.setItem("hasPressedChecklist", "true");
        }
      } catch (error) {
        console.error("Error retrieving data from AsyncStorage:", error);
      }
    };

    checkFirstTime();
  }, []);

  useEffect(() => {
    if (!isIOS) {
      velocity.addListener(({ value }) => {
        setIsExtended(value <= 0);
      });
    } else setIsExtended(extended);
  }, [velocity, extended, isIOS]);

  answeredPrayers?.forEach((prayer) => {
    const date = prayer.answeredDate;
    const sectionIndex = sections.findIndex(
      (section) => section.title === date
    );
    if (sectionIndex === -1) {
      sections.push({
        title: date,
        data: [prayer],
      });
    } else {
      sections[sectionIndex].data.push(prayer);
    }
  });

  const onScroll = ({ nativeEvent }) => {
    const currentScrollPosition =
      Math.floor(nativeEvent?.contentOffset?.y) ?? 0;
    if (!isIOS) {
      return velocity.setValue(currentScrollPosition);
    }
    setExtended(currentScrollPosition <= 0);
  };
  let [fontsLoaded] = useFonts({
    "Inter-Medium": require("../assets/fonts/Inter-Medium.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter-Bold.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter-SemiBold.ttf"),
    "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
  });

  const dispatch = useDispatch();
  const handleCloseModal = () => {
    setAddVisible(false);
    setOpen(false);
    setFolderName("");
  };

  function goToOrignalPrayer() {
    navigation.navigate("OldPrayerPage");
  }

  function addNewFolder() {
    dispatch(
      addFolder({
        id: uuid.v4(),
        name: folderName,
        prayers: [],
      })
    );
    setTimeout(() => {
      setAddVisible(false);
      setFolderName("");
    }, 0);
    // setAddVisible(false);
    // setFolderName("");
  }

  function deleteF() {
    if (idToDelete == 4044) {
      dispatch(deleteQuickFolder(idToDelete));
      setOpen(false);
    } else {
      dispatch(deleteFolder(idToDelete));
      dispatch(deletePrayerByFolderId(idToDelete));
      setOpen(false);
    }
  }

  const renderSectionHeader = ({ section }) => {
    return (
      <View>
        <Text
          style={
            theme == "dark"
              ? {
                  fontFamily: "Inter-Medium",
                  fontSize: 15,
                  marginBottom: 10,
                  color: "#bebebe",
                }
              : {
                  fontFamily: "Inter-Medium",
                  fontSize: 15,
                  marginBottom: 10,
                  color: "#36345e",
                }
          }
        >
          {section.title}
        </Text>
      </View>
    );
  };

  const renderAnsweredPrayers = ({ item, index }) => {
    return <AnsweredPrayer item={item} theme={theme} />;
  };

  const renderItem = ({ item, index }) => {
    return (
      <FolderItem
        item={item}
        theme={theme}
        navigation={navigation}
        open={open}
        setOpen={setOpen}
        idToDelete={idToDelete}
        setIdToDelete={setIdToDelete}
      />
    );
  };

  return (
    <View style={{ position: "relative", flex: 1 }}>
      <View
        style={{
          display: "flex",
          marginVertical: 15,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {folderClicked ? (
          <TouchableOpacity
            style={{
              width: "50%",
              justifyContent: "center",
              backgroundColor: theme == "dark" ? "#212121" : "#d1e3ff",
              borderRadius: 20,
              paddingVertical: 5,
              alignItems: "center",
            }}
            onPress={() => setFolderClicked(true)}
          >
            <HeaderTitle
              style={
                theme == "dark"
                  ? { fontFamily: "Inter-Bold", fontSize: 18, color: "white" }
                  : { fontFamily: "Inter-Bold", fontSize: 18, color: "#2F2D51" }
              }
            >
              Prayer Folders
            </HeaderTitle>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{
              width: "50%",
              justifyContent: "center",
              borderRadius: 20,
              paddingVertical: 5,
              alignItems: "center",
            }}
            onPress={() => setFolderClicked(true)}
          >
            <HeaderTitle
              style={
                theme == "dark"
                  ? { fontFamily: "Inter-Bold", fontSize: 18, color: "#979797" }
                  : { fontFamily: "Inter-Bold", fontSize: 18, color: "#2F2D51" }
              }
            >
              Prayer Folders
            </HeaderTitle>
          </TouchableOpacity>
        )}
        {/* <Divider
          style={
            theme == "dark"
              ? { width: 1.5, backgroundColor: "white", height: "100%" }
              : theme == "BlackWhite"
              ? { width: 1.5, backgroundColor: "black", height: "100%" }
              : { width: 1.5, backgroundColor: "#2f2d51", height: "100%" }
          }
        /> */}
        {folderClicked ? (
          <TouchableOpacity
            style={{
              width: "50%",

              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => setFolderClicked(false)}
          >
            <HeaderTitle
              style={
                theme == "dark"
                  ? { fontFamily: "Inter-Bold", fontSize: 18, color: "#979797" }
                  : { fontFamily: "Inter-Bold", fontSize: 18, color: "#2F2D51" }
              }
            >
              Answered
            </HeaderTitle>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{
              width: "50%",
              justifyContent: "center",
              backgroundColor: theme == "dark" ? "#212121" : "#d1e3ff",
              borderRadius: 20,
              paddingVertical: 5,
              alignItems: "center",
            }}
            onPress={() => setFolderClicked(false)}
          >
            <HeaderTitle
              style={
                theme == "dark"
                  ? {
                      fontFamily: "Inter-Bold",
                      fontSize: 18,
                      color: "white",
                    }
                  : { fontFamily: "Inter-Bold", fontSize: 18, color: "#2F2D51" }
              }
            >
              Answered
            </HeaderTitle>
          </TouchableOpacity>
        )}
      </View>
      {todos.length != 0 && folderClicked && (
        <ListView2
          style={
            theme == "dark"
              ? [styles.elevationDark, { backgroundColor: "#212121" }]
              : theme == "BlackWhite"
              ? [styles.elevationDark, { backgroundColor: "black" }]
              : [styles.elevation, { backgroundColor: "#2f2d51" }]
          }
          underlayColor={theme == "dark" ? "#121212" : "#F2F7FF"}
          onPress={goToOrignalPrayer}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{ color: "white", fontFamily: "Inter-Bold", fontSize: 15 }}
            >
              Original Prayers
            </Text>
            <AntDesign name="right" size={24} color="white" />
          </View>
        </ListView2>
      )}
      {folders.length == 0 && folderClicked && (
        <View
          style={{
            flex: 1,

            justifyContent: "center",
            alignItems: "center",
            marginTop: 90,
          }}
        >
          <AntDesign
            name="folder1"
            size={60}
            color={theme == "dark" ? "#e8bb4e" : "#2f2d51"}
          />
          <TodoText style={theme == "dark" ? styles.pressDark : styles.press}>
            Create a folder to write your prayers in!
          </TodoText>
          <Text
            style={{
              color: theme == "dark" ? "#d2d2d2" : "#2f2d51",
              fontSize: 13,
              fontFamily: "Inter-Regular",
            }}
          >
            (These prayers are only visible to you)
          </Text>
        </View>
      )}
      {folderClicked && (
        <>
          <FlatList
            data={folders}
            keyExtractor={(item) => item.id}
            onEndReachedThreshold={0}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            initialNumToRender={4}
            windowSize={8}
            onScroll={onScroll}
            renderItem={renderItem}
            numColumns={2}
            ListFooterComponent={() => (
              <View
                style={
                  theme == "dark"
                    ? {
                        height: 80,
                      }
                    : {
                        height: 80,
                      }
                }
              />
            )}
            columnWrapperStyle={{
              justifyContent: "space-between",
              columnGap: 8,
            }}
          />

          <View style={styles.actionButtons}>
            <AnimatedFAB
              icon={"plus"}
              label={"Create Folder"}
              extended={isExtended}
              onPress={() => {
                setAddVisible(true);
              }}
              visible={fabvisible}
              animateFrom={"left"}
              iconMode={"dynamic"}
              color={theme == "dark" ? "#121212" : "white"}
              style={
                theme == "dark"
                  ? styles.fabStyleDark
                  : theme == "BlackWhite"
                  ? styles.fabStyleBlack
                  : styles.fabStyle
              }
            />
            <View>
              {showNewBadge ? (
                <Text
                  style={{
                    color: "red",
                    alignSelf: "flex-start",
                    position: "absolute",
                    top: -20,
                    fontFamily: "Inter-Medium",
                    right: 5,
                  }}
                >
                  New
                </Text>
              ) : null}

              <AnimatedFAB
                icon={"hands-pray"}
                label={"Prayer Room"}
                extended={isExtended}
                onPress={() => {
                  navigation.navigate("PrayerRoom");
                }}
                visible={fabvisible}
                animateFrom={"right"}
                iconMode={"dynamic"}
                color={theme == "dark" ? "white" : "#2f2d51"}
                style={
                  theme == "dark"
                    ? [styles.fabStyleDark, { backgroundColor: "#212121" }]
                    : theme == "BlackWhite"
                    ? styles.fabStyleBlack
                    : [styles.fabStyle, { backgroundColor: "#b7d3ff" }]
                }
              />
            </View>
          </View>
        </>
      )}
      {!folderClicked && answeredPrayers.length != 0 && (
        <SectionList
          sections={sections}
          // keyExtractor={[(item, index) => item.id.toString()]}
          renderSectionHeader={renderSectionHeader}
          renderItem={renderAnsweredPrayers}
        />
      )}
      {!folderClicked && answeredPrayers.length == 0 && (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
            flex: 1,
          }}
        >
          <FontAwesome name="check-circle-o" size={70} color="#00b400" />
          <Text
            style={
              theme == "dark"
                ? { color: "white", fontSize: 15, fontFamily: "Inter-Medium" }
                : { color: "#2f2d51", fontSize: 15, fontFamily: "Inter-Medium" }
            }
          >
            Nothing on the list just yet!
          </Text>
        </View>
      )}
      <Modal
        animationType="fade"
        transparent={true}
        visible={open}
        onRequestClose={handleCloseModal}
        statusBarTranslucent={true}
        // onShow={() => inputRef.current?.focus()}
      >
        <ModalContainer
          style={
            theme == "dark"
              ? { backgroundColor: "rgba(0, 0, 0, 0.8)" }
              : { backgroundColor: "rgba(0, 0, 0, 0.8)" }
          }
        >
          <ModalView
            style={
              theme == "dark"
                ? { backgroundColor: "#212121" }
                : { backgroundColor: "#93D8F8" }
            }
          >
            <ModalIcon>
              <HeaderTitle
                style={
                  theme == "dark"
                    ? { fontFamily: "Inter-Bold", fontSize: 18, color: "white" }
                    : { fontSize: 18, fontFamily: "Inter-Bold" }
                }
              >
                Are you sure you want to delete this folder and all its prayers?
              </HeaderTitle>
            </ModalIcon>
            <ModalActionGroup>
              <ModalAction color={"white"} onPress={() => setOpen(false)}>
                <AntDesign
                  name="close"
                  size={28}
                  color={theme == "dark" ? "black" : "#2F2D51"}
                />
              </ModalAction>
              <ModalAction
                color={theme == "dark" ? "#121212" : "#2F2D51"}
                onPress={deleteF}
              >
                <AntDesign name="check" size={28} color={"white"} />
              </ModalAction>
            </ModalActionGroup>
          </ModalView>
        </ModalContainer>
      </Modal>

      <AddFolderModal
        addVisible={addVisible}
        addNewFolder={addNewFolder}
        theme={theme}
        folderName={folderName}
        setAddVisible={setAddVisible}
        handleCloseModal={handleCloseModal}
        setFolderName={setFolderName}
      />
    </View>
  );
};

const width = Dimensions.get("window").width - 30;

const styles = StyleSheet.create({
  fabStyleDark: {
    position: "relative",
    alignSelf: "center",
    borderRadius: 20,
    justifyContent: "center",
    backgroundColor: "#A5C9FF",
  },
  fabStyleBlack: {
    position: "relative",
    alignSelf: "center",
    borderRadius: 20,
    justifyContent: "center",
    backgroundColor: "black",
  },
  fabStyle: {
    position: "relative",
    alignSelf: "center",
    elevation: 0,
    shadowColor: "#f2f7ff",
    borderRadius: 20,
    justifyContent: "center",
    backgroundColor: "#36345e",
  },

  press: {
    fontFamily: "Inter-Medium",
    padding: 10,
    alignSelf: "center",
    textAlign: "center",
    color: "#2F2D51",
    fontSize: 17,
  },
  pressDark: {
    fontFamily: "Inter-Medium",
    padding: 10,
    textAlign: "center",
    alignSelf: "center",
    color: "white",
    fontSize: 17,
  },
  actionButtons: {
    position: "absolute",
    bottom: 10,
    height: 70,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fabStyle3: {
    bottom: 10,
    borderRadius: 20,
    justifyContent: "center",
    backgroundColor: "#2F2D51",
  },
  fabStyle3Dark: {
    bottom: 10,
    borderRadius: 20,
    justifyContent: "center",
    backgroundColor: "#A5C9FF",
  },
  inputDark: {
    width: 250,
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderRadius: 10,
    alignItems: "center",
    alignSelf: "center",
    textAlignVertical: "center",
    fontSize: 14,
    fontFamily: "Inter-Regular",
    backgroundColor: "#121212",
  },
  input: {
    width: 250,
    fontSize: 14,
    color: "white",
    // height: 40,
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderRadius: 10,
    alignItems: "center",
    alignSelf: "center",
    textAlignVertical: "center",
    fontFamily: "Inter-Regular",
    backgroundColor: "#2F2D51",
  },
});

export default Folder;
