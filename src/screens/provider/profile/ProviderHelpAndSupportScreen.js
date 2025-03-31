import React, { useCallback, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
  Alert,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";

// Constants
const COLORS = {
  primary: "#333",
  secondary: "#666",
  border: "#F5F5F5",
  background: "#FFFFFF",
  icon: "#CCC",
  borderLight: "#F0F0F0",
  iconBackground: "#F8F9FA",
};

const SPACING = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 24,
};

// Support Item Component
const SupportItem = memo(({ item }) => (
  <TouchableOpacity
    style={styles.supportItem}
    onPress={item.onPress}
    accessible={true}
    accessibilityLabel={`${item.title} button`}
    accessibilityHint={`Navigates to ${item.title} section`}
  >
    <View style={styles.iconContainer}>
      <Feather name={item.icon} size={20} color={COLORS.secondary} />
    </View>
    <View style={styles.itemContent}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      {item.description && (
        <Text style={styles.itemDescription}>{item.description}</Text>
      )}
    </View>
    <Feather name="chevron-right" size={20} color={COLORS.icon} />
  </TouchableOpacity>
));

// Support Section Component
const SupportSection = memo(({ section }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{section.title}</Text>
    <View style={styles.sectionContent}>
      {section.items.map((item) => (
        <SupportItem key={item.id} item={item} />
      ))}
    </View>
  </View>
));

const ProviderHelpSupportScreen = ({ navigation }) => {
  // Handle external links - FIXED VERSION
  const handleLinking = useCallback(async (url) => {
    try {
      // For telephone links, directly open without checking support
      if (url.startsWith('tel:')) {
        // On iOS, you might want to use telprompt: instead
        const phoneUrl = Platform.OS === 'ios' ? url.replace('tel:', 'telprompt:') : url;
        await Linking.openURL(phoneUrl);
      } else {
        // For other links, check support first
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert("Error", "Cannot open this URL");
        }
      }
    } catch (error) {
      console.error("Linking error:", error);
      Alert.alert("Error", "An error occurred while opening the link");
    }
  }, []);

  // Navigation handler
  const handleNavigation = useCallback(
    (screen) => {
      navigation.navigate(screen);
    },
    [navigation]
  );

  // Support sections data
  const supportSections = [
    {
      title: "Quick Help",
      items: [
        // {
        //   id: 'bookings',
        //   title: 'Bookings',
        //   icon: 'calendar',
        //   onPress: () => handleNavigation('BookingHelpScreen'),
        // },
        {
          id: "account",
          title: "Account Settings",
          icon: "settings",
          onPress: () => handleNavigation("Settings"),
        },
      ],
    },
    {
      title: "Contact Us",
      items: [
        {
          id: "email",
          title: "Chat Support",
          description: "servicelink-@outlook.com",
          icon: "mail",
          onPress: () => navigation.navigate("ChatSupport"),
        },
        {
          id: "phone",
          title: "Call Us",
          description: "09515613663",
          icon: "phone",
          onPress: () => handleLinking("tel:09515613663"),
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
          onPress: () => handleNavigation("FAQ"),
        },
        {
          id: "terms",
          title: "Terms & Conditions",
          icon: "file",
          onPress: () => handleNavigation("TermsConditions"),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessible={true}
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Help & Support</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Help Message */}
        <View style={styles.helpMessage}>
          <Text style={styles.helpTitle}>Need Assistance?</Text>
          <Text style={styles.helpSubtitle}>
            Select a category below or reach out to our support team.
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
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerRight: {
    width: 40,
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
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xlarge,
  },
  helpMessage: {
    padding: SPACING.xlarge,
    alignItems: "center",
  },
  helpTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: SPACING.small,
  },
  helpSubtitle: {
    fontSize: 15,
    color: COLORS.secondary,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: SPACING.large,
    paddingBottom: SPACING.xlarge,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: SPACING.medium,
  },
  sectionContent: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: "hidden",
  },
  supportItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.large,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.iconBackground,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.medium,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.primary,
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 13,
    color: COLORS.secondary,
  },
});

export default ProviderHelpSupportScreen;
