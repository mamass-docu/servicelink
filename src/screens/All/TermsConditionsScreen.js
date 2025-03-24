import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const TermsConditionsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            Welcome to ServiceLink, a digital platform designed to connect local service providers with customers in an efficient and convenient manner. By registering and using the platform, service providers agree to comply with these Terms and Conditions. These terms govern the relationship between ServiceLink and service providers, ensuring a seamless and professional service experience for all parties involved.
          </Text>
        </View>

        {/* Registration and Eligibility */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Registration and Eligibility</Text>
          <Text style={styles.subPoint}>
            2.1. Service providers must register with accurate and up-to-date information, including business name, contact details, and relevant service offerings.
          </Text>
          <Text style={styles.subPoint}>
            2.2. Only legally registered businesses and independent professionals offering services such as cleaning, auto repair, plumbing, electrical work, laundry, and related services are eligible to join.
          </Text>
          <Text style={styles.subPoint}>
            2.3. ServiceLink reserves the right to verify the authenticity of service providers and may suspend or terminate accounts that provide false or misleading information.
          </Text>
        </View>

        {/* Service Availability and Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Service Availability and Performance</Text>
          <Text style={styles.subPoint}>
            3.1. Service providers must ensure the availability and quality of their services as advertised on the platform.
          </Text>
          <Text style={styles.subPoint}>
            3.2. Cancellations and rescheduling must be communicated promptly to customers through the platform.
          </Text>
          <Text style={styles.subPoint}>
            3.3. Failure to provide satisfactory service may result in account suspension or removal from the platform.
          </Text>
        </View>

        {/* Fees and Commission */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Fees and Commission</Text>
          <Text style={styles.subPoint}>
            4.1. ServiceLink charges a 15% commission on each successful transaction made through the platform.
          </Text>
          <Text style={styles.subPoint}>
            4.2. The commission is automatically deducted from the service fee before disbursing payments to service providers.
          </Text>
          <Text style={styles.subPoint}>
            4.3. Service providers agree to the platform's pricing policies and acknowledge that any modifications will be communicated in advance.
          </Text>
          <Text style={styles.subPoint}>
            4.4. Additional service fees or surcharges (if any) must be transparently disclosed to customers.
          </Text>
        </View>

        {/* Payment and Settlement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Payment and Settlement</Text>
          <Text style={styles.subPoint}>
            5.1. Payments for services rendered will be processed through the ServiceLink platform.
          </Text>
          <Text style={styles.subPoint}>
            5.2. Payouts will be made to service providers' designated accounts on a weekly basis, after deducting the 15% commission.
          </Text>
          <Text style={styles.subPoint}>
            5.3. Service providers are responsible for ensuring the accuracy of their payment details. ServiceLink is not liable for delays caused by incorrect banking information.
          </Text>
        </View>

        {/* Dispute Resolution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Dispute Resolution</Text>
          <Text style={styles.subPoint}>
            6.1. Any disputes between service providers and customers must be resolved professionally through the ServiceLink dispute resolution system.
          </Text>
          <Text style={styles.subPoint}>
            6.2. ServiceLink reserves the right to mediate disputes and may issue refunds or adjustments if deemed necessary.
          </Text>
        </View>

        {/* Marketing and Promotions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Marketing and Promotions</Text>
          <Text style={styles.subPoint}>
            7.1. ServiceLink may promote service providers on the platform through advertisements, featured listings, and social media campaigns.
          </Text>
          <Text style={styles.subPoint}>
            7.2. Service providers consent to the use of their business name, logo, and service descriptions for marketing purposes.
          </Text>
        </View>

        {/* Platform Usage and Compliance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Platform Usage and Compliance</Text>
          <Text style={styles.subPoint}>
            8.1. Service providers must adhere to all applicable laws and regulations governing their industry.
          </Text>
          <Text style={styles.subPoint}>
            8.2. The platform must not be used for fraudulent or illegal activities. Any violation will result in immediate termination of the account.
          </Text>
        </View>

        {/* Liability and Indemnification */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Liability and Indemnification</Text>
          <Text style={styles.subPoint}>
            9.1. ServiceLink is a facilitator and is not liable for any damages, losses, or disputes arising from services provided by service providers.
          </Text>
          <Text style={styles.subPoint}>
            9.2. Service providers agree to indemnify and hold ServiceLink harmless from any claims, damages, or legal actions arising from their services.
          </Text>
        </View>

        {/* Termination of Agreement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Termination of Agreement</Text>
          <Text style={styles.subPoint}>
            10.1. Service providers may terminate their account at any time by providing written notice.
          </Text>
          <Text style={styles.subPoint}>
            10.2. ServiceLink reserves the right to terminate accounts that violate these Terms and Conditions or fail to maintain service quality.
          </Text>
        </View>

        {/* Amendments and Modifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Amendments and Modifications</Text>
          <Text style={styles.subPoint}>
            11.1. ServiceLink may update these Terms and Conditions as necessary. Service providers will be notified of any changes before they take effect.
          </Text>
        </View>

        {/* Acceptance Statement */}
        <View style={styles.acceptanceSection}>
          <Text style={styles.acceptanceText}>
            By registering as a service provider on ServiceLink, you acknowledge that you have read, understood, and agreed to abide by these Terms and Conditions.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        paddingTop: 44,
      },
      android: {
        paddingTop: StatusBar.currentHeight,
      },
    }),
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
    textAlign: 'justify',
  },
  subPoint: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
    marginBottom: 8,
    paddingLeft: 16,
    textAlign: 'justify',
  },
  acceptanceSection: {
    marginTop: 24,
    marginBottom: 32,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  acceptanceText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default TermsConditionsScreen;
