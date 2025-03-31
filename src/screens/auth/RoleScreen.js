// src/screens/OnboardingScreen/RoleScreen.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  StyleSheet,
  StatusBar,
  Dimensions
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function RoleScreen({ navigation }) {
  const navigate = (role) => {
    navigation.navigate("SignUp", { role: role });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFB800" barStyle="dark-content" translucent={false} hidden={false} />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Welcome to ServiceLink</Text>
          <Text style={styles.subtitle}>Select a role</Text>
        </View>

        <View style={styles.rolesContainer}>
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => navigate("Provider")}
          >
            <Image
              source={require("../../../assets/images/serviceprovider.png")}
              style={styles.roleIcon}
              resizeMode="contain"
            />
            <Text style={styles.roleTitle}>Service Provider</Text>
            <Text style={styles.roleDescription}>
              Ready to be recognized for your service capabilities and connect
              with customers?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => navigate("Customer")}
          >
            <Image
              source={require("../../../assets/images/customer.png")}
              style={styles.roleIcon}
              resizeMode="contain"
            />
            <Text style={styles.roleTitle}>User</Text>
            <Text style={styles.roleDescription}>
              Looking for reliable service providers for your needs?
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFB800",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  content: {
    flex: 1,
    alignItems: "center", // Center the content horizontally
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 28,
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Poppins-Medium",
    fontSize: 18,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  rolesContainer: {
    width: "85%", // Reduced from 100%
    alignItems: "center",
    gap: 20,
  },
  roleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    width: width * 0.75, // Reduced width (75% of screen width)
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 15,
  },
  roleIcon: {
    width: 50, // Slightly reduced icon size
    height: 50,
    marginBottom: 15,
  },
  roleTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#000000",
    marginBottom: 8,
  },
  roleDescription: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    color: "#666666",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 10,
  },
});
