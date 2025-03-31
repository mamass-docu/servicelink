import React from "react";
import WelcomeScreen from "../src/screens/WelcomeScreen";
import OnboardingScreen1 from "../src/screens/boarding/OnboardingScreen1";
import OnboardingScreen2 from "../src/screens/boarding/OnboardingScreen2";
import OnboardingScreen3 from "../src/screens/boarding/OnboardingScreen3";
import LoginScreen from "../src/screens/auth/LoginScreen";
import ForgotPassword from "../src/screens/auth/ForgotPasswordScreen";
import RoleScreen from "../src/screens/auth/RoleScreen";
import SignupScreen from "../src/screens/auth/SignupScreen";
import MessageScreen from "../src/screens/All/MessageScreen";
import ChangePasswordScreen from "../src/screens/All/ChangePasswordScreen";
import UserSearchResultsScreen from "../src/screens/All/UserSearchResultsScreen";
import NotificationsScreen from "../src/screens/All/NotificationsScreen";
import JobStatusScreen from "../src/screens/All/JobStatus";
import { useAppContext } from "../AppProvider";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Providers } from "./Providers";
import { Customers } from "./Customers";
import ChatSupportScreen from "../src/screens/All/ChatSupportScreen";
import TermsConditionsScreen from "../src/screens/All/TermsConditionsScreen";
import FAQScreen from "../src/screens/All/FAQScreen";
import CustomerBookingIssueScreen from "../src/screens/customer/profile/CustomerBookingIssueScreen";
import { ImagePreviewScreen } from "../src/screens/All/ImagePreviewScreen";
import LocationViewerScreen from "../src/screens/All/LocationViewerScreen";

const Stack = createNativeStackNavigator();

export const All = () => {
  const { userRole } = useAppContext();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "none",
        contentStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Boarding1" component={OnboardingScreen1} />
      <Stack.Screen name="Boarding2" component={OnboardingScreen2} />
      <Stack.Screen name="Boarding3" component={OnboardingScreen3} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="Role" component={RoleScreen} />
      <Stack.Screen name="SignUp" component={SignupScreen} />
      <Stack.Screen name="Message" component={MessageScreen} />
      <Stack.Screen name="UserSearch" component={UserSearchResultsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="ChatSupport" component={ChatSupportScreen} />
      <Stack.Screen name="TermsConditions" component={TermsConditionsScreen} />
      <Stack.Screen name="FAQ" component={FAQScreen} />
      <Stack.Screen name="ImagePreview" component={ImagePreviewScreen} />
      <Stack.Screen name="LocationViewer" component={LocationViewerScreen} />
      <Stack.Screen
        name="BookingIssue"
        component={CustomerBookingIssueScreen}
      />
      <Stack.Screen
        name="JobStatus"
        component={JobStatusScreen}
        options={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: "#1A1A1A" },
        }}
      />

      {!userRole
        ? null
        : userRole == "Provider"
        ? Providers(Stack)
        : Customers(Stack)}
    </Stack.Navigator>

    // </>
  );
};
