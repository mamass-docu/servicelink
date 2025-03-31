// src/screens/Customer/CustomerTermsAndConditionsScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppContext } from "../../../AppProvider";
import {
  specificLoadingProcess,
  update,
  useSelector,
} from "../../helpers/databaseHelper";

const CustomerTermsAndConditionsScreen = ({ navigation }) => {
  const [isAccepted, setIsAccepted] = useState(false);
  const { userId } = useAppContext();

  const isLoading = useSelector((state) => state.loading.specific);

  const handleAcceptTerms = () => {
    if (!isAccepted) return;

    specificLoadingProcess(
      async () => {
        await update("users", userId, {
          hasAcceptedTerms: true,
        });

        navigation.reset({
          index: 0,
          routes: [{ name: "Main" }],
        });
      },
      (error) => {
        Alert.alert(
          "Error",
          "Failed to save your acceptance. Please try again."
        );
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.lastUpdated}>Last Updated: February 2025</Text>

        <View style={styles.contentContainer}>
          {/* Introduction */}
          <Text style={styles.paragraph}>
            Welcome to ServiceLink, a digital hub designed to connect users with
            local service providers efficiently. By accessing or using our
            platform, you agree to comply with the following terms and
            conditions. Please read them carefully before using our services.
          </Text>

          {/* 1. Acceptance of Terms */}
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By registering, accessing, or using ServiceLink, you acknowledge
            that you have read, understood, and agreed to be bound by these
            Terms and Conditions. If you do not agree, please refrain from using
            the platform.
          </Text>

          {/* 2. User Eligibility */}
          <Text style={styles.sectionTitle}>2. User Eligibility</Text>
          <Text style={styles.paragraph}>
            To use ServiceLink, you must be at least 18 years old or have the
            consent of a parent or guardian. You must also provide accurate and
            complete information during registration.
          </Text>

          {/* 3. User Responsibilities */}
          <Text style={styles.sectionTitle}>3. User Responsibilities</Text>
          <Text style={styles.paragraph}>
            • You agree to use ServiceLink solely for lawful purposes.{"\n"}•
            You shall not engage in fraudulent, misleading, or unethical
            activities while using the platform.{"\n"}• You are responsible for
            maintaining the confidentiality of your account credentials and are
            liable for all activities under your account.{"\n"}• You agree not
            to disrupt, interfere, or attempt unauthorized access to the
            platform or its systems.
          </Text>

          {/* 4. Service Requests and Transactions */}
          <Text style={styles.sectionTitle}>
            4. Service Requests and Transactions
          </Text>
          <Text style={styles.paragraph}>
            • ServiceLink acts as an intermediary between users and local
            service providers. We do not directly provide any services.{"\n"}•
            Users can browse, book, and communicate with service providers
            through the platform.{"\n"}• Any agreements or transactions made
            between users and service providers are the sole responsibility of
            both parties.{"\n"}• ServiceLink is not liable for any disputes,
            damages, or dissatisfaction arising from services rendered.
          </Text>

          {/* 5. Payments and Fees */}
          <Text style={styles.sectionTitle}>5. Payments and Fees</Text>
          <Text style={styles.paragraph}>
            • Some services may require upfront payments, deposits, or service
            fees.{"\n"}• ServiceLink is not responsible for handling payments
            directly; transactions are conducted between the user and the
            service provider.{"\n"}• Any refunds, cancellations, or disputes
            regarding payments must be resolved between the user and the service
            provider.
          </Text>

          {/* 6. User Reviews and Feedback */}
          <Text style={styles.sectionTitle}>6. User Reviews and Feedback</Text>
          <Text style={styles.paragraph}>
            • Users may leave reviews and ratings for service providers based on
            their experiences.{"\n"}• Reviews should be honest, constructive,
            and free from offensive or defamatory content.{"\n"}• ServiceLink
            reserves the right to remove or moderate reviews that violate
            platform policies.
          </Text>

          {/* 7. Privacy and Data Protection */}
          <Text style={styles.sectionTitle}>
            7. Privacy and Data Protection
          </Text>
          <Text style={styles.paragraph}>
            • ServiceLink collects and processes user data per our Privacy
            Policy to enhance service accessibility and platform functionality.
            {"\n"}• Personal information will not be shared with third parties
            without user consent, except as required by law.
          </Text>

          {/* 8. Prohibited Activities */}
          <Text style={styles.sectionTitle}>8. Prohibited Activities</Text>
          <Text style={styles.paragraph}>
            Users are prohibited from:{"\n"}• Providing false or misleading
            information.{"\n"}• Engaging in illegal, abusive, or harmful
            activities.{"\n"}• Attempting to hack, disrupt, or manipulate the
            platform.{"\n"}• Using the platform to harass, threaten, or defraud
            others.
          </Text>

          {/* 9. Limitation of Liability */}
          <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            • ServiceLink is a digital platform that facilitates connections
            between users and service providers. We are not responsible for the
            quality, reliability, or performance of services offered by
            providers.{"\n"}• We are not liable for any direct, indirect,
            incidental, or consequential damages arising from the use of the
            platform.
          </Text>

          {/* 10. Termination of Account */}
          <Text style={styles.sectionTitle}>10. Termination of Account</Text>
          <Text style={styles.paragraph}>
            • ServiceLink reserves the right to suspend or terminate user
            accounts at its discretion if users violate these terms.{"\n"}•
            Users may also request account deletion by contacting customer
            support.
          </Text>

          {/* 11. Modifications to Terms */}
          <Text style={styles.sectionTitle}>11. Modifications to Terms</Text>
          <Text style={styles.paragraph}>
            • ServiceLink reserves the right to modify these Terms and
            Conditions at any time. Users will be notified of significant
            changes.{"\n"}• Continued use of the platform after modifications
            indicates acceptance of the revised terms.
          </Text>

          {/* 12. Governing Law and Dispute Resolution */}
          <Text style={styles.sectionTitle}>
            12. Governing Law and Dispute Resolution
          </Text>
          <Text style={styles.paragraph}>
            • These Terms and Conditions shall be governed by the laws of
            [Jurisdiction].{"\n"}• Any disputes arising from platform use shall
            first be attempted to be resolved amicably. If unresolved, disputes
            shall be settled through arbitration or legal action in the
            applicable jurisdiction.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setIsAccepted(!isAccepted)}
        >
          <View style={[styles.checkbox, isAccepted && styles.checkboxChecked]}>
            {isAccepted && <Feather name="check" size={16} color="#FFF" />}
          </View>
          <Text style={styles.checkboxLabel}>
            I have read and agree to the Terms & Conditions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.acceptButton,
            !isAccepted && styles.acceptButtonDisabled,
          ]}
          onPress={handleAcceptTerms}
          disabled={!isAccepted || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.acceptButtonText}>Accept & Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    fontFamily: "Poppins-SemiBold",
  },
  scrollView: {
    flex: 1,
  },
  lastUpdated: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
    fontFamily: "Poppins-Regular",
  },
  contentContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    marginTop: 20,
    fontFamily: "Poppins-SemiBold",
  },
  paragraph: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 16,
    fontFamily: "Poppins-Regular",
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFB800",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#FFB800",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    fontFamily: "Poppins-Regular",
  },
  acceptButton: {
    backgroundColor: "#FFB800",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  acceptButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  acceptButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
});

export default CustomerTermsAndConditionsScreen;
