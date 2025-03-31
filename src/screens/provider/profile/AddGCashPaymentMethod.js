import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  Platform,
  ScrollView,
  Switch,
  SafeAreaView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  find,
  loadingProcess,
  remove,
  set,
} from "../../../helpers/databaseHelper";
import { useAppContext } from "../../../../AppProvider";
import { selectImage } from "../../../helpers/ImageSelector";
import { uploadImage } from "../../../helpers/cloudinary";

const AddGCashPaymentMethod = ({ navigation }) => {
  const { userId } = useAppContext();

  // const [acceptCash, setAcceptCash] = useState(params.acceptCash || false);
  const [hasGcash, setHasGcash] = useState(false);
  const [acceptGcash, setAcceptGcash] = useState(false);
  const [gcashName, setGcashName] = useState("");
  const [gcashNumber, setGcashNumber] = useState("");
  const [oldQRCodeImage, setOldQRCodeImage] = useState(null);
  const [qrCodeImage, setQrCodeImage] = useState(null);

  useEffect(() => {
    loadingProcess(async () => {
      const snap = await find("providerGCash", userId);
      if (!snap.exists()) return;

      const data = snap.data();
      setAcceptGcash(true);
      setHasGcash(true);
      setGcashNumber(data.number);
      setGcashName(data.name);
      setOldQRCodeImage(data.qrCodeImage);
      setQrCodeImage(data.qrCodeImage);
    });
  }, []);

  const handleRemoveQrCode = () => {
    Alert.alert(
      "Remove QR Code",
      "Are you sure you want to remove this QR code?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          onPress: () => setQrCodeImage(null),
          style: "destructive",
        },
      ]
    );
  };

  const pickImage = async () => {
    const image = await selectImage();
    setQrCodeImage(image);
  };

  const handleChangeImage = async () => {
    const image = await selectImage();
    if (image) setQrCodeImage(image);
  };

  const handleSaveChanges = () => {
    // if (!acceptCash && !acceptGcash) {
    //   Alert.alert("Error", "Please enable at least one payment method");
    //   return;
    // }

    loadingProcess(async () => {
      if (!acceptGcash) {
        if (hasGcash) {
          await remove("providerGCash", userId);
        }

        Alert.alert("Success", "Payment methods updated successfully!", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
        return;
      }

      if (!gcashName.trim()) {
        Alert.alert("Error", "Please provide your GCash account name");
        return;
      }

      if (!gcashNumber.trim()) {
        Alert.alert("Error", "Please provide your GCash number");
        return;
      }

      if (!hasGcash && !qrCodeImage) {
        Alert.alert("Error", "Please upload your GCash QR code");
        return;
      }

      let data = {
        name: gcashName,
        number: gcashNumber,
      };

      if (qrCodeImage) {
        const imageURL = await uploadImage(qrCodeImage, `${userId}_qrcode`);
        data["qrCodeImage"] = imageURL;
      }

      await set("providerGCash", userId, data);

      Alert.alert("Success", "Payment methods updated successfully!", [
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

      {/* Header with left-aligned title */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Methods</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionTitle}>Your Payment Methods</Text>

        {/* Cash on Delivery Option */}
        {/* <View style={styles.methodCard}>
          <View style={styles.methodContent}>
            <View style={styles.methodIconContainer}>
              <Feather name="dollar-sign" size={24} color="#FFB800" />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>Cash on Delivery</Text>
              <Text style={styles.methodDescription}>
                Accept cash payments when service is delivered
              </Text>
            </View>
          </View>
          <Switch
            trackColor={{ false: "#E0E0E0", true: "#4CAF5080" }}
            thumbColor={acceptCash ? "#4CAF50" : "#f4f3f4"}
            ios_backgroundColor="#E0E0E0"
            onValueChange={() => setAcceptCash(!acceptCash)}
            value={acceptCash}
          />
        </View> */}

        {/* GCash Option */}
        <View style={styles.methodCard}>
          <View style={styles.methodContent}>
            <View
              style={[
                styles.methodIconContainer,
                { backgroundColor: "#007EFF20" },
              ]}
            >
              <Feather name="smartphone" size={24} color="#007EFF" />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>GCash</Text>
              <Text style={styles.methodDescription}>
                Accept payments via GCash mobile wallet
              </Text>
            </View>
          </View>
          <Switch
            trackColor={{ false: "#E0E0E0", true: "#4CAF5080" }}
            thumbColor={acceptGcash ? "#4CAF50" : "#f4f3f4"}
            ios_backgroundColor="#E0E0E0"
            onValueChange={() => setAcceptGcash(!acceptGcash)}
            value={acceptGcash}
          />
        </View>

        {/* GCash Details Section - Only shown if GCash is enabled */}
        {acceptGcash && (
          <View style={styles.detailsSection}>
            <Text style={styles.detailsTitle}>GCash Account Details</Text>

            {/* GCash Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>GCash Account Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter account holder's name"
                value={gcashName}
                onChangeText={setGcashName}
              />
            </View>

            {/* GCash Number Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>GCash Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your GCash number"
                value={gcashNumber}
                onChangeText={setGcashNumber}
                keyboardType="phone-pad"
              />
            </View>

            {/* QR Code Upload */}
            <View style={styles.qrCodeSection}>
              <Text style={styles.inputLabel}>GCash QR Code</Text>
              <Text style={styles.qrDescription}>
                Upload your GCash QR code to allow customers to scan and pay
              </Text>

              {oldQRCodeImage || qrCodeImage ? (
                <View style={styles.qrPreviewContainer}>
                  <Image
                    source={{ uri: qrCodeImage?.uri ?? oldQRCodeImage }}
                    style={styles.qrPreview}
                  />
                  <View style={styles.qrButtonsContainer}>
                    <TouchableOpacity
                      style={styles.changeQrButton}
                      onPress={handleChangeImage}
                    >
                      <Text style={styles.changeQrButtonText}>Change</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.changeQrButton, styles.removeButton]}
                      onPress={handleRemoveQrCode}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={pickImage}
                >
                  <Feather name="upload" size={24} color="#666666" />
                  <Text style={styles.uploadButtonText}>Upload QR Code</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF2",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 16 : 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
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
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  methodContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF9E6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: "#666666",
  },
  detailsSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  qrCodeSection: {
    marginBottom: 16,
  },
  qrDescription: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 16,
  },
  uploadButton: {
    height: 120,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
  },
  uploadButtonText: {
    fontSize: 14,
    color: "#666666",
    marginTop: 8,
  },
  qrPreviewContainer: {
    alignItems: "center",
  },
  qrPreview: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginBottom: 16,
    borderRadius: 12,
  },
  qrButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  changeQrButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    marginHorizontal: 8,
  },
  changeQrButtonText: {
    fontSize: 14,
    color: "#333333",
  },
  removeButton: {
    backgroundColor: "#FFF0F0",
  },
  removeButtonText: {
    fontSize: 14,
    color: "#FF3B30",
  },
  saveButton: {
    backgroundColor: "#FFB800",
    padding: 16,
    margin: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#FFB800",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default AddGCashPaymentMethod;
