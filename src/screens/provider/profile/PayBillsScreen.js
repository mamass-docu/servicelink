import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  Clipboard,
  Image,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  all,
  get,
  loadingProcess,
  serverTimestamp,
  update,
  where,
} from "../../../helpers/databaseHelper";
import { useAppContext } from "../../../../AppProvider";
import { timestampToDateStringConverter } from "../../../helpers/DateTimeConverter";

const PayBillsScreen = ({ navigation }) => {
  const { userId } = useAppContext();
  const [commissionBills, setCommissionBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [totalBills, setTotalBills] = useState(0);
  const [bills, setBills] = useState(0);
  const [activeFilter, setActiveFilter] = useState("All");

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("qr");
  const [gcashDetails, setGcashDetails] = useState(null);

  const filterOptions = [
    { id: "All", label: "All", icon: "view-list" },
    { id: "Paid", label: "Paid", icon: "check-circle-outline" },
    { id: "Unpaid", label: "Unpaid", icon: "clock-outline" },
    { id: "Processing", label: "Processing", icon: "progress-clock" },
  ];

  useEffect(() => {
    loadingProcess(refresh);
  }, []);

  useEffect(() => {
    if (activeFilter === "All") {
      setFilteredBills(commissionBills);
    } else {
      const filtered = commissionBills.filter((bill) => {
        if (activeFilter === "Paid") return bill.status === "Completed";
        if (activeFilter === "Unpaid") return bill.status === "Unpaid";
        if (activeFilter === "Processing") return bill.status === "Processing";
        return true;
      });
      setFilteredBills(filtered);
    }
  }, [activeFilter, commissionBills]);

  const refresh = async () => {
    const gsnap = await all("adminGcash");
    if (gsnap.docs.length > 0) {
      setGcashDetails(gsnap.docs[0].data());
    }

    const snap = await get(
      "bookings",
      where("status", "==", "Completed"),
      where("providerId", "==", userId)
    );

    let temp = [];
    let totalPrice = 0;
    let b = 0;
    snap.docs.forEach((item) => {
      const data = item.data();
      // if (data.commissionReference && data.commissionStatus == "Completed")
      //   return;

      const price = parseInt(data.price);
      const commission = parseInt(price * 0.15);

      if (!data.commissionStatus) {
        b++;
        totalPrice += commission;
      }

      temp.push({
        id: item.id,
        service: data.service,
        customerName: data.customerName,
        date: timestampToDateStringConverter(data.createdAt),
        rawDate: data.createdAt ? data.createdAt.toDate() : new Date(),
        price: price,
        commission: commission,
        status: data.commissionStatus ?? "Unpaid",
      });
    });

    // Sort transactions by date (newest to oldest)
    temp.sort((a, b) => b.rawDate - a.rawDate);

    setTotalBills(totalPrice);
    setCommissionBills(temp);
    setFilteredBills(temp);
    setBills(b);
  };

  const handleSubmitPayment = () => {
    if (!referenceNumber.trim()) {
      Alert.alert("Error", "Please enter reference number");
      return;
    }

    setShowPaymentModal(false);
    loadingProcess(async () => {
      const snap = await get(
        "bookings",
        where("commissionReference", "==", referenceNumber)
      );
      if (snap.docs.length > 0) {
        Alert.alert(
          "Error",
          "Invalid reference, this reference already used!!!"
        );
        return;
      }

      for (const booking of commissionBills) {
        if (booking.status != "Unpaid") continue;

        await update("bookings", booking.id, {
          commissionReference: referenceNumber,
          paidCommissionAt: serverTimestamp(),
          commissionStatus: "Processing",
        });
      }
      await refresh();
      setReferenceNumber("");
      Alert.alert(
        "Success",
        "Payment successfully. Please wait for admin verification.",
        [
          {
            text: "OK",
          },
        ]
      );
    });
  };

  const BillCard = ({ bill }) => (
    <View style={styles.billCard}>
      <View style={styles.billHeader}>
        <Text style={styles.date}>{bill.date}</Text>
        <View
          style={[
            styles.status,
            {
              backgroundColor:
                bill.status === "Processing"
                  ? "#FFF3E0"
                  : bill.status === "Completed"
                  ? "#E8F5E9"
                  : "#FFE8E8",
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color:
                  bill.status === "Processing"
                    ? "#FF9800"
                    : bill.status === "Completed"
                    ? "#4CAF50"
                    : "#FF4444",
              },
            ]}
          >
            {bill.status === "Completed" ? "PAID" : bill.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.service}>{bill.service}</Text>
      <Text style={styles.customer}>{bill.customerName}</Text>

      <View style={styles.amountContainer}>
        <View style={styles.amountRow}>
          <Text style={styles.label}>Service Amount:</Text>
          <Text style={styles.amount}>₱{bill.price}</Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.label}>Commission (15%):</Text>
          <Text style={styles.commission}>₱{bill.commission.toFixed(2)}</Text>
        </View>
      </View>

      {bill.status === "Processing" && (
        <Text style={styles.reference}>Ref: {bill.reference}</Text>
      )}
    </View>
  );

  const renderFilterItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        activeFilter === item.id && styles.filterChipActive,
      ]}
      onPress={() => setActiveFilter(item.id)}
    >
      <Icon
        name={item.icon}
        size={16}
        color={activeFilter === item.id ? "#FFFFFF" : "#666"}
      />
      <Text
        style={[
          styles.filterChipText,
          activeFilter === item.id && styles.filterChipTextActive,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Commission Bills</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          data={filterOptions}
          renderItem={renderFilterItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        />
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <Text style={styles.unpaidLabel}>Unpaid Commission</Text>
          <Text style={styles.unpaidCount}>
            {bills} {bills === 1 ? "bill" : "bills"}
          </Text>
        </View>
        <Text style={styles.totalAmount}>₱{totalBills}</Text>
        {totalBills > 0 && (
          <TouchableOpacity
            style={styles.payAllButton}
            onPress={() => {
              if (!gcashDetails) {
                alert("Admin GCash is not been set!!!");
                return;
              }

              setShowPaymentModal(true);
            }}
          >
            <Text style={styles.payAllText}>Pay All Commissions</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {filteredBills.map((bill) => (
          <BillCard key={bill.id} bill={bill} />
        ))}
        {filteredBills.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="file-search-outline" size={60} color="#DDD" />
            <Text style={styles.emptyStateText}>
              No {activeFilter !== "All" ? activeFilter.toLowerCase() : ""}{" "}
              bills found
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowPaymentModal(false);
          setReferenceNumber("");
        }}
      >
        <TouchableWithoutFeedback onPress={() => setShowPaymentModal(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Pay All Commissions</Text>

              <View style={styles.paymentSummary}>
                <Text style={styles.summaryLabel}>Total Amount Due</Text>
                <Text style={styles.summaryAmount}>₱{totalBills}</Text>
                <Text style={styles.billCount}>{bills} unpaid bills</Text>
              </View>

              <View style={styles.paymentOptions}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    selectedPaymentMethod === "qr" && styles.optionButtonActive,
                  ]}
                  onPress={() => setSelectedPaymentMethod("qr")}
                >
                  <Icon name="qrcode-scan" size={20} color="#FFFFFF" />
                  <Text style={styles.optionText}>Pay with QR</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    selectedPaymentMethod === "number" &&
                      styles.optionButtonActive,
                  ]}
                  onPress={() => setSelectedPaymentMethod("number")}
                >
                  <Icon name="numeric" size={20} color="#FFFFFF" />
                  <Text style={styles.optionText}>Pay with Number</Text>
                </TouchableOpacity>
              </View>

              {selectedPaymentMethod === "qr" && (
                <>
                  {/* <View style={styles.qrTabs}>
                    <TouchableOpacity
                      style={[
                        styles.qrTab,
                        selectedQR === "gcash" && styles.qrTabActive,
                      ]}
                      onPress={() => setSelectedQR("gcash")}
                    >
                      <Icon name="wallet" size={20} color="#00A1E9" />
                      <Text style={styles.qrTabText}>GCash</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.qrTab,
                        selectedQR === "maya" && styles.qrTabActive,
                      ]}
                      onPress={() => setSelectedQR("maya")}
                    >
                      <Icon name="wallet" size={20} color="#682E87" />
                      <Text style={styles.qrTabText}>Maya</Text>
                    </TouchableOpacity>
                  </View> */}
                  <View style={styles.qrContainer}>
                    <Image
                      source={{ uri: gcashDetails?.qr }}
                      style={styles.qrImage}
                      resizeMode="contain"
                    />
                  </View>
                </>
              )}

              {selectedPaymentMethod === "number" && (
                <View style={styles.adminNumbers}>
                  <View style={styles.paymentMethod}>
                    <View style={styles.methodHeader}>
                      <Icon name="wallet" size={20} color="#00A1E9" />
                      <Text style={styles.methodName}>GCash</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.copyNumber}
                      onPress={() => {
                        Clipboard.setString(gcashDetails?.number);
                        Alert.alert(
                          "Copied",
                          "GCash number copied to clipboard"
                        );
                      }}
                    >
                      <Text style={styles.numberText}>
                        {gcashDetails?.number}
                      </Text>
                      <Icon name="content-copy" size={18} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.accountName}>{gcashDetails?.name}</Text>
                  </View>

                  {/* <View style={styles.paymentMethod}>
                    <View style={styles.methodHeader}>
                      <Icon name="wallet" size={20} color="#682E87" />
                      <Text style={styles.methodName}>Maya</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.copyNumber}
                      onPress={() => {
                        Clipboard.setString("09515613663");
                        Alert.alert(
                          "Copied",
                          "Maya number copied to clipboard"
                        );
                      }}
                    >
                      <Text style={styles.numberText}>09515613663</Text>
                      <Icon name="content-copy" size={18} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.accountName}>ER*****N M</Text>
                  </View> */}
                </View>
              )}

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
                style={styles.submitButton}
                onPress={handleSubmitPayment}
              >
                <Text style={styles.submitButtonText}>Submit Payment</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  filterContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  filterList: {
    paddingHorizontal: 16,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#FFB800",
  },
  filterChipText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  filterChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "500",
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
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
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
    marginBottom: 24,
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
    backgroundColor: "#FFB800",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 10,
  },
});

export default PayBillsScreen;
