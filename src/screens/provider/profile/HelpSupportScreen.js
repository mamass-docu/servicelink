// src/screens/ServiceProvider/HelpSupportScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const HelpSupportScreen = ({ navigation }) => {
  const supportSections = [
    {
      title: "Quick Help",
      items: [
        {
          id: "bookings",
          title: "Booking Issues",
          icon: "calendar",
          onPress: () => navigation.navigate("BookingHelpScreen"),
        },
        {
          id: "payments",
          title: "Payment Concerns",
          icon: "credit-card",
          onPress: () => navigation.navigate("BookingHelpScreen"),
        },
        {
          id: "account",
          title: "Account Settings",
          icon: "settings",
          onPress: () => navigation.navigate("Settings"),
        },
      ],
    },
    {
      title: "Contact Us",
      items: [
        {
          id: "email",
          title: "Email Us",
          description: "support@example.com",
          icon: "mail",
          onPress: () => Linking.openURL("mailto:support@example.com"),
        },
        {
          id: "phone",
          title: "Contact Us",
          description: "09123456789",
          icon: "phone",
          onPress: () => Linking.openURL("tel:09123456789"),
        },
      ],
    },
    {
      title: "Resources",
      items: [
        {
          id: "faq",
          title: "FAQs",
          icon: "help-circle",
          onPress: () => navigation.navigate("FAQ"),
        },
        {
          id: "guidelines",
          title: "Service Guidelines",
          icon: "file-text",
          onPress: () => navigation.navigate("Guidelines"),
        },
        {
          id: "terms",
          title: "Terms & Conditions",
          icon: "file",
          onPress: () => navigation.navigate("Terms"),
        },
      ],
    },
  ];

  const SupportItem = ({ item }) => (
    <TouchableOpacity style={styles.supportItem} onPress={item.onPress}>
      <View style={styles.iconContainer}>
        <Feather name={item.icon} size={20} color="#666" />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        {item.description && (
          <Text style={styles.itemDescription}>{item.description}</Text>
        )}
      </View>
      <Feather name="chevron-right" size={20} color="#CCC" />
    </TouchableOpacity>
  );

  const SupportSection = ({ section }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionContent}>
        {section.items.map((item) => (
          <SupportItem key={item.id} item={item} />
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Help Message */}
        <View style={styles.helpMessage}>
          <Text style={styles.helpTitle}>How can we help you?</Text>
          <Text style={styles.helpSubtitle}>
            Choose a category below or contact our support team
          </Text>
        </View>

        {/* Support Sections */}
        {supportSections.map((section, index) => (
          <SupportSection key={index} section={section} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    flex: 1,
  },
  helpMessage: {
    padding: 24,
    alignItems: "center",
  },
  helpTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  helpSubtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    overflow: "hidden",
  },
  supportItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 13,
    color: "#666",
  },
});

export default HelpSupportScreen;
