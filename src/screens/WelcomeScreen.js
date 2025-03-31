import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";
import {
  View,
  Text,
  Image,
  StatusBar,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useAppContext } from "../../AppProvider";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../db/firebase";
import { find, serverTimestamp, update } from "../helpers/databaseHelper";

export default function WelcomeScreen({ navigation }) {
  const {
    setUserId,
    setUserName,
    setUserRole,
    setUserEmail,
    setUserImage,
    setSettings,
  } = useAppContext();

  useEffect(() => {
    let timer;

    const checkIntro = async () => {
      timer = setTimeout(async () => {
        const email = await AsyncStorage.getItem("email");
        if (email) {
          try {
            const password = await AsyncStorage.getItem("password");
            const userCredential = await signInWithEmailAndPassword(
              auth,
              email,
              password
            );

            const userDoc = await find("users", userCredential.user.uid);
            const userData = userDoc.data();

            if (!userData.active) {
              throw "Account not found";
            }

            if (userData.banned) {
              throw "Account has been banned";
            }

            const setSnap = await find("settings", userCredential.user.uid);
            if (setSnap.exists()) setSettings(setSnap.data());

            setUserId(userCredential.user.uid);
            setUserName(userData.name);
            setUserEmail(userData.email);
            setUserRole(userData.role);
            setUserImage(userData.image);

            await update("users", userCredential.user.uid, {
              isOnline: true,
              lastSeen: serverTimestamp(),
            });

            navigation.reset({
              index: 0,
              routes: [
                {
                  name: "Main",
                },
              ],
            });
            return;
          } catch (e) {
            console.log(e);

            AsyncStorage.removeItem("email");
            AsyncStorage.removeItem("password");
          }
        }

        const introShowed = await AsyncStorage.getItem("introShowed");

        if (!introShowed) await AsyncStorage.setItem("introShowed", "true");
        navigation.reset({
          index: 0,
          routes: [{ name: introShowed ? "Login" : "Boarding1" }],
        });
      }, 1000);
    };

    checkIntro();

    return () => {
      clearTimeout(timer); // ✅ Cleanup timeout properly
    };
  }, []);

  return (
    <>
      <StatusBar
        backgroundColor="#FFFFFFF"
        barStyle="light-content"
        translucent={true}
      />
      <View style={styles.container}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.textContainer}>
          <Text style={styles.serviceText}>SERVICE</Text>
          <Text style={styles.linkText}>LINK</Text>
        </View>
      </View>
    </>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 450,
    height: 450,
    marginBottom: height * 0.05,
  },
  textContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  serviceText: {
    fontSize: width * 0.12, 
    fontFamily: "Poppins-Bold", 
    color: "#000000",
    letterSpacing: 2,
    includeFontPadding: false,
    padding: 0,
    marginBottom: -10, 
  },
  linkText: {
    fontSize: width * 0.12, 
    fontFamily: "Poppins-Bold", 
    color: "#FFB800",
    letterSpacing: 2,
    includeFontPadding: false,
    padding: 0,
  },

  fadeContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  scaleContainer: {
    transform: [{ scale: 1 }], 
  },

  slideContainer: {
    transform: [{ translateY: 0 }], 
  },
});
