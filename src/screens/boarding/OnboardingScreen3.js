// src/screens/OnboardingScreen3/OnboardingScreen3.js
import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Dimensions,
} from "react-native";

export default function OnboardingScreen3({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.serviceText}>
            Service
            <Text style={styles.linkText}>Link</Text>
          </Text>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={require("../../../assets/images/boarding3.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.bottomContainer}>
          <Text style={styles.subtitle}>
            Digital Hub for{"\n"}
            Local <Text style={styles.highlightedText}>Service</Text> Provider
          </Text>

          <View style={styles.dotsContainer}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={[styles.dot, styles.activeDot]} />
          </View>

          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() =>
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: "Login",
                  },
                ],
              })
            }
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 40,
  },
  titleContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  serviceText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
  },
  linkText: {
    color: "#FFB800",
  },
  imageContainer: {
    width: width * 0.8,
    height: height * 0.4,
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  bottomContainer: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 30,
  },
  highlightedText: {
    color: "#FFB800",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#FFB800",
    width: 20,
  },
  getStartedButton: {
    backgroundColor: "#FFB800",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: "80%",
    alignItems: "center",
  },
  getStartedText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
