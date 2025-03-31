// src/screens/ServiceProvider/TermsAndConditionsScreen.js
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
  update,
  specificLoadingProcess,
  useSelector,
} from "../../helpers/databaseHelper";

const TermsAndConditionsScreen = ({ navigation }) => {
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
          {/* Title */}
          <Text style={styles.mainTitle}>
            ServiceLink: Digital Hub for Local Service Providers
          </Text>

          {/* 1. Introduction */}
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            Welcome to ServiceLink, a digital platform designed to connect local
            service providers with customers in an efficient and convenient
            manner. By registering and using the platform, service providers
            agree to comply with these Terms and Conditions. These terms govern
            the relationship between ServiceLink and service providers, ensuring
            a seamless and professional service experience for all parties
            involved.
          </Text>

          {/* 2. Registration and Eligibility */}
          <Text style={styles.sectionTitle}>
            2. Registration and Eligibility
          </Text>
          <Text style={styles.paragraph}>
            2.1. Service providers must register with accurate and up-to-date
            information, including business name, contact details, and relevant
            service offerings.{"\n\n"}
            2.2. Only legally registered businesses and independent
            professionals offering services such as cleaning, auto repair,
            plumbing, electrical work, laundry, and related services are
            eligible to join.{"\n\n"}
            2.3. ServiceLink reserves the right to verify the authenticity of
            service providers and may suspend or terminate accounts that provide
            false or misleading information.
          </Text>

          {/* 3. Service Availability and Performance */}
          <Text style={styles.sectionTitle}>
            3. Service Availability and Performance
          </Text>
          <Text style={styles.paragraph}>
            3.1. Service providers must ensure the availability and quality of
            their services as advertised on the platform.{"\n\n"}
            3.2. Cancellations and rescheduling must be communicated promptly to
            customers through the platform.{"\n\n"}
            3.3. Failure to provide satisfactory service may result in account
            suspension or removal from the platform.
          </Text>

          {/* 4. Fees and Commission */}
          <Text style={styles.sectionTitle}>4. Fees and Commission</Text>
          <Text style={styles.paragraph}>
            4.1. ServiceLink charges a 15% commission on each successful
            transaction made through the platform.{"\n\n"}
            4.2. The commission is automatically deducted from the service fee
            before disbursing payments to service providers.{"\n\n"}
            4.3. Service providers agree to the platform's pricing policies and
            acknowledge that any modifications will be communicated in advance.
            {"\n\n"}
            4.4. Additional service fees or surcharges (if any) must be
            transparently disclosed to customers.
          </Text>

          {/* Continue with sections 5-11... */}
          <Text style={styles.sectionTitle}>5. Payment and Settlement</Text>
          <Text style={styles.paragraph}>
            5.1. Payments for services rendered will be processed through the
            ServiceLink platform.{"\n\n"}
            5.2. Payouts will be made to service providers' designated accounts
            on a weekly basis, after deducting the 15% commission.{"\n\n"}
            5.3. Service providers are responsible for ensuring the accuracy of
            their payment details. ServiceLink is not liable for delays caused
            by incorrect banking information.
          </Text>

          <Text style={styles.sectionTitle}>6. Dispute Resolution</Text>
          <Text style={styles.paragraph}>
            6.1. Any disputes between service providers and customers must be
            resolved professionally through the ServiceLink dispute resolution
            system.{"\n\n"}
            6.2. ServiceLink reserves the right to mediate disputes and may
            issue refunds or adjustments if deemed necessary.
          </Text>

          <Text style={styles.sectionTitle}>7. Marketing and Promotions</Text>
          <Text style={styles.paragraph}>
            7.1. ServiceLink may promote service providers on the platform
            through advertisements, featured listings, and social media
            campaigns.{"\n\n"}
            7.2. Service providers consent to the use of their business name,
            logo, and service descriptions for marketing purposes.
          </Text>

          <Text style={styles.sectionTitle}>
            8. Platform Usage and Compliance
          </Text>
          <Text style={styles.paragraph}>
            8.1. Service providers must adhere to all applicable laws and
            regulations governing their industry.{"\n\n"}
            8.2. The platform must not be used for fraudulent or illegal
            activities. Any violation will result in immediate termination of
            the account.
          </Text>

          <Text style={styles.sectionTitle}>
            9. Liability and Indemnification
          </Text>
          <Text style={styles.paragraph}>
            9.1. ServiceLink is a facilitator and is not liable for any damages,
            losses, or disputes arising from services provided by service
            providers.{"\n\n"}
            9.2. Service providers agree to indemnify and hold ServiceLink
            harmless from any claims, damages, or legal actions arising from
            their services.
          </Text>

          <Text style={styles.sectionTitle}>10. Termination of Agreement</Text>
          <Text style={styles.paragraph}>
            10.1. Service providers may terminate their account at any time by
            providing written notice.{"\n\n"}
            10.2. ServiceLink reserves the right to terminate accounts that
            violate these Terms and Conditions or fail to maintain service
            quality.
          </Text>

          <Text style={styles.sectionTitle}>
            11. Amendments and Modifications
          </Text>
          <Text style={styles.paragraph}>
            11.1. ServiceLink may update these Terms and Conditions as
            necessary. Service providers will be notified of any changes before
            they take effect.
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
  },
  lastUpdated: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    marginTop: 20,
  },
  paragraph: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 16,
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
  },
});

export default TermsAndConditionsScreen;
