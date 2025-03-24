// src/screens/ServiceProvider/AddServicesScreen.js
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { services } from "../../../services";
import { useAppContext } from "../../../../AppProvider";
import { useFocusEffect } from "@react-navigation/native";
import { find, loadingProcess, update } from "../../../helpers/databaseHelper";
import { selectImage } from "../../../helpers/ImageSelector";
import { uploadImage } from "../../../helpers/cloudinary";
import {
  // updateProviderUserImage,
  updateProviderUserName,
} from "../../../db/UpdateUser";
import LocationPickerModal from "../../components/LocationPickerModal";

const AddServicesScreen = ({ navigation }) => {
  const {
    userId,
    userName,
    userEmail,
    userImage,
    setUserName,
    setUserImage,
    settingsRef,
  } = useAppContext();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [shopDetails, setShopDetails] = useState({
    name: userName,
    service: "",
    description: "",
    phoneNumber: "",
    email: userEmail,
    address: "",
    image: userImage,
  });

  useFocusEffect(
    useCallback(() => {
      loadingProcess(async () => {
        const snap = await find("users", userId);
        const userData = snap.data();

        setShopDetails({
          ...shopDetails,
          service: userData.service,
          description: userData.description,
          phoneNumber: userData.phoneNumber,
          address: userData.address,
        });
      });
    }, [])
  );

  const pickImage = async () => {
    try {
      const result = await selectImage();
      if (result == null) return;

      setSelectedImage(result);
    } catch (e) {
      alert("Error saving image!!!");
    }
  };

  const selectService = (service) => {
    setShopDetails({
      ...shopDetails,
      service: service,
    });
    setIsDropdownOpen(false);
  };

  const isEmptyFromShopInfo = (key) =>
    !shopDetails[key] || shopDetails[key].trim() == "";

  const validateForm = () => {
    if (isEmptyFromShopInfo("service")) {
      Alert.alert("Error", "Please select a service type");
      return false;
    }
    // if (!selectedImage) {
    //   Alert.alert("Error", "Please upload a shop image");
    //   return false;
    // }
    if (isEmptyFromShopInfo("name")) {
      Alert.alert("Error", "Please enter your shop name");
      return false;
    }
    if (isEmptyFromShopInfo("description")) {
      Alert.alert("Error", "Please enter a shop description");
      return false;
    }
    if (isEmptyFromShopInfo("phoneNumber")) {
      Alert.alert("Error", "Please enter a phone number");
      return false;
    }
    if (isEmptyFromShopInfo("email")) {
      Alert.alert("Error", "Please enter an email address");
      return false;
    }
    if (isEmptyFromShopInfo("address")) {
      Alert.alert("Error", "Please enter your shop address");
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    loadingProcess(async () => {
      let data = shopDetails;

      if (selectedImage) {
        // const imageName = selectedImage.fileName;
        // const imageExtension = imageName.substring(imageName.lastIndexOf("."));

        // const file = {
        //   uri: selectedImage.uri,
        //   type: "image/jpeg",
        //   name: `${userId}${imageExtension}`,
        // };

        const imageUrl = await uploadImage(selectedImage, userId);
        // updateProviderUserImage(userId, imageUrl);
        data.image = imageUrl;
        setUserImage(imageUrl);
      }
      if (!data.image) delete data.image;

      await update("users", userId, data);

      if (userName !== data.name) updateProviderUserName(userId, data.name);

      setUserName(data.name);

      Alert.alert("Success", "Shop details saved successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Shop</Text>
      </View>

      <ScrollView style={styles.content} nestedScrollEnabled={true}>
        {/* Services Dropdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services Type</Text>
          <TouchableOpacity
            style={styles.dropdownHeader}
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Text style={styles.dropdownText}>
              {shopDetails.service || "Select a service"}
            </Text>
            <Feather
              name={isDropdownOpen ? "chevron-up" : "chevron-down"}
              size={24}
              color="#666"
            />
          </TouchableOpacity>

          {isDropdownOpen && (
            <ScrollView
              style={styles.dropdownContent}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
            >
              {services.map((service, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.serviceItem,
                    index === services.length - 1 && styles.lastServiceItem,
                    shopDetails.service === service &&
                      styles.selectedServiceItem,
                  ]}
                  onPress={() => selectService(service)}
                >
                  <View
                    style={[
                      styles.radio,
                      shopDetails.service === service && styles.radioSelected,
                    ]}
                  >
                    {shopDetails.service === service && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.serviceText,
                      shopDetails.service === service &&
                        styles.selectedServiceText,
                    ]}
                  >
                    {service}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Shop Image */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop Image</Text>
          <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
            {selectedImage || shopDetails.image ? (
              <Image
                source={{ uri: selectedImage?.uri ?? shopDetails.image }}
                style={styles.shopImage}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Feather name="camera" size={40} color="#666666" />
                <Text style={styles.uploadText}>Upload Image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Shop Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop Details</Text>

          <Text style={styles.label}>Shop Name</Text>
          <TextInput
            style={styles.input}
            value={shopDetails.name}
            onChangeText={(text) =>
              setShopDetails({ ...shopDetails, name: text })
            }
            placeholder="Enter shop name"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            value={shopDetails.description}
            onChangeText={(text) =>
              setShopDetails({ ...shopDetails, description: text })
            }
            placeholder="Enter shop description"
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={shopDetails.phoneNumber}
            onChangeText={(text) =>
              setShopDetails({ ...shopDetails, phone: text })
            }
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={shopDetails.email}
            editable={false}
            onChangeText={(text) =>
              setShopDetails({ ...shopDetails, email: text })
            }
            placeholder="Enter email address"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={3}
            value={shopDetails.address}
            onChangeText={(text) =>
              setShopDetails({ ...shopDetails, address: text })
            }
            placeholder="Enter complete address"
          />
          {settingsRef.current.showLocation ? (
            <TouchableOpacity
              style={{
                backgroundColor: "#F5F5F5",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                color: "#333",
                flexDirection: "row",
                alignItems: "center",
                // marginTop: 7,
              }}
              onPress={() => setShowLocationPicker(true)}
            >
              <Feather name="map-pin" size={20} color="#666" />
              <Text style={{ marginLeft: 5 }}>Use current location</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>

      <LocationPickerModal
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelectLocation={(loc) =>
          setShopDetails({ ...shopDetails, address: loc })
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 16 : 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF2",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginLeft: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2.84,
    elevation: 2,
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8ECF2",
    marginBottom: 4,
  },
  dropdownText: {
    fontSize: 16,
    color: "#1A1A1A",
  },
  dropdownContent: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8ECF2",
    maxHeight: 250,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF2",
  },
  selectedServiceItem: {
    backgroundColor: "#F0F7FF",
  },
  lastServiceItem: {
    borderBottomWidth: 0,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#E8ECF2",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    borderColor: "#007AFF",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#007AFF",
  },
  serviceText: {
    fontSize: 16,
    color: "#1A1A1A",
  },
  selectedServiceText: {
    color: "#007AFF",
    fontWeight: "500",
  },
  imageUpload: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    backgroundColor: "#F5F7FA",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  shopImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F7FA",
    width: "100%",
    height: "100%",
  },
  uploadText: {
    marginTop: 12,
    fontSize: 15,
    color: "#666666",
  },
  label: {
    fontSize: 15,
    color: "#666666",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    color: "#1A1A1A",
  },
  textArea: {
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    height: 140,
    textAlignVertical: "top",
    color: "#1A1A1A",
  },
  saveButton: {
    backgroundColor: "#FFB800",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginVertical: 24,
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: -10,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
});

export default AddServicesScreen;
