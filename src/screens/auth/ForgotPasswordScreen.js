import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
  StyleSheet,
} from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { auth } from "../../db/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import {
  get,
  where,
  specificLoadingProcess,
  useSelector,
} from "../../helpers/databaseHelper";

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState("");
  const isLoading = useSelector((state) => state.loading.specific);

  const validateEmail = async (email) => {
    try {
      const querySnapshot = await get(
        "users",
        where("email", "==", email.toLowerCase())
      );
      // const querySnapshot = await getDocs(
      //   query(
      //     collection(db, "users"),
      //     where("email", "==", email.toLowerCase())
      //   )
      // );
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error validating email:", error);
      return false;
    }
  };

  const handleResetPassword = () => {
    if (email.trim() == "") {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    specificLoadingProcess(
      async () => {
        const isValidUser = await validateEmail(email);

        if (!isValidUser) {
          Alert.alert("Error", "No account found with this email");
          return;
        }

        await sendPasswordResetEmail(auth, email);
        Alert.alert(
          "Success",
          "Password reset email has been sent. Please check your inbox.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      },
      (error) => {
        let errorMessage = "Failed to send reset email";

        switch (error.code) {
          case "auth/invalid-email":
            errorMessage = "Invalid email address";
            break;
          case "auth/user-not-found":
            errorMessage = "No account found with this email";
            break;
          default:
            errorMessage = error.message;
        }

        Alert.alert("Error", errorMessage);
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Select your account type and enter your email address to reset your
            password
          </Text>
        </View>

        {/* <View style={styles.roleSection}>
          <Text style={styles.roleTitle}>Account Type</Text>
          <View style={styles.roleButtons}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                selectedRole === "provider" && styles.roleButtonSelected,
              ]}
              onPress={() => handleRoleSelection("provider")}
            >
              <Image
                source={require("../../../assets/images/serviceprovider.png")}
                style={styles.roleIcon}
              />
              <Text
                style={[
                  styles.roleText,
                  selectedRole === "provider" && styles.roleTextSelected,
                ]}
              >
                Service Provider
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleButton,
                selectedRole === "customer" && styles.roleButtonSelected,
              ]}
              onPress={() => handleRoleSelection("customer")}
            >
              <Image
                source={require("../../../assets/images/customer.png")}
                style={styles.roleIcon}
              />
              <Text
                style={[
                  styles.roleText,
                  selectedRole === "customer" && styles.roleTextSelected,
                ]}
              >
                Customer
              </Text>
            </TouchableOpacity>
          </View>
        </View> */}

        <View style={styles.formSection}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <Feather name="mail" size={20} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.resetButton, !email && styles.resetButtonDisabled]}
            onPress={handleResetPassword}
            disabled={isLoading || !email}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.resetButtonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.backToLoginButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  titleSection: {
    marginTop: 20,
    marginBottom: 32,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    lineHeight: 24,
  },
  roleSection: {
    marginBottom: 32,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  roleButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  roleButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  roleButtonSelected: {
    borderColor: "#FFB800",
    backgroundColor: "#FFF9E6",
  },
  roleIcon: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  roleText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
    textAlign: "center",
  },
  roleTextSelected: {
    color: "#1A1A1A",
  },
  formSection: {
    gap: 24,
  },
  inputWrapper: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#1A1A1A",
  },
  resetButton: {
    backgroundColor: "#FFB800",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  resetButtonDisabled: {
    backgroundColor: "#F5F5F5",
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSection: {
    marginTop: 24,
    alignItems: "center",
  },
  backToLoginButton: {
    paddingVertical: 12,
  },
  backToLoginText: {
    color: "#666666",
    fontSize: 16,
    fontWeight: "500",
  },
});
