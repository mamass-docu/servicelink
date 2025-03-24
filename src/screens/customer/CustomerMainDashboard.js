import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import CustomerHomeScreen from "./home/CustomerHomeScreen";
import CustomerBookingsScreen from "./bookings/CustomerBookingsScreen";
import CustomerProfileScreen from "./profile/CustomerProfileScreen";
import MessengerScreen from "../All/MessengerScreen";

const Tab = createBottomTabNavigator();

const CustomerMainDashboard = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          height: 60,
          paddingHorizontal: 5,
          paddingTop: 5,
          paddingBottom: 10,
          borderTopWidth: 1,
          borderTopColor: "#E0E0E0",
        },
        tabBarActiveTintColor: "#FFB800",
        tabBarInactiveTintColor: "#666666",
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={CustomerHomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="BookingsTab"
        component={CustomerBookingsScreen}
        options={{
          tabBarLabel: "Bookings",
          tabBarIcon: ({ color }) => (
            <Feather name="calendar" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MessagesTab"
        component={MessengerScreen}
        // component={CustomerMessagesScreen}
        options={{
          tabBarLabel: "Messages",
          tabBarIcon: ({ color }) => (
            <Feather name="message-circle" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={CustomerProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default CustomerMainDashboard;
