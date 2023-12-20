import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Keyboard,
  Image,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Platform,
} from "react-native";
import { AntDesign, Feather, Entypo } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as Notifications from "expo-notifications";
import { Container, HeaderTitle, HeaderView } from "../styles/appStyles";
import uuid from "react-native-uuid";
import { useDispatch, useSelector } from "react-redux";
import { addNewReminder, editReminder } from "../redux/remindersReducer";
import calendar from "../assets/calendar.png";
import time from "../assets/time.png";
import { useIsFocused } from "@react-navigation/native";
import Toast from "react-native-toast-message";

export default function Reminder({ route, navigation }) {
  const isFocus = useIsFocused();
  const theme = useSelector((state) => state.user.theme);
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState("");
  const [newNote, setNewNote] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [repeatOption, setRepeatOption] = useState("");
  const [visible, setVisible] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");

  const [isRepeat, setIsRepeat] = useState(false);
  const toggleSwitch = () => {
    setIsRepeat((previousState) => !previousState);
    setRepeatOption("");
  };
  const dispatch = useDispatch();

  useEffect(() => {
    console.log(route.params);
    if (route.params.reminder != undefined && route.params.type == "Add") {
      // console.log(route.params);
      console.log("reminder: ", route?.params?.reminder);
      setReminderDate("");
      setRepeatOption("");
      setIsRepeat(false);
      setReminderTime("");
      setNewReminder(route?.params?.reminder);
    }

    if (route.params.reminder == undefined && route.params.type == "Add") {
      setNewReminder("");
      setNewNote("");
      setReminderDate("");
      setRepeatOption("");
      setIsRepeat(false);
      setReminderTime("");
    }

    if (
      route.params.reminderToEdit != undefined &&
      route.params.type != "Add"
    ) {
      let reminderToEdit = route.params.reminderToEdit;
      setNewReminder(reminderToEdit.reminder.message);
      setNewNote(reminderToEdit.reminder?.note);
      let originalTimestamp = reminderToEdit.reminder?.time;
      const dateObject = new Date(originalTimestamp);

      let date = new Date(
        dateObject.getFullYear(),
        dateObject.getMonth(),
        dateObject.getDate()
      );

      setReminderDate(date);
      let time = new Date(0); // Initialize with the epoch
      time.setHours(dateObject.getHours());
      time.setMinutes(dateObject.getMinutes());
      console.log("time: ", time);
      setReminderTime(time);
      if (reminderToEdit.ocurrence) {
        console.log(reminderToEdit.ocurrence);
        setIsRepeat(true);
        setRepeatOption(reminderToEdit.ocurrence.toLowerCase());
      }
    }

    if (
      route.params.reminderToEdit == undefined &&
      route.params.type != "Add"
    ) {
      setNewReminder("");
      setNewNote("");
      setReminderDate("");
      setReminderTime("");
    }
  }, [isFocus]);

  const showToast = (type, content) => {
    Toast.show({
      type,
      text1: "Reminder has been created.",
      text2: "View",
      visibilityTime: 3000,
      position: "bottom",
      onPress: () => navigation.navigate("Home"),
    });
  };

  const showEditToast = (type, content) => {
    Toast.show({
      type: "edit",
      text1: "Reminder has been edited.",
      text2: "View",
      visibilityTime: 3000,
      position: "bottom",
      onPress: () => navigation.navigate("Home"),
    });
  };

  const scheduleNotification = async (reminder, combinedDate, type) => {
    const secondsUntilNotification = Math.floor(
      (combinedDate.getTime() - Date.now()) / 1000
    );

    if (repeatOption == "daily" && isRepeat) {
      console.log("daily reminder notification");
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Reminder",
          body: reminder.message,
        },
        trigger: {
          hour: combinedDate.getHours(),
          minute: combinedDate.getMinutes(),
          repeats: true,
        },
      });
      if (type == "edit") {
        dispatch(
          editReminder({
            reminder: reminder,
            identifier: identifier,
            ocurrence: "Daily",
          })
        );
      } else {
        dispatch(
          addNewReminder({
            reminder: reminder,
            identifier: identifier,
            ocurrence: "Daily",
          })
        );
      }
    } else if (repeatOption == "weekly" && Platform.OS == "ios") {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Reminder",
          body: reminder.message,
        },
        trigger: {
          weekday: combinedDate.getDay() + 1,
          hour: combinedDate.getHours(),
          minute: combinedDate.getMinutes(),
          repeats: isRepeat,
        },
      });

      if (type == "edit") {
        dispatch(
          editReminder({
            reminder: reminder,
            identifier: identifier,
            ocurrence: "Weekly",
          })
        );
      } else {
        dispatch(
          addNewReminder({
            reminder: reminder,
            identifier: identifier,
            ocurrence: "Weekly",
          })
        );
      }
    } else if (repeatOption == "weekly" && Platform.OS == "android") {
      console.log("hey android");
      const newDate = new Date(
        combinedDate.getTime() + 6 * 24 * 60 * 60 * 1000
      );
      const seconds = newDate.getTime() / 1000;
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Reminder",
          body: reminder.message,
        },
        trigger: {
          seconds: seconds,
          repeats: isRepeat,
        },
      });

      if (type == "edit") {
        dispatch(
          editReminder({
            reminder: reminder,
            identifier: identifier,
            ocurrence: "None",
          })
        );
      } else {
        dispatch(
          addNewReminder({
            reminder: reminder,
            identifier: identifier,
            ocurrence: "None",
          })
        );
      }
    } else {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Reminder",
          body: reminder.message,
        },
        trigger: {
          seconds: secondsUntilNotification,
        },
      });

      if (type == "edit") {
        dispatch(
          editReminder({
            reminder: reminder,
            identifier: identifier,
            ocurrence: "Daily",
          })
        );
      } else {
        dispatch(
          addNewReminder({
            reminder: reminder,
            identifier: identifier,
            ocurrence: "Daily",
          })
        );
      }
    }
  };

  const handleEditReminder = async () => {
    const combinedDate = new Date(
      reminderDate.getFullYear(),
      reminderDate.getMonth(),
      reminderDate.getDate(),
      reminderTime.getHours(),
      reminderTime.getMinutes()
    );

    const newReminderObj = {
      id: uuid.v4(),
      message: newReminder,
      note: newNote,
      time: combinedDate,
    };

    console.log(route.params.reminderToEdit.identifier);

    await Notifications.cancelScheduledNotificationAsync(
      route.params.reminderToEdit.identifier
    );
    scheduleNotification(
      newReminderObj,
      combinedDate,
      "edit"
      // reminderTime.getHours(),
      // reminderTime.getMinutes()
    );

    showEditToast();
    setNewReminder("");
    setNewNote("");
    setReminderDate("");
    setReminderTime("");
    setRepeatOption("");
    setIsRepeat(false);
    Keyboard.dismiss();
    navigation.goBack();
  };

  const addReminder = () => {
    if (newReminder.length == 0) {
      setTitleError("Title is required.");
      return;
    }

    console.log("date: ", reminderDate.toString().length);
    const combinedDate = new Date(
      reminderDate.getFullYear(),
      reminderDate.getMonth(),
      reminderDate.getDate(),
      reminderTime.getHours(),
      reminderTime.getMinutes()
    );

    // console.log("time :", reminderTime);

    const newReminderObj = {
      id: uuid.v4(),
      message: newReminder,
      note: newNote,
      time: combinedDate,
    };

    scheduleNotification(
      newReminderObj,
      combinedDate,
      "add"
      // reminderTime.getHours(),
      // reminderTime.getMinutes()
    );

    setReminders([...reminders, newReminderObj]);
    showToast();
    setNewReminder("");
    setNewNote("");
    setReminderDate("");
    setReminderTime("");
    setRepeatOption("");
    setIsRepeat(false);
    navigation.goBack();
    Keyboard.dismiss();
  };

  const clearAll = () => {
    setNewReminder("");
    setDatePickerVisibility(false);
    setTimePickerVisibility(false);
    setReminderDate("");
    setNewNote("");
    setRepeatOption("");
    setReminderTime("");
    navigation.goBack();
  };
  const showDatePicker = () => {
    Keyboard.dismiss();
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const showTimePicker = () => {
    Keyboard.dismiss();
    console.log("date :", reminderDate.length);
    if (reminderDate.length == 0) {
      let today = new Date();
      setReminderDate(today);
      console.log(today);
    }
    setReminderTime(Date.now());
    setTimePickerVisibility(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisibility(false);
  };

  const handleDateConfirm = (date) => {
    hideDatePicker();

    setReminderDate(date);
  };

  const handleTimeConfirm = (time) => {
    hideTimePicker();
    setReminderTime(time);
  };

  return (
    <Container
      style={
        theme == "dark"
          ? {
              flex: 1,
              backgroundColor: "#121212",
              justifyContent: "center",
              alignItems: "center",
              padding: 16,
            }
          : {
              flex: 1,
              backgroundColor: "#f2f7ff",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              padding: 16,
            }
      }
    >
      <HeaderView style={{ justifyContent: "space-between", width: "100%" }}>
        <View style={{ flexDirection: "row", gap: 5 }}>
          <TouchableOpacity onPress={clearAll}>
            <AntDesign
              name="left"
              size={24}
              color={theme == "dark" ? "white" : "#2f2d51"}
            />
          </TouchableOpacity>
          <HeaderTitle
            style={
              theme == "dark"
                ? { color: "white", fontFamily: "Inter-Bold" }
                : { color: "#2f2d51", fontFamily: "Inter-Bold" }
            }
          >
            {route.params.type} Reminder
          </HeaderTitle>
        </View>
        <TouchableOpacity
          onPress={
            route.params.type == "Add" ? addReminder : handleEditReminder
          }
          disabled={newReminder.length == 0 ? true : false}
          style={{ flexDirection: "row", gap: 5, alignItems: "center" }}
        >
          <Text
            style={
              newReminder.length === 0 ||
              reminderDate.toString().length === 0 ||
              reminderTime.toString().length === 0
                ? {
                    fontSize: 18,
                    fontFamily: "Inter-Bold",
                    color: theme == "dark" ? "#5c5c5c" : "grey",
                  }
                : {
                    fontSize: 18,
                    fontFamily: "Inter-Bold",
                    color: theme == "light" ? "#2f2d51" : "#A5C9FF",
                  }
            }
          >
            {route.params.type}
          </Text>
          {route.params.type == "Edit" ? (
            <Feather
              name="edit-2"
              size={23}
              color={
                newReminder.length === 0 ||
                reminderDate.toString().length === 0 ||
                reminderTime.toString().length === 0
                  ? theme == "dark"
                    ? "#5c5c5c"
                    : "grey"
                  : theme == "light"
                  ? "#2f2d51"
                  : "#A5C9FF"
              }
            />
          ) : (
            <Entypo
              name="plus"
              size={30}
              color={
                newReminder.length === 0 ||
                reminderDate.toString().length === 0 ||
                reminderTime.toString().length === 0
                  ? theme == "dark"
                    ? "#5c5c5c"
                    : "grey"
                  : theme == "light"
                  ? "#2f2d51"
                  : "#A5C9FF"
              }
            />
          )}
        </TouchableOpacity>
      </HeaderView>
      <View
        style={{
          flex: 1,
          marginTop: 10,
          width: "100%",
          position: "relative",
          gap: 10,
        }}
      >
        <View
          style={
            theme == "dark"
              ? {
                  backgroundColor: "#212121",
                  width: "100%",
                  padding: 10,
                  borderRadius: 8,
                  gap: 10,
                }
              : {
                  backgroundColor: "#93d8f8",
                  width: "100%",
                  padding: 10,
                  borderRadius: 8,
                  gap: 10,
                }
          }
        >
          <TextInput
            style={
              theme == "dark"
                ? { minHeight: 30, color: "white" }
                : { minHeight: 30, color: "#2f2d51" }
            }
            placeholderTextColor={theme == "dark" ? "#d2d2d2" : "#808080"}
            placeholder="Prayer Title"
            selectionColor={theme == "dark" ? "white" : "#2f2d51"}
            value={newReminder}
            onChangeText={(text) => setNewReminder(text)}
          />

          <View
            style={
              theme == "dark"
                ? { width: "100%", backgroundColor: "grey", height: 0.5 }
                : { width: "100%", backgroundColor: "#2f2d51", height: 0.5 }
            }
          />
          <TextInput
            placeholderTextColor={theme == "dark" ? "#d2d2d2" : "#808080"}
            style={
              theme == "dark"
                ? { minHeight: 50, color: "white" }
                : { minHeight: 50, color: "#2f2d51" }
            }
            placeholder="Prayer Notes"
            multiline={true}
            textAlignVertical="top"
            numberOfLines={3}
            value={newNote}
            onChangeText={(text) => setNewNote(text)}
          />
        </View>

        <View
          style={
            theme == "dark"
              ? {
                  backgroundColor: "#212121",
                  padding: 10,
                  gap: 5,
                  borderRadius: 8,
                }
              : {
                  backgroundColor: "#93d8f8",
                  padding: 10,
                  gap: 5,
                  borderRadius: 8,
                }
          }
        >
          <TouchableOpacity
            onPress={showDatePicker}
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 5,
            }}
          >
            <View style={{ gap: 5 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <Image
                  style={
                    theme == "dark"
                      ? [styles.img, { tintColor: "#f1d592" }]
                      : [styles.img, { tintColor: "#dda41c" }]
                  }
                  source={calendar}
                />
                <Text
                  style={
                    theme == "dark"
                      ? { fontFamily: "Inter-Medium", color: "white" }
                      : { fontFamily: "Inter-Medium", color: "#2f2d51" }
                  }
                >
                  Date
                </Text>
              </View>
              {reminderDate.toString().length > 0 && (
                <Text
                  style={
                    theme == "dark"
                      ? { fontFamily: "Inter-Regular", color: "grey" }
                      : { fontFamily: "Inter-Regular", color: "#2f2d51" }
                  }
                >
                  {reminderDate.toDateString()}
                </Text>
              )}
            </View>
            <AntDesign
              name="right"
              size={24}
              color={theme == "dark" ? "white" : "#2f2d51"}
            />
          </TouchableOpacity>
          <View
            style={
              theme == "dark"
                ? { width: "100%", backgroundColor: "grey", height: 0.5 }
                : { width: "100%", backgroundColor: "#2f2d51", height: 0.5 }
            }
          />
          <TouchableOpacity
            onPress={showTimePicker}
            style={{
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 5,
            }}
          >
            <View style={{ gap: 5 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <Image
                  style={
                    theme == "dark"
                      ? [styles.img, { tintColor: "#A5C9FF" }]
                      : [styles.img, { tintColor: "#438eff" }]
                  }
                  source={time}
                />
                <Text
                  style={
                    theme == "dark"
                      ? { fontFamily: "Inter-Medium", color: "white" }
                      : { fontFamily: "Inter-Medium", color: "#2f2d51" }
                  }
                >
                  Time
                </Text>
              </View>
              {reminderTime.toString().length > 0 && (
                <Text
                  style={
                    theme == "dark"
                      ? { fontFamily: "Inter-Regular", color: "grey" }
                      : { fontFamily: "Inter-Regular", color: "#2f2d51" }
                  }
                >
                  {new Date(reminderTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              )}
            </View>
            <AntDesign
              name="right"
              size={24}
              color={theme == "dark" ? "white" : "#2f2d51"}
            />
          </TouchableOpacity>
        </View>

        <View
          style={
            theme == "dark"
              ? {
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#212121",
                  borderRadius: 8,
                  padding: 8,
                }
              : {
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#93d8f8",
                  borderRadius: 8,
                  padding: 8,
                }
          }
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Feather
              name="repeat"
              size={24}
              color={theme == "dark" ? "white" : "#2f2d51"}
            />
            <Text
              style={
                theme == "dark"
                  ? { fontFamily: "Inter-Medium", color: "white" }
                  : { fontFamily: "Inter-Medium", color: "#2f2d51" }
              }
            >
              Repeat
            </Text>
          </View>
          <Switch
            trackColor={{ false: "#767577", true: "#767577" }}
            thumbColor={isRepeat ? "#4eff4e" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isRepeat}
          />
        </View>
        {isRepeat && (
          <View
            style={{
              flexDirection: "row",
              gap: 20,
              marginTop: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => setRepeatOption("daily")}
              style={{
                gap: 10,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={
                  theme == "dark"
                    ? {
                        width: 20,
                        borderWidth: 3,
                        borderColor: "white",
                        height: 20,
                        borderRadius: 100,
                        backgroundColor:
                          repeatOption === "daily" ? "#00cc00" : "#3e3e3e",
                      }
                    : {
                        width: 20,
                        borderWidth: 3,
                        borderColor: "#2f2d51",
                        height: 20,
                        borderRadius: 100,
                        backgroundColor:
                          repeatOption === "daily" ? "#00cc00" : "white",
                      }
                }
              />
              <Text
                style={
                  theme == "dark"
                    ? { color: "white", fontFamily: "Inter-Medium" }
                    : { color: "#2f2d51", fontFamily: "Inter-Medium" }
                }
              >
                Daily
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setRepeatOption("weekly")}
              style={{
                gap: 10,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={
                  theme == "dark"
                    ? {
                        width: 20,
                        borderWidth: 3,
                        borderColor: "white",
                        height: 20,
                        borderRadius: 100,
                        backgroundColor:
                          repeatOption === "weekly" ? "#00cc00" : "#3e3e3e",
                      }
                    : {
                        width: 20,
                        borderWidth: 3,
                        borderColor: "#2f2d51",
                        height: 20,
                        borderRadius: 100,
                        backgroundColor:
                          repeatOption === "weekly" ? "#00cc00" : "white",
                      }
                }
              />
              <Text
                style={
                  theme == "dark"
                    ? { color: "white", fontFamily: "Inter-Medium" }
                    : { color: "#2f2d51", fontFamily: "Inter-Medium" }
                }
              >
                Weekly
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ marginTop: 5, flex: 1 }}>
          <Text
            onPress={() => navigation.navigate("Settings")}
            style={
              theme == "dark"
                ? {
                    color: "#ff3b3b",

                    marginBottom: 5,
                    fontFamily: "Inter-Medium",
                  }
                : {
                    color: "#ff3b3b",
                    marginBottom: 5,

                    fontFamily: "Inter-Medium",
                  }
            }
          >
            Required fields: Title, date and time.
          </Text>
          <Text
            onPress={() => navigation.navigate("Settings")}
            style={
              theme == "dark"
                ? {
                    color: "#d2d2d2",
                    fontSize: 13,
                    fontFamily: "Inter-Regular",
                  }
                : {
                    color: "#2f2d51",
                    fontSize: 13,
                    fontFamily: "Inter-Regular",
                  }
            }
          >
            To receive the reminders, make sure to enable notifications in both
            your phone and Prayse settings{" "}
            <Feather
              name="external-link"
              size={14}
              color={theme == "dark" ? "#d2d2d2" : "#2f2d51"}
            />
            .
          </Text>

          <View style={{ marginTop: "auto", marginBottom: 20, width: "100%" }}>
            <Text
              style={
                theme == "dark"
                  ? {
                      color: "#d2d2d2",
                      fontFamily: "Inter-Regular",
                    }
                  : {
                      color: "#2f2d51",
                      fontFamily: "Inter-Regular",
                    }
              }
            >
              "Continue in prayer, and watch in the same with thanksgiving."
            </Text>
            <Text
              style={
                theme == "dark"
                  ? {
                      color: "white",
                      alignSelf: "flex-end",
                      fontFamily: "Inter-Medium",
                    }
                  : {
                      color: "#2f2d51",
                      alignSelf: "flex-end",
                      fontFamily: "Inter-Medium",
                    }
              }
            >
              - Colossians 4:2
            </Text>
          </View>
        </View>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={hideDatePicker}
        />

        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          onConfirm={handleTimeConfirm}
          onCancel={hideTimePicker}
        />
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  img: {
    width: 25,
    height: 25,
  },
});
