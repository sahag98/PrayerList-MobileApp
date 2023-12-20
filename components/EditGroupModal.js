import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";
import { AntDesign } from "@expo/vector-icons";
import {
  HeaderTitle,
  ModalAction,
  ModalActionGroup,
  ModalContainer,
  ModalIcon,
  ModalView,
  StyledInput,
} from "../styles/appStyles";

const EditGroupModal = ({
  theme,
  openEdit,
  groupName,
  setGroupName,
  setOpenEdit,
}) => {
  const editGroup = async () => {
    console.log("edit");
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
  };
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={openEdit}
      onRequestClose={handleCloseEdit}
      statusBarTranslucent={true}
      // onShow={() => inputRef.current?.focus()}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
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
                    ? {
                        fontFamily: "Inter-Bold",
                        fontSize: 18,
                        color: "white",
                      }
                    : { fontSize: 18, fontFamily: "Inter-Bold" }
                }
              >
                Change Group name
              </HeaderTitle>
            </ModalIcon>
            <StyledInput
              style={theme == "dark" ? styles.inputDark : styles.input}
              placeholder="Enter new folder name"
              placeholderTextColor={"white"}
              selectionColor={"white"}
              autoFocus={true}
              onChangeText={(text) => setGroupName(text)}
              value={groupName}
              onSubmitEditing={(e) => {
                e.key === "Enter" && e.preventDefault();
              }}
            />
            <ModalActionGroup>
              <ModalAction color={"white"} onPress={() => setOpenEdit(false)}>
                <AntDesign
                  name="close"
                  size={28}
                  color={theme == "dark" ? "black" : "#2F2D51"}
                />
              </ModalAction>
              <ModalAction
                color={theme == "dark" ? "#121212" : "#2F2D51"}
                onPress={() => editGroup(item.id)}
              >
                <AntDesign name="check" size={28} color={"white"} />
              </ModalAction>
            </ModalActionGroup>
          </ModalView>
        </ModalContainer>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditGroupModal;

const styles = StyleSheet.create({
  inputDark: {
    alignItems: "center",
    alignSelf: "center",
    textAlignVertical: "center",
    fontSize: 14,
    fontFamily: "Inter-Regular",
    backgroundColor: "#121212",
  },
  input: {
    alignItems: "center",
    alignSelf: "center",
    textAlignVertical: "center",
    fontFamily: "Inter-Regular",
    backgroundColor: "#2F2D51",
  },
});
