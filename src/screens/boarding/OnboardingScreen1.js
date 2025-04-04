import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar, // Add this import
  Platform,
  Dimensions,
  StyleSheet,
} from "react-native";

export default function OnboardingScreen1({ navigation }) {
  return (
    <>
      <StatusBar
        barStyle="light-content" // This makes the status bar icons white
        backgroundColor="transparent"
        translucent={true}
      />
      <SafeAreaView
        style={[
          styles.container,
          Platform.OS === "android" && { paddingTop: StatusBar.currentHeight },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.imageContainer}>
            <Image
              source={require("../../../assets/images/boardingscreen.png")}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              Your assistant in{"\n"}
              <Text style={styles.highlightedText}>Servicing</Text>
            </Text>
          </View>
          <View>
            <View style={styles.dotsContainer}>
              <View style={[styles.dot, styles.activeDot]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => navigation.replace("Boarding2")}
            >
              <Text style={styles.nextButtonText}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
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
  imageContainer: {
    width: width * 0.8,
    height: height * 0.4,
    marginTop: 40,
    alignItems: "center", // Center the image horizontally
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    alignItems: "center", // Center text container
    width: "80%",
    marginTop: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: "600",
    color: "#000000",
    lineHeight: 36,
    textAlign: "center", // Center the text
  },
  highlightedText: {
    color: "#FFB800",
    textAlign: "center", // Center the highlighted text
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center", // Center dots horizontally
    marginTop: 30,
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
    width: 20, // Make active dot longer
  },
  nextButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFB800",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
  },
});
