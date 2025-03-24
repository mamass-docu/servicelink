// src/screens/Customer/EditProfileScreen.js
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
import { selectImage } from "../../../helpers/ImageSelector";
import { uploadImage } from "../../../helpers/cloudinary";
import {
  updateCustomerUserImage,
  updateCustomerUserName,
} from "../../../db/UpdateUser";
import ProfileImageScreen from "../../components/ProfileImage";

export default function CustomerEditProfileScreen({ navigation }) {
  const { userId, userName, userEmail, setUserName, userImage, setUserImage } =
    useAppContext();

  const [name, setName] = useState(userName);
  const [phoneNumber, setPhoneNumber] = useState(null);

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(
    "https://cdn-icons-png.flaticon.com/512/1154/1154955.png"
  );

  const avatarOptions = [
    { id: 1, url: "https://cdn-icons-png.flaticon.com/512/1154/1154955.png" },
    { id: 2, url: "https://cdn-icons-png.flaticon.com/512/1154/1154956.png" },
    { id: 3, url: "https://cdn-icons-png.flaticon.com/512/1154/1154987.png" },
    { id: 4, url: "https://cdn-icons-png.flaticon.com/512/1154/1154988.png" },
    { id: 5, url: "https://cdn-icons-png.flaticon.com/512/1154/1154989.png" },
    { id: 6, url: "https://cdn-icons-png.flaticon.com/512/1154/1154990.png" },
    // Add more avatar options as needed
  ];

  useFocusEffect(
    useCallback(() => {
      loadingProcess(async () => {
        const snap = await find("users", userId);
        const userData = snap.data();
        // const userSnapshot = await getDoc(doc(db, "users", userId));

        setPhoneNumber(userData.phoneNumber);
      });
    }, [])
  );

  const updateProfileImage = async () => {
    const image = await selectImage();
    if (!image) return;

    // const imageName = image.fileName;
    // const imageExtension = imageName.substring(imageName.lastIndexOf("."));
    // const filename = `${userId}${imageExtension}`;

    loadingProcess(
      async () => {
        const imgUrl = await uploadImage(image, userId);

        await update("users", userId, {
          image: imgUrl,
        });

        updateCustomerUserImage(userId, imgUrl);

        setUserImage(imgUrl);
        alert("Image uploaded successfully!");
      },
      (e) => {
        alert(e);
      }
    );
  };

  const handleSave = () =>
    loadingProcess(async () => {
      await update("users", userId, {
        name: name,
        phoneNumber: phoneNumber,
      });

      if (userName !== name) updateCustomerUserName(userId, name);

      setUserName(name);
      Alert.alert("Success", "Profile updated successfully!");
      navigation.goBack();
    });

  const AvatarModal = () => (
    <Modal
      visible={showAvatarModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowAvatarModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Choose Avatar</Text>
          <View style={styles.avatarGrid}>
            {avatarOptions.map((avatar) => (
              <TouchableOpacity
                key={avatar.id}
                style={[
                  styles.avatarOption,
                  selectedAvatar === avatar.url && styles.selectedAvatarOption,
                ]}
                onPress={() => {
                  setSelectedAvatar(avatar.url);
                  setShowAvatarModal(false);
                }}
              >
                <Image
                  source={{ uri: avatar.url }}
                  style={styles.avatarImage}
                />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowAvatarModal(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Picture */}
        <TouchableOpacity
          style={styles.profileImageContainer}
          onPress={updateProfileImage}
          // onPress={() => setShowAvatarModal(true)}
        >
          <ProfileImageScreen
            image={userImage}
            name={userName}
            style={styles.profileImage}
          />
          <View style={styles.editIconContainer}>
            <Feather name="edit-2" size={20} color="#FFB800" />
          </View>
        </TouchableOpacity>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
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
        </View>
      </ScrollView>

      <AvatarModal />
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
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  avatarOption: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },
  selectedAvatarOption: {
    borderColor: "#FFB800",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
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
