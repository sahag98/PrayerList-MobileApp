import {
  FlatList,
  StyleSheet,
  Text,
  Platform,
  TouchableOpacity,
  View,
} from "react-native";
import { Container, HeaderTitle, HeaderView } from "../styles/appStyles";
import { useSelector } from "react-redux";
import { AntDesign } from "@expo/vector-icons";
import { client } from "../lib/client";
import { useState } from "react";
import { useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";

import AnswerItem from "../components/AnswerItem";
import { MaterialIcons } from "@expo/vector-icons";
import { useSupabase } from "../context/useSupabase";

import { AnimatedFAB } from "react-native-paper";

import QuestionModal from "../components/QuestionModal";
import moment from "moment";
import { ActivityIndicator } from "react-native";

import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import QuestionHelpModal from "../components/QuestionHelpModal";

import Animated, { FadeIn } from "react-native-reanimated";

const Question = ({ navigation, route }) => {
  const { answers, currentUser, supabase, newAnswer } = useSupabase();
  const [answersVisible, setAnswersVisible] = useState(false);
  const item = route?.params.item;
  const theme = useSelector((state) => state.user.theme);
  const isFocused = useIsFocused();
  const [inputHeight, setInputHeight] = useState(60);
  const [questionHelpModal, setQuestionHelpModal] = useState(false);

  const handleContentSizeChange = (event) => {
    if (event.nativeEvent.contentSize.height < 60) {
      setInputHeight(60);
    } else {
      setInputHeight(event.nativeEvent.contentSize.height);
    }
  };

  return (
    <Container
      style={
        theme == "dark"
          ? { backgroundColor: "#121212", position: "relative" }
          : { backgroundColor: "#F2F7FF", position: "relative" }
      }
    >
      <HeaderView style={{ marginTop: 10, alignItems: "center" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <TouchableOpacity onPress={() => navigation.navigate("QuestionList")}>
            <AntDesign
              name="left"
              size={24}
              color={theme == "dark" ? "white" : "#2f2d51"}
            />
          </TouchableOpacity>
          <HeaderTitle
            style={
              theme == "dark"
                ? { fontFamily: "Inter-Bold", color: "white" }
                : {
                    fontFamily: "Inter-Bold",
                    color: "#2F2D51",
                  }
            }
          >
            <Text>Question</Text>
          </HeaderTitle>
        </View>
      </HeaderView>
      <View style={theme == "dark" ? styles.questionDark : styles.question}>
        <Text
          style={
            theme == "dark"
              ? {
                  fontSize: 23,
                  marginBottom: 10,
                  color: "white",
                  fontFamily: "Inter-Bold",
                }
              : {
                  fontSize: 23,
                  marginBottom: 10,
                  color: "#2f2d51",
                  fontFamily: "Inter-Bold",
                }
          }
        >
          {item.question.title}
        </Text>
      </View>
      {newAnswer && (
        <Animated.View
          entering={FadeIn.duration(300)}
          style={
            theme == "dark"
              ? {
                  position: "absolute",
                  zIndex: 99,
                  width: "65%",
                  alignSelf: "center",
                  marginVertical: 10,
                  backgroundColor: "#121212",
                  borderRadius: 50, // Set your desired border radius
                  ...Platform.select({
                    ios: {
                      shadowColor: theme == "dark" ? "#A5C9FF" : "#2f2d51",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                    },
                    android: {
                      elevation: 4,
                    },
                  }),
                }
              : {
                  position: "absolute",
                  zIndex: 99,
                  width: "70%",
                  alignSelf: "center",
                  marginVertical: 10,
                  backgroundColor: "white",
                  borderRadius: 50, // Set your desired border radius
                  ...Platform.select({
                    ios: {
                      shadowColor: "#2f2d51",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                    },
                    android: {
                      elevation: 4,
                    },
                  }),
                }
          }
        >
          <Animated.Text
            style={
              theme == "dark"
                ? {
                    fontFamily: "Inter-Bold",
                    paddingVertical: 15,
                    paddingHorizontal: 5,
                    color: "#A5C9FF",
                    textAlign: "center",
                    fontSize: 13,
                  }
                : {
                    fontFamily: "Inter-Bold",
                    paddingVertical: 15,
                    paddingHorizontal: 5,
                    color: "#2f2d51",
                    textAlign: "center",
                    fontSize: 13,
                  }
            }
          >
            New Answers! Pull down to refresh
          </Animated.Text>
        </Animated.View>
      )}
      <View
        style={{
          flex: 1,
          width: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1, width: "100%" }}>
          {item.answers.length == 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialIcons
                name="question-answer"
                size={50}
                color={theme == "dark" ? "#A5C9FF" : "#2f2d51"}
              />
              <Text
                style={
                  theme == "dark"
                    ? {
                        fontFamily: "Inter-Medium",
                        marginTop: 10,
                        color: "#A5C9FF",
                      }
                    : {
                        fontFamily: "Inter-Medium",
                        marginTop: 10,
                        color: "#2f2d51",
                      }
                }
              >
                No answers at this moment.
              </Text>
            </View>
          ) : (
            <FlatList
              data={item.answers}
              keyExtractor={(e, i) => i.toString()}
              onEndReachedThreshold={0}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={() => (
                <View
                  style={
                    theme == "dark"
                      ? {
                          height: 100,
                        }
                      : {
                          height: 100,
                        }
                  }
                />
              )}
              renderItem={({ item }) => (
                <AnswerItem item={item} theme={theme} />
              )}
            />
          )}
        </View>
      </View>
      <View style={styles.actionButtons}>
        <AnimatedFAB
          icon={"plus"}
          label={"Add answer"}
          extended={true}
          onPress={() => setAnswersVisible(true)}
          visible={true}
          animateFrom={"right"}
          iconMode={"dynamic"}
          color={theme == "dark" ? "#212121" : "white"}
          style={theme == "dark" ? styles.fabStyleDark : styles.fabStyle}
        />
      </View>
      <QuestionModal
        answersLength={answers.length}
        user={currentUser}
        question={item.question}
        // fetchAnswers={fetchAnswers}
        answersArray={item.answers}
        theme={theme}
        supabase={supabase}
        setAnswersVisible={setAnswersVisible}
        answersVisible={answersVisible}
      />
    </Container>
  );
};

export default Question;

const styles = StyleSheet.create({
  questionDark: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "grey",
  },
  question: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#2f2d51",
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

  inputField: {
    marginVertical: 10,
    height: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    alignSelf: "center",
  },
  inputDark: {
    color: "white",
    fontFamily: "Inter-Regular",
    width: "85%",
    borderColor: "#212121",
    backgroundColor: "#212121",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  input: {
    color: "#2f2d51",
    fontFamily: "Inter-Regular",
    width: "85%",
    borderColor: "#2f2d51",
    backgroundColor: "white",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
});
