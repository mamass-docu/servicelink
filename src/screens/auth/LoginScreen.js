import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { auth } from "../../db/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAppContext } from "../../../AppProvider";
import {
  find,
  update,
  serverTimestamp,
  specificLoadingProcess,
  useSelector,
} from "../../helpers/databaseHelper";
const { width, height } = Dimensions.get("window");
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const {
    setUserId,
    setUserName,
    setUserRole,
    setUserEmail,
    setUserImage,
    setSettings,
  } = useAppContext();

  const isLoading = useSelector((state) => state.loading.specific);

  // const {
  //   data,
  //   isLoading: loadn,
  //   refetch,
  // } = useFind({
  //   path: "users",
  //   fetchOnFocus: false,
  // });

  const handleLogin = async () => {
    if (isLoading) return;

    if (!formData.email || !formData.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    specificLoadingProcess(
      async () => {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        const userDoc = await find("users", userCredential.user.uid);

        if (!userDoc.exists()) {
          await auth.signOut();
          Alert.alert("Error", "Account not found!!!");
          return;
        }

        const userData = userDoc.data();

        // Check account status
        if (!userData.active) {
          await auth.signOut();
          Alert.alert("Error", "Account not found!!!");
          return;
        }

        if (userData.banned) {
          await auth.signOut();
          Alert.alert("Error", "Your account has been banned!!!");
          return;
        }

        // Verify user type
        if (userData.role == "Admin") {
          await auth.signOut();
          Alert.alert("Error", "Invalid account type!!!");
          return;
        }

        const settSnap = await find("settings", userCredential.user.uid);
        setSettings(
          settSnap.exists()
            ? settSnap.data()
            : {
                bookings: true,
                messages: true,
                showOnlineStatus: true,
                showLocation: true,
              }
        );

        setUserId(userCredential.user.uid);
        setUserName(userData.name);
        setUserEmail(userData.email);
        setUserRole(userData.role);
        setUserImage(userData.image);

        AsyncStorage.setItem("email", userData.email);
        AsyncStorage.setItem("password", formData.password);

        await update("users", userCredential.user.uid, {
          isOnline: true,
          lastSeen: serverTimestamp(),
        });

        navigation.reset({
          index: 0,
          routes: [
            {
              name: userData.hasAcceptedTerms ? "Main" : "TermsAndConditions",
            },
          ],
        });
      },
      (error) => {
        console.error("Login error:", error);

        let errorMessage = "An error occurred during login";

        switch (error.code) {
          case "auth/invalid-email":
            errorMessage = "Invalid email address";
            break;
          case "auth/user-not-found":
            errorMessage = "No account found with this email";
            break;
          case "auth/wrong-password":
            errorMessage = "Incorrect password";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many failed attempts. Please try again later";
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
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
        translucent={false}
        hidden={false}
      />
      {/* Main Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* Logo or Icon */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../assets/images/login.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          {/* Form Section */}
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
                  value={formData.email}
                  onChangeText={(text) =>
                    setFormData({ ...formData, email: text })
                  }
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <Feather name="lock" size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(text) =>
                    setFormData({ ...formData, password: text })
                  }
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Feather
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.forgotButton}
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            <Text style={styles.noAccountText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Role")}>
              <Text style={styles.signupText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    height: 60,
    justifyContent: "center",
    paddingHorizontal: 16,
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
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: height * 0.25, // 25% of screen height
    marginBottom: 20,
  },
  logo: {
    width: width * 0.6, // 60% of screen width
    height: width * 0.6, // Keep aspect ratio square
  },
  titleSection: {
    marginBottom: height * 0.03,
  },
  mainTitle: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#666666",
  },
  formSection: {
    width: "100%",
  },
  inputWrapper: {
    marginBottom: 5,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    color: "#1A1A1A",
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginTop: 4,
    marginBottom: 10,
  },
  forgotText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#FFB800",
  },
  loginButton: {
    height: 56,
    backgroundColor: "#FFB800",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FFB800",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#FFFFFF",
  },
  bottomSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  noAccountText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666666",
  },
  signupText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#FFB800",
  },
});
