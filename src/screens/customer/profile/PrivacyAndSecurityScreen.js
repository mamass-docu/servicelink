import { Feather } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  find,
  loadingProcess,
  set,
  update,
} from "../../../helpers/databaseHelper";
import { useFocusEffect } from "@react-navigation/native";
import { useAppContext } from "../../../../AppProvider";
import { logout } from "../../../db/UpdateUser";

const PrivacyAndSecurityScreen = ({ navigation }) => {
  const { userId, setUserId, settingsRef, setSettings } = useAppContext();

  const [booking, setBooking] = useState(settingsRef.current.bookings);
  const [message, setMessage] = useState(settingsRef.current.messages);
  const [online, setOnline] = useState(settingsRef.current.showOnlineStatus);
  const [location, setLocation] = useState(settingsRef.current.showLocation);

  // useFocusEffect(
  //   useCallback(() => {
  //     loadingProcess(async () => {
  //       const snap = await find("settings", userId);
  //       if (!snap.exists()) {
  //         await set("settings", userId, {
  //           bookings: true,
  //           messages: true,
  //           showOnlineStatus: true,
  //           showLocation: true,
  //         });
  //         return;
  //       }

  //       const data = snap.data();
  //       setBooking(data.bookings);
  //       setMessage(data.messages);
  //       setLocation(data.showLocation);
  //       setOnline(data.showOnlineStatus);
  //     });
  //   }, [])
  // );

  const SecurityOption = ({ icon, title, subtitle, onPress }) => (
    <TouchableOpacity style={styles.optionCard} onPress={onPress}>
      <View style={styles.optionIconContainer}>
        <Icon name={icon} size={24} color="#FFB800" />
      </View>
      <View style={styles.optionTextContainer}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
      <Icon name="chevron-right" size={24} color="#CCC" />
    </TouchableOpacity>
  );

  const handleChangePassword = () => {
    navigation.navigate("ChangePassword");
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            loadingProcess(async () => {
              await update("users", userId, {
                active: false,
              });
              Alert.alert(
                "Account Deleted",
                "Your account has been successfully deleted."
              );
              await logout(userId, setUserId, true);
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            }),
        },
      ]
    );
  };

  const onUpdate = (key, value) => {
    set("settings", userId, { [key]: value });
    setSettings({ ...settingsRef.current, [key]: value });
  };

  const onUpdateOnline = (value) => {
    set("settings", userId, { showOnlineStatus: value });
    set("users", userId, { showOnlineStatus: value });
    setSettings({ ...settingsRef.current, showOnlineStatus: value });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <SecurityOption
            icon="lock"
            title="Change Password"
            subtitle="Update your password"
            onPress={handleChangePassword}
          />
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingMain}>
                <View
                  style={[styles.settingIcon, { backgroundColor: `#33315` }]}
                >
                  <Feather name={"message-square"} size={20} color={"#333"} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: "#333" }]}>
                    Booking Notifications
                  </Text>
                </View>
              </View>

              <Switch
                value={booking}
                onValueChange={(val) => {
                  setBooking(val);
                  onUpdate("bookings", val);
                }}
                trackColor={{ false: "#E5E5E5", true: "#FFB80050" }}
                thumbColor={"#FFB800"}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingMain}>
                <View
                  style={[styles.settingIcon, { backgroundColor: `#33315` }]}
                >
                  <Feather name={"message-square"} size={20} color={"#333"} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: "#333" }]}>
                    Message Notifications
                  </Text>
                </View>
              </View>

              <Switch
                value={message}
                onValueChange={(val) => {
                  setMessage(val);
                  onUpdate("messages", val);
                }}
                trackColor={{ false: "#E5E5E5", true: "#FFB80050" }}
                thumbColor={"#FFB800"}
              />
            </View>
          </View>
        </View>

        {/* Privacy & Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingMain}>
                <View
                  style={[styles.settingIcon, { backgroundColor: `#33315` }]}
                >
                  <Feather name={"eye"} size={20} color={"#333"} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: "#333" }]}>
                    Show Online Status
                  </Text>
                </View>
              </View>

              <Switch
                value={online}
                onValueChange={(val) => {
                  setOnline(val);
                  onUpdateOnline(val);
                }}
                trackColor={{ false: "#E5E5E5", true: "#FFB80050" }}
                thumbColor={"#FFB800"}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingMain}>
                <View
                  style={[styles.settingIcon, { backgroundColor: `#33315` }]}
                >
                  <Feather name={"map-pin"} size={20} color={"#333"} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: "#333" }]}>
                    Share Location
                  </Text>
                </View>
              </View>

              <Switch
                value={location}
                onValueChange={(val) => {
                  setLocation(val);
                  onUpdate("showLocation", val);
                }}
                trackColor={{ false: "#E5E5E5", true: "#FFB80050" }}
                thumbColor={"#FFB800"}
              />
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity
            style={styles.deleteAccountButton}
            onPress={handleDeleteAccount}
          >
            <Icon name="delete" size={24} color="#FF4444" />
            <Text style={styles.deleteAccountText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF9E6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  deleteAccountButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  deleteAccountText: {
    fontSize: 16,
    color: "#FF4444",
    marginLeft: 12,
    fontWeight: "500",
  },
  section: {
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  sectionContent: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F5F5F5",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  settingMain: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  settingDescription: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
});

export default PrivacyAndSecurityScreen;
