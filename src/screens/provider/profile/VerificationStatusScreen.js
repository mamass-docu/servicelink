import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
  Modal,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppContext } from "../../../../AppProvider";
import LottieView from "lottie-react-native";
import {
  add,
  find,
  loadingProcess,
  serverTimestamp,
  set,
  updateAllAsSeen,
} from "../../../helpers/databaseHelper";
import { useFocusEffect } from "@react-navigation/native";

const SuccessAnimation = ({ visible, onClose }) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <LottieView
            source={require("../../../../assets/animations/animation.json")}
            autoPlay
            loop={false}
            style={styles.animation}
            onAnimationFinish={onClose}
            speed={0.7}
          />
          <Text style={styles.modalTitle}>Submitted Successfully!</Text>
          <Text style={styles.modalMessage}>
            Your business application has been submitted for review. We will
            notify you once the verification is complete.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const StepCard = ({ step, onPress, isLast }) => {
  const getStatusColor = () => {
    switch (step.status) {
      case "completed":
        return "#4CAF50";
      case "current":
        return "#FFB800";
      default:
        return "#E0E0E0";
    }
  };

  const getStatusIcon = () => {
    switch (step.status) {
      case "completed":
        return "check-circle";
      case "current":
        return step.icon;
      default:
        return "lock";
    }
  };

  return (
    <View style={[styles.stepCard, isLast && styles.lastStepCard]}>
      <View style={styles.stepHeader}>
        <View style={[styles.stepBadge, { backgroundColor: getStatusColor() }]}>
          <Feather name={getStatusIcon()} size={20} color="#FFFFFF" />
        </View>
        <View style={styles.stepInfo}>
          <Text style={styles.stepNumber}>Step {step.step}</Text>
          <Text style={styles.stepTitle}>{step.title}</Text>
        </View>
        {(step.status === "completed" || step.status === "current") && (
          <TouchableOpacity
            style={styles.stepAction}
            onPress={() => onPress(step)}
          >
            <Feather
              name={step.status === "completed" ? "edit-2" : "arrow-right"}
              size={20}
              color="#FFB800"
            />
          </TouchableOpacity>
        )}
      </View>
      {step.description && (
        <Text style={styles.stepDescription}>{step.description}</Text>
      )}
    </View>
  );
};

const VerificationStatusScreen = ({ navigation }) => {
  const { userId } = useAppContext();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [percentage, setPercentage] = useState(25);

  const [steps, setSteps] = useState([]);

  const setStepsData = (a, b, c, d) => {
    setSteps([
      {
        step: 1,
        title: "Business Profile Registration",
        description: "Basic business information setup",
        status: "completed",
        icon: "check-circle",
      },
      {
        step: 2,
        title: "Add Business Services",
        description: "Select the services your business provides.",
        status: a ? "completed" : "current",
        icon: "plus-circle",
      },
      {
        step: 3,
        title: "Business Documents",
        description: "Upload all required business documents and permits.",
        status: b ? "completed" : "current",
        icon: "upload",
      },
      {
        step: 4,
        title: "Business Hours",
        description: "Set your business operating hours and availability.",
        status: c ? "completed" : "current",
        icon: "clock",
      },
      {
        step: 5,
        title: "Business Verification",
        description: "Final review and verification of your business details.",
        status: d ? "completed" : "current",
        icon: "shield",
      },
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      loadingProcess(async () => {
        updateAllAsSeen(userId, "VerificationStatus");
        const verSnap = await find("toVerifyProviders", userId);
        if (verSnap.exists()) {
          setStepsData(true, true, true, verSnap.data().status == "Approved");
          setIsSubmitted(true);
          setPercentage(100);
          return;
        }

        let percent = 25;
        const userSnap = await find("users", userId);
        const userData = userSnap.data();

        if (userData.verified) {
          setPercentage(100);
          setStepsData(true, true, true, true);
          return;
        }
        if (userData.service) percent += 25;

        const docSnap = await find("providerDocuments", userId);
        if (docSnap.exists()) percent += 25;

        const busHoursSnap = await find("providerBusinessHours", userId);
        if (busHoursSnap.exists()) percent += 25;

        setStepsData(
          userData.service,
          docSnap.exists(),
          busHoursSnap.exists(),
          false
        );
        setPercentage(percent);
      });
    }, [])
  );

  const handleStepPress = (step) => {
    if (step.status === "current" && step.step === 5) {
      Alert.alert(
        "Under Review",
        "Your business application is currently under review. Our team will verify your documents and contact you soon.",
        [{ text: "OK" }]
      );
      return;
    }

    switch (step.step) {
      case 1:
        navigation.navigate("EditProfile");
        break;
      case 2:
        navigation.navigate("AddServices");
        break;
      case 3:
        navigation.navigate("BusinessDocuments");
        break;
      case 4:
        navigation.navigate("BusinessHours");
        break;
      default:
        break;
    }
  };

  const handleCheckStatus = () => {
    if (isSubmitted) return;

    if (percentage != 100) {
      alert("Please complete the verification status first!");
      return;
    }

    loadingProcess(async () => {
      const snap = await find("users", userId);
      const userData = snap.data();
      await set("toVerifyProviders", userId, {
        name: userData.name,
        service: userData.service,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        // name: userData.name,
        status: "Pending",
        sentAt: serverTimestamp(),
      });
      setShowSuccess(true);
      setIsSubmitted(true);

      setTimeout(() => {
        setShowSuccess(false);
        navigation.reset({
          index: 0,
          routes: [{ name: "Main" }],
        });
      }, 5000);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      <SuccessAnimation
        visible={showSuccess}
        onClose={() => setShowSuccess(false)}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification Status</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: percentage + "%" }]} />
        </View>
        <Text style={styles.progressText}>{percentage}% Complete</Text>
      </View>

      {/* Steps List */}
      <ScrollView style={styles.content}>
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <StepCard
              key={step.step}
              step={step}
              onPress={(step) => handleStepPress(step)}
              isLast={index === steps.length - 1}
            />
          ))}
        </View>
      </ScrollView>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.checkStatusButton, isSubmitted && styles.disabledButton]}
        onPress={handleCheckStatus}
        disabled={isSubmitted}
      >
        <Text style={styles.checkStatusButtonText}>
          {isSubmitted ? "SUBMITTED" : "SUBMIT"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 16 : 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF2",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: Dimensions.get("window").width - 80,
    alignItems: "center",
  },
  animation: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 8,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
    marginRight: 40,
  },
  headerRight: {
    width: 40,
  },
  progressContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF2",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E8ECF2",
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "right",
  },
  content: {
    flex: 1,
  },
  stepsContainer: {
    padding: 16,
  },
  stepCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  lastStepCard: {
    marginBottom: 0,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepInfo: {
    flex: 1,
  },
  stepNumber: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  stepAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF9E6",
    justifyContent: "center",
    alignItems: "center",
  },
  stepDescription: {
    fontSize: 14,
    color: "#666666",
    marginTop: 12,
    lineHeight: 20,
  },
  checkStatusButton: {
    backgroundColor: "#FFB800",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#FFB800",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
    elevation: 0,
    shadowOpacity: 0,
  },
  checkStatusButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default VerificationStatusScreen;
