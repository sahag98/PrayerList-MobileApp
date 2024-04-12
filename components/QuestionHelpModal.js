import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Modal } from "react-native";
import { ModalContainer } from "../styles/appStyles";
import { TouchableOpacity } from "react-native";
import { useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import { Transition, Transitioning } from "react-native-reanimated";
import { Button } from "react-native";
import { useRef } from "react";

import questionLight from "../assets/questionLight.png";
import questionDark from "../assets/questionDark.png";
import expire from "../assets/expire.png";
import insta from "../assets/insta.png";
import { Linking } from "react-native";
const QuestionHelpModal = ({
  questionHelpModal,
  setQuestionHelpModal,
  theme,
}) => {
  const [page, setPage] = useState(0);
  // const transition = (
  //   <Transition.Together>
  //     <Transition.In type="fade" durationMs={500} />
  //     <Transition.Out type="fade" durationMs={500} />
  //   </Transition.Together>
  // );
  const ref = useRef();

  const onNextPage = () => {
    if (page < 2) {
      // ref.current.animateNextTransition();
      setPage(page + 1);
    }
  };

  function StartOver() {
    setQuestionHelpModal(false);
    setPage(0);
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={questionHelpModal}
      onRequestClose={() => setQuestionHelpModal(false)}
      statusBarTranslucent={true}
    >
      <ModalContainer
        style={
          theme == "dark"
            ? { backgroundColor: "rgba(0, 0, 0, 0.8)" }
            : { backgroundColor: "rgba(0, 0, 0, 0.8)" }
        }
      >
        <View
          style={
            theme == "dark"
              ? {
                  borderRadius: 5,
                  position: "relative",
                  padding: 15,
                  width: "100%",
                  backgroundColor: "#212121",
                }
              : {
                  borderRadius: 5,
                  position: "relative",
                  padding: 15,
                  width: "100%",
                  backgroundColor: "#b7d3ff",
                }
          }
        >
          <Text
            style={
              theme == "dark"
                ? {
                    textAlign: "center",
                    fontFamily: "Inter-Bold",
                    color: "#A5C9FF",
                    fontSize: 18,
                    marginBottom: 10,
                  }
                : {
                    textAlign: "center",
                    fontFamily: "Inter-Bold",
                    color: "#2f2d51",
                    fontSize: 18,
                    marginBottom: 10,
                  }
            }
          >
            Welcome to Questions!
          </Text>
          <View ref={ref}>
            {page === 0 && (
              <View style={{ alignItems: "center", gap: 10 }}>
                <Image
                  style={styles.img}
                  source={theme == "dark" ? questionDark : questionLight}
                />

                <Text
                  style={
                    theme == "dark"
                      ? { fontFamily: "Inter-Regular", color: "white" }
                      : { fontFamily: "Inter-Regular", color: "#2f2d51" }
                  }
                >
                  This is a place where we can come together and explore
                  important questions related to our faith.
                </Text>
                <TouchableOpacity
                  style={
                    theme == "dark"
                      ? {
                          width: "100%",
                          borderColor: "#A5C9FF",
                          borderWidth: 1,
                          padding: 15,
                          borderRadius: 10,
                          justifyContent: "center",
                          alignItems: "center",
                        }
                      : {
                          width: "100%",
                          backgroundColor: "#2f2d51",
                          padding: 15,
                          borderRadius: 10,
                          justifyContent: "center",
                          alignItems: "center",
                        }
                  }
                  onPress={onNextPage}
                >
                  <Text style={{ color: "white", fontFamily: "Inter-Bold" }}>
                    Next
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {page === 1 && (
              <View style={{ alignItems: "center", gap: 10 }}>
                <Image style={styles.img} source={insta} />
                <View style={{ alignItems: "center", gap: 10 }}>
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL("https://www.instagram.com/prayse.app/")
                    }
                  >
                    <Text
                      style={
                        theme == "dark"
                          ? { fontFamily: "Inter-Regular", color: "white" }
                          : { fontFamily: "Inter-Regular", color: "#2f2d51" }
                      }
                    >
                      Follow us on Instagram{" "}
                      <Text style={{ fontFamily: "Inter-Medium" }}>
                        @prayse.app
                      </Text>{" "}
                      to get insight on the next possible question.
                    </Text>
                  </TouchableOpacity>
                  {/* <Text
                    style={
                      theme == "dark"
                        ? { fontFamily: "Inter-Regular", color: "white" }
                        : { fontFamily: "Inter-Regular", color: "#2f2d51" }
                    }
                  >
                    Once you answer the question you will not be able to edit or
                    delete your question.
                  </Text> */}
                </View>
                <TouchableOpacity
                  style={
                    theme == "dark"
                      ? {
                          width: "100%",
                          backgroundColor: "#A5C9FF",
                          padding: 15,
                          borderRadius: 10,
                          justifyContent: "center",
                          alignItems: "center",
                        }
                      : {
                          width: "100%",
                          backgroundColor: "#2f2d51",
                          padding: 15,
                          borderRadius: 10,
                          justifyContent: "center",
                          alignItems: "center",
                        }
                  }
                  onPress={StartOver}
                >
                  <Text
                    style={
                      theme == "dark"
                        ? { color: "#121212", fontFamily: "Inter-Bold" }
                        : { color: "white", fontFamily: "Inter-Bold" }
                    }
                  >
                    Got it!
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ModalContainer>
    </Modal>
  );
};

export default QuestionHelpModal;

const styles = StyleSheet.create({
  img: {
    marginVertical: 10,
    width: 150,
    height: 150,
  },
});
