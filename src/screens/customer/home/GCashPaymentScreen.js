import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  Clipboard,
  Image,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  find,
  get,
  loadingProcess,
  where,
} from "../../../helpers/databaseHelper";
import { selectImage } from "../../../helpers/ImageSelector";

export default function GCashPaymentScreen({ navigation, route }) {
  const { onSubmitPayment, price, providerId } = route.params;
  const [referenceNumber, setReferenceNumber] = useState("");
  const [gcashName, setGcashName] = useState("");
  const [gcashNumber, setGcashNumber] = useState("");
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    loadingProcess(async () => {
      const snap = await find("providerGCash", providerId);
      if (!snap.exists()) return;

      const data = snap.data();

      setGcashNumber(data.number);
      setGcashName(data.name);
      setQrCodeImage(data.qrCodeImage);
    });
  }, []);

  const onSubmit = () => {
    if (referenceNumber.trim() == "") {
      alert("Reference number is required!!!");
      return;
    }
    if (!receipt) {
      alert("Please upload receipt!!!");
      return;
    }

    loadingProcess(async () => {
      const snap = await get(
        "bookings",
        where("referenceNumber", "==", referenceNumber)
      );
      if (snap.docs.length > 0) {
        alert("Invalid reference, this reference already used!!!");
        return;
      }

      onSubmitPayment("GCash", referenceNumber, receipt);
      navigation.goBack();
    });
  };

  const onUpload = async () => {
    const image = await selectImage();
    if (!image) return;

    setReceipt(image);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* <View style={styles.modalOverlay}> */}
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Gcash Payment</Text>

          <View style={styles.paymentSummary}>
            <Text style={styles.summaryAmount}>₱{price}</Text>
          </View>

          <View style={styles.qrContainer}>
            <Image
              source={{ uri: qrCodeImage }}
              style={styles.qrImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.paymentMethod}>
            <View style={styles.methodHeader}>
              <Icon name="wallet" size={20} color="#00A1E9" />
              <Text style={styles.methodName}>GCash</Text>
            </View>
            <TouchableOpacity
              style={styles.copyNumber}
              onPress={() => {
                Clipboard.setString(gcashNumber);
                Alert.alert("Copied", "GCash number copied to clipboard");
              }}
            >
              <Text style={styles.numberText}>{gcashNumber}</Text>
              <Icon name="content-copy" size={18} color="#666" />
            </TouchableOpacity>
            <Text style={styles.accountName}>{gcashName}</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Reference Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter reference number"
              placeholderTextColor="#999"
              value={referenceNumber}
              onChangeText={setReferenceNumber}
            />
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: "#FFB800",
              padding: 16,
              borderRadius: 8,
              alignItems: "center",
              marginBottom: 5,
            }}
            onPress={onUpload}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Upload Receipt
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel Payment</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
            <Text style={styles.submitButtonText}>Submit Payment</Text>
          </TouchableOpacity>
        </View>
        {/* </View> */}
      </ScrollView>
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
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  summaryCard: {
    margin: 16,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  summaryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  unpaidLabel: {
    fontSize: 14,
    color: "#666",
  },
  unpaidCount: {
    fontSize: 14,
    color: "#FF4444",
    fontWeight: "500",
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  payAllButton: {
    backgroundColor: "#FFB800",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  payAllText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  billCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  billHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
    color: "#666",
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  service: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  customer: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  amountContainer: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: "#666",
  },
  amount: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  commission: {
    fontSize: 14,
    color: "#FF4444",
    fontWeight: "600",
  },
  reference: {
    fontSize: 13,
    color: "#666",
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  paymentSummary: {
    alignItems: "center",
    marginBottom: 24,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  billCount: {
    fontSize: 14,
    color: "#666",
  },
  paymentOptions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  optionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFB800",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  optionButtonActive: {
    backgroundColor: "#0056b3",
  },
  optionText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  qrTabs: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },
  qrTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    gap: 8,
  },
  qrTabActive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  qrTabText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  qrContainer: {
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  adminNumbers: {
    marginBottom: 24,
    gap: 12,
  },
  paymentMethod: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  methodHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  methodName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  copyNumber: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  numberText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  accountName: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#14a44d",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#e8113c",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 5,
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
