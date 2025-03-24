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
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const CustomerTermsScreen = ({ navigation }) => {
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
        <Text style={styles.introText}>
          Welcome to ServiceLink, a digital hub designed to connect users with local service providers efficiently. By accessing or using our platform, you agree to comply with the following terms and conditions. Please read them carefully before using our services.
        </Text>

        {/* Terms Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.sectionText}>
            By registering, accessing, or using ServiceLink, you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions. If you do not agree, please refrain from using the platform.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. User Eligibility</Text>
          <Text style={styles.sectionText}>
            To use ServiceLink, you must be at least 18 years old or have the consent of a parent or guardian. You must also provide accurate and complete information during registration.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. User Responsibilities</Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• You agree to use ServiceLink solely for lawful purposes.</Text>
            <Text style={styles.bulletPoint}>• You shall not engage in fraudulent, misleading, or unethical activities while using the platform.</Text>
            <Text style={styles.bulletPoint}>• You are responsible for maintaining the confidentiality of your account credentials and are liable for all activities under your account.</Text>
            <Text style={styles.bulletPoint}>• You agree not to disrupt, interfere, or attempt unauthorized access to the platform or its systems.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Service Requests and Transactions</Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• ServiceLink acts as an intermediary between users and local service providers. We do not directly provide any services.</Text>
            <Text style={styles.bulletPoint}>• Users can browse, book, and communicate with service providers through the platform.</Text>
            <Text style={styles.bulletPoint}>• Any agreements or transactions made between users and service providers are the sole responsibility of both parties.</Text>
            <Text style={styles.bulletPoint}>• ServiceLink is not liable for any disputes, damages, or dissatisfaction arising from services rendered.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Payments and Fees</Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Some services may require upfront payments, deposits, or service fees.</Text>
            <Text style={styles.bulletPoint}>• ServiceLink is not responsible for handling payments directly; transactions are conducted between the user and the service provider.</Text>
            <Text style={styles.bulletPoint}>• Any refunds, cancellations, or disputes regarding payments must be resolved between the user and the service provider.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. User Reviews and Feedback</Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Users may leave reviews and ratings for service providers based on their experiences.</Text>
            <Text style={styles.bulletPoint}>• Reviews should be honest, constructive, and free from offensive or defamatory content.</Text>
            <Text style={styles.bulletPoint}>• ServiceLink reserves the right to remove or moderate reviews that violate platform policies.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Privacy and Data Protection</Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• ServiceLink collects and processes user data per our Privacy Policy to enhance service accessibility and platform functionality.</Text>
            <Text style={styles.bulletPoint}>• Personal information will not be shared with third parties without user consent, except as required by law.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Prohibited Activities</Text>
          <Text style={styles.sectionText}>Users are prohibited from:</Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Providing false or misleading information.</Text>
            <Text style={styles.bulletPoint}>• Engaging in illegal, abusive, or harmful activities.</Text>
            <Text style={styles.bulletPoint}>• Attempting to hack, disrupt, or manipulate the platform.</Text>
            <Text style={styles.bulletPoint}>• Using the platform to harass, threaten, or defraud others.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• ServiceLink is a digital platform that facilitates connections between users and service providers. We are not responsible for the quality, reliability, or performance of services offered by providers.</Text>
            <Text style={styles.bulletPoint}>• We are not liable for any direct, indirect, incidental, or consequential damages arising from the use of the platform.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Termination of Account</Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• ServiceLink reserves the right to suspend or terminate user accounts at its discretion if users violate these terms.</Text>
            <Text style={styles.bulletPoint}>• Users may also request account deletion by contacting customer support.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Modifications to Terms</Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• ServiceLink reserves the right to modify these Terms and Conditions at any time. Users will be notified of significant changes.</Text>
            <Text style={styles.bulletPoint}>• Continued use of the platform after modifications indicates acceptance of the revised terms.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Governing Law and Dispute Resolution</Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• These Terms and Conditions shall be governed by the laws of [Jurisdiction].</Text>
            <Text style={styles.bulletPoint}>• Any disputes arising from platform use shall first be attempted to be resolved amicably. If unresolved, disputes shall be settled through arbitration or legal action in the applicable jurisdiction.</Text>
          </View>
        </View>

        {/* Acceptance Statement */}
        <View style={styles.acceptanceSection}>
          <Text style={styles.acceptanceText}>
            By using ServiceLink, you acknowledge and agree to abide by these Terms and Conditions.
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
  introText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
    marginBottom: 24,
    textAlign: 'justify',
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
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
    textAlign: 'justify',
  },
  bulletPoints: {
    marginTop: 8,
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
    marginBottom: 8,
    paddingLeft: 8,
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
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default CustomerTermsScreen;