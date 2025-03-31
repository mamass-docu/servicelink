// src/screens/ServiceProvider/ProviderSettings.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { find, loadingProcess, set } from "../../../helpers/databaseHelper";
import { useAppContext } from "../../../../AppProvider";

const ProviderSettings = ({ navigation }) => {
  const { userId, settingsRef, setSettings } = useAppContext();

  const [booking, setBooking] = useState(settingsRef.current.bookings);
  const [message, setMessage] = useState(settingsRef.current.messages);
  const [online, setOnline] = useState(settingsRef.current.showOnlineStatus);
  const [location, setLocation] = useState(settingsRef.current.showLocation);

  // useEffect(() => {
  //   loadingProcess(async () => {
  //     const snap = await find("settings", userId);
  //     if (!snap.exists()) {
  //       await set("settings", userId, {
  //         bookings: true,
  //         messages: true,
  //         showOnlineStatus: true,
  //         showLocation: true,
  //       });
  //       return;
  //     }

  //     const data = snap.data();
  //     setBooking(data.bookings);
  //     setMessage(data.messages);
  //     setLocation(data.showLocation);
  //     setOnline(data.showOnlineStatus);
  //   });
  // }, []);

  const onUpdate = (key, value) => {
    set("settings", userId, { [key]: value });
    setSettings({ ...settingsRef.current, [key]: value });
  };

  const onUpdateOnline = (value) => {
    set("settings", userId, { showOnlineStatus: value });
    set("users", userId, { showOnlineStatus: value });
    setSettings({ ...settingsRef.current, showOnlineStatus: value });
  };

  const SettingItem = ({
    icon,
    title,
    onPress,
    description,
    color = "#333",
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingMain}>
        <View style={[styles.settingIcon, { backgroundColor: `${color}15` }]}>
          <Feather name={icon} size={20} color={color} />
        </View>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, { color }]}>{title}</Text>
          {description && (
            <Text style={styles.settingDescription}>{description}</Text>
          )}
        </View>
      </View>
      <Feather name="chevron-right" size={20} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="lock"
              title="Change Password"
              type="navigation"
              onPress={() => navigation.navigate("ChangePassword")}
            />
          </View>
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

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="help-circle"
              title="Help Center"
              type="navigation"
              onPress={() => navigation.navigate("HelpAndSupport")}
            />
            <SettingItem
              icon="file-text"
              title="Terms of Service"
              type="navigation"
              onPress={() => navigation.navigate("TermsConditions")}
            />
          </View>
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
    borderBottomColor: "#F5F5F5",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    flex: 1,
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

export default ProviderSettings;
