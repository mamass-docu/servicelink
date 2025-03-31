// src/screens/Customer/Dashboard/CustomerProfileScreen.js
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAppContext } from "../../../../AppProvider";
import { useFocusEffect } from "@react-navigation/native";
import { count, loadingProcess, where } from "../../../helpers/databaseHelper";
import ProfileImageScreen from "../../components/ProfileImage";
import { logout } from "../../../db/UpdateUser";

const MenuItem = ({ icon, title, subtitle, onPress, color = "#333" }) => (
  <TouchableOpacity
    style={[styles.menuItem, title === "Logout" && styles.logoutButton]}
    onPress={onPress}
  >
    <View
      style={[
        styles.menuIconContainer,
        title === "Logout" && styles.logoutIcon,
      ]}
    >
      <Icon
        name={icon}
        size={22}
        color={title === "Logout" ? "#FF4444" : "#FFB800"}
      />
    </View>
    <View style={styles.menuTextContainer}>
      <Text
        style={[
          styles.menuText,
          { color: title === "Logout" ? "#FF4444" : color },
        ]}
      >
        {title}
      </Text>
      {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
    </View>
    <Icon
      name="chevron-right"
      size={22}
      color={title === "Logout" ? "#FF4444" : "#CCC"}
    />
  </TouchableOpacity>
);

const CustomerProfileScreen = ({ navigation }) => {
  const { userName, userEmail, userId, userImage, setUserId } = useAppContext();
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [totalCancelled, setTotalCancelled] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadingProcess(async () => {
        const bookingsCount = await count(
          "bookings",
          where("customerId", "==", userId)
        );
        setTotalBookings(bookingsCount);

        const completedCount = await count(
          "bookings",
          where("customerId", "==", userId),
          where("status", "==", "Completed")
        );
        setTotalCompleted(completedCount);

        const snap = await count(
          "bookings",
          where("customerId", "==", userId),
          where("status", "==", "Cancelled")
        );
        setTotalCancelled(snap);
      });
    }, [])
  );

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          loadingProcess(
            async () => {
              await logout(userId, setUserId, true);

              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            },
            (error) => {
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          );
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Simple Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.profileInfo}>
            <View style={styles.imageContainer}>
              <ProfileImageScreen
                image={userImage}
                name={userName}
                style={styles.profileImage}
              />
              <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userEmail}>{userEmail}</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate("EditProfile")}
            >
              <Icon name="pencil" size={20} color="#FFB800" />
            </TouchableOpacity>
          </View>

          <View style={styles.statsContainer}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Transactions", { filter: "All" })
              }
            >
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalBookings}</Text>
                <Text style={styles.statLabel}>Total Bookings</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Transactions", { filter: "Completed" })
              }
            >
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalCompleted}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Transactions", { filter: "Cancelled" })
              }
            >
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalCancelled}</Text>
                <Text style={styles.statLabel}>Cancelled</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <MenuItem
            icon="map-marker"
            title="My Addresses"
            subtitle="Manage your addresses"
            onPress={() => navigation.navigate("Addresses")}
          />
          <MenuItem
            icon="inbox"
            title="Transactions"
            subtitle="Shows all your transactions"
            onPress={() =>
              navigation.navigate("Transactions", { filter: "All" })
            }
          />
          {/* <MenuItem
            icon="credit-card"
            title="Payment Methods"
            subtitle="Connected cards and payments"
            onPress={() => navigation.navigate("PaymentMethods")}
          /> */}
          <Text style={styles.sectionTitle}>Support</Text>
          <MenuItem
            icon="shield-check"
            title="Privacy & Security"
            subtitle="Password, security, personal data"
            onPress={() => navigation.navigate("PrivacyAndSecurity")}
          />
          <MenuItem
            icon="help-circle"
            title="Help & Support"
            subtitle="FAQ, contact us, privacy policy"
            onPress={() => navigation.navigate("HelpAndSupport")}
          />

          <MenuItem
            icon="logout"
            title="Logout"
            subtitle="Sign out from your account"
            onPress={handleLogout}
          />
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  imageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#FFB800",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF9E6",
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 24,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF9E6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: "#666",
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 30,
    backgroundColor: "#FFF5F5",
    borderColor: "#FFE5E5",
  },
  logoutIcon: {
    backgroundColor: "#FFF5F5",
  },
});

export default CustomerProfileScreen;
