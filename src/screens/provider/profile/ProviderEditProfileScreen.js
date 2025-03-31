// src/screens/ServiceProvider/EditProfileScreen.js
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  StatusBar,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppContext } from "../../../../AppProvider";
import { useFocusEffect } from "@react-navigation/native";
import { find, loadingProcess, update } from "../../../helpers/databaseHelper";
import { updateProviderUserName } from "../../../db/UpdateUser";
import LocationPickerModal from "../../components/LocationPickerModal";

export default function ProviderEditProfileScreen({ navigation }) {
  const { userId, userName, userEmail, setUserName, settingsRef } =
    useAppContext();

  const [name, setName] = useState(userName);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [address, setAddress] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadingProcess(async () => {
        const snap = await find("users", userId);
        const userData = snap.data();
        // const userSnapshot = await getDoc(doc(db, "users", userId));

        setPhoneNumber(userData.phoneNumber);
        setAddress(userData.address);
      });
    }, [])
  );

  const handleSave = () =>
    loadingProcess(async () => {
      await update("users", userId, {
        name: name,
        phoneNumber: phoneNumber,
        address: address,
      });

      if (userName !== name) updateProviderUserName(userId, name);

      // await updateDoc(doc(db, "users", userId), {
      //   name: name,
      //   phoneNumber: phoneNumber,
      //   address: address,
      // });
      setUserName(name);
      Alert.alert("Success", "Profile updated successfully!");
      navigation.goBack();
    });

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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Picture */}

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Shop Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={(text) => setName(text)}
                placeholder="Enter your full name"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={userEmail}
                editable={false}
                placeholder="Enter your email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(text)}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={(text) => setAddress(text)}
                placeholder="Enter your address"
              />
              {settingsRef.current.showLocation ? (
                <TouchableOpacity
                  style={[
                    styles.input,
                    {
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 7,
                    },
                  ]}
                  onPress={() => setShowLocationPicker(true)}
                >
                  <Feather name="map-pin" size={20} color="#666" />
                  <Text style={[styles.inputText, { marginLeft: 5 }]}>
                    Use current location
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      </ScrollView>

      <LocationPickerModal
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelectLocation={(loc) => setAddress(loc)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  backButton: {
    padding: 8,
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: "#FFB800",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#FFB800",
  },
  editIconContainer: {
    position: "absolute",
    right: "30%",
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFB800",
  },
  formContainer: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  disabledInput: {
    backgroundColor: "#EEEEEE",
    color: "#999",
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
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  closeButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#FFB800",
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
