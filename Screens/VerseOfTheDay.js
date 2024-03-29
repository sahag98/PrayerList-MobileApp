import { StyleSheet, Text, Share, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Container, HeaderTitle } from "../styles/appStyles";
import { useDispatch, useSelector } from "react-redux";
import { addToFavorites, deleteFavorites } from "../redux/favoritesReducer";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import uuid from "react-native-uuid";
import * as Speech from "expo-speech";
import { client } from "../lib/client";
import { ActivityIndicator } from "react-native";

const VerseOfTheDay = ({ route }) => {
  const theme = useSelector((state) => state.user.theme);
  const favorites = useSelector((state) => state.favorites.favoriteVerses);
  const dispatch = useDispatch();
  const [verse, setVerse] = useState([]);
  const [verseTitle, setVerseTitle] = useState("");
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const speak = async (verse, chapter) => {
    if (verse && chapter) {
      const speakVerse = verse + " - " + chapter;

      Speech.speak(speakVerse);
    }
  };
  useEffect(() => {
    loadDailyVerse();
    // if (route.params) {
    //   AsyncStorage.setItem("storedVerse", route.params.verse);
    //   AsyncStorage.setItem("storedVerseTitle", route.params.title);
    //   loadDailyVerse();
    // }
  }, [isFocused]);

  const loadDailyVerse = () => {
    const query = '*[_type=="verse"]';
    client
      .fetch(query)
      .then((data) => {
        setVerse(data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const onShare = async (verse, chapter) => {
    if (verse && chapter) {
      const shareVerse = verse + " - " + chapter;

      try {
        await Share.share({
          message: shareVerse,
        });
      } catch (error) {
        Alert.alert(error.message);
      }
    }
  };

  const HandleFavorites = (verse) => {
    dispatch(
      addToFavorites({
        verse,
      })
    );
  };

  const BusyIndicator = () => {
    return (
      <View
        style={
          theme == "dark"
            ? { backgroundColor: "#121212", flex: 1, justifyContent: "center" }
            : { backgroundColor: "#F2F7FF", flex: 1, justifyContent: "center" }
        }
      >
        <ActivityIndicator
          size="large"
          color={theme == "dark" ? "white" : "#2f2d51"}
        />
      </View>
    );
  };

  if (verse.length == 0) {
    return <BusyIndicator />;
  }

  // const message = verse.split("-");

  return (
    <Container
      style={
        theme == "dark"
          ? { backgroundColor: "#121212" }
          : { backgroundColor: "#F2F7FF" }
      }
    >
      <View
        style={{
          marginVertical: 10,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          style={{ marginRight: 5 }}
          onPress={() => navigation.navigate("More")}
        >
          <Ionicons
            name="chevron-back"
            size={30}
            color={theme == "light" ? "#2f2d51" : "white"}
          />
        </TouchableOpacity>
        <HeaderTitle
          style={
            theme == "dark"
              ? { fontFamily: "Inter-Bold", color: "white" }
              : { fontFamily: "Inter-Bold", color: "#2F2D51" }
          }
        >
          Verse of the Day
        </HeaderTitle>
      </View>
      <Text
        style={
          theme == "dark"
            ? {
                fontSize: 15,
                fontFamily: "Inter-Medium",
                color: "#e0e0e0",
                marginBottom: 10,
                lineHeight: 22,
              }
            : {
                lineHeight: 22,
                fontSize: 15,
                fontFamily: "Inter-Medium",
                color: "#2f2d51",
                marginBottom: 10,
              }
        }
      >
        Welcome to the Verse of the Day page! Our goal is to provide you with a
        daily reminder of God's love, grace, and wisdom.
      </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate("Favorites")}
        style={theme == "dark" ? styles.favoritesDark : styles.favorites}
      >
        <Text
          style={
            theme == "dark"
              ? { fontFamily: "Inter-Medium", color: "white", fontSize: 16 }
              : { fontFamily: "Inter-Medium", color: "#2f2d51", fontSize: 16 }
          }
        >
          Favorite Verses
        </Text>
        <AntDesign
          style={{ marginLeft: 10 }}
          name="right"
          size={20}
          color={theme == "dark" ? "white" : "#2f2d51"}
        />
      </TouchableOpacity>
      <View style={{ justifyContent: "center", marginTop: 15 }}>
        <Text style={theme == "dark" ? styles.verseDark : styles.verse}>
          {verse[0].verse}
        </Text>
        <View>
          {verse[0] !=
            "No daily verse just yet. (Make sure to enable notifications to recieve the daily verse)" && (
            <Text
              style={
                theme == "dark" ? styles.verseTitleDark : styles.verseTitle
              }
            >
              - {verse[0].chapter}
            </Text>
          )}
          <View
            style={theme == "dark" ? styles.utiltiesDark : styles.utilities}
          >
            <TouchableOpacity
              onPress={() => onShare(verse[0].verse, verse[0].chapter)}
              style={{
                flexDirection: "row",
                width: "33.33%",
                justifyContent: "center",
                height: "100%",
                borderRightWidth: 1,
                borderColor: "#838383",
                alignItems: "center",
              }}
            >
              <Text
                style={
                  theme == "dark"
                    ? {
                        fontSize: 14,
                        fontFamily: "Inter-Medium",
                        marginRight: 10,
                        color: "#ebebeb",
                      }
                    : {
                        fontSize: 14,
                        fontFamily: "Inter-Medium",
                        marginRight: 10,
                        color: "white",
                      }
                }
              >
                Share
              </Text>
              <AntDesign
                name="sharealt"
                size={20}
                color={theme == "dark" ? "#ebebeb" : "white"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => speak(verse[0].verse, verse[0].chapter)}
              style={{
                flexDirection: "row",
                width: "33.33%",
                justifyContent: "center",
                height: "100%",
                borderRightWidth: 1,
                borderColor: "#838383",
                alignItems: "center",
              }}
            >
              <Text
                style={
                  theme == "dark"
                    ? {
                        fontSize: 14,
                        fontFamily: "Inter-Medium",
                        marginRight: 10,
                        color: "#ebebeb",
                      }
                    : {
                        fontSize: 14,
                        fontFamily: "Inter-Medium",
                        marginRight: 10,
                        color: "white",
                      }
                }
              >
                Voice
              </Text>
              <AntDesign
                name="sound"
                size={24}
                color={theme == "dark" ? "#ebebeb" : "white"}
              />
            </TouchableOpacity>
            {favorites?.some((item) => item.verse.verse == verse[0].verse) ? (
              <TouchableOpacity
                disabled={true}
                style={{
                  flexDirection: "row",
                  width: "33.33%",
                  justifyContent: "center",
                  height: "100%",
                  alignItems: "center",
                }}
              >
                <Text
                  style={
                    theme == "dark"
                      ? {
                          fontSize: 14,
                          marginRight: 5,
                          color: "#d8d800",
                          fontFamily: "Inter-Medium",
                        }
                      : {
                          fontSize: 14,
                          fontFamily: "Inter-Medium",
                          marginRight: 10,
                          color: "#d8d800",
                        }
                  }
                >
                  Favorited
                </Text>
                <AntDesign
                  name="staro"
                  size={25}
                  color={theme == "dark" ? "#d8d800" : "#d8d800"}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => HandleFavorites(verse[0])}
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  width: "33.33%",
                  height: "100%",
                  alignItems: "center",
                }}
              >
                <Text
                  style={
                    theme == "dark"
                      ? {
                          marginRight: 5,
                          color: "#aaaaaa",
                          fontFamily: "Inter-Medium",
                          fontSize: 14,
                        }
                      : {
                          fontSize: 14,
                          fontFamily: "Inter-Medium",
                          marginRight: 10,
                          color: "white",
                        }
                  }
                >
                  Favorite
                </Text>
                <AntDesign
                  name="staro"
                  size={25}
                  color={theme == "dark" ? "#aaaaaa" : "white"}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Container>
  );
};

export default VerseOfTheDay;

const styles = StyleSheet.create({
  utiltiesDark: {
    backgroundColor: "#212121",
    borderRadius: 20,
    height: 50,
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  utilities: {
    backgroundColor: "#2f2d51",
    borderRadius: 20,
    height: 50,
    marginTop: 20,
    shadowColor: "#bdbdbd",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.17,
    shadowRadius: 3.05,
    elevation: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  favoritesDark: {
    width: "100%",
    borderRadius: 10,
    borderColor: "#A5C9FF",
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    padding: 20,
  },
  favorites: {
    borderRadius: 10,
    width: "100%",
    backgroundColor: "#93d8f8",
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
    justifyContent: "space-between",
    marginTop: 10,
    padding: 20,
  },
  verseDark: {
    fontSize: 15,
    fontFamily: "Inter-Regular",
    lineHeight: 40,
    color: "white",
  },
  verse: {
    fontSize: 15,
    fontFamily: "Inter-Regular",
    lineHeight: 40,
    color: "#2f2d51",
  },
  verseTitleDark: {
    fontSize: 16,
    textAlign: "right",
    fontFamily: "Inter-Medium",
    color: "white",
    marginTop: 10,
  },
  verseTitle: {
    fontSize: 16,
    textAlign: "right",
    fontFamily: "Inter-Medium",
    color: "#2f2d51",
    marginTop: 10,
  },
});
