import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  StatusBar,
  Alert,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAppContext } from "../../../../AppProvider";
import LocationPickerModal from "../../../screens/components/LocationPickerModal";
import {
  add,
  addNotif,
  find,
  loadingProcess,
  serverTimestamp,
  specificLoadingProcess,
  useSelector,
} from "../../../helpers/databaseHelper";
import ProfileImageScreen from "../../components/ProfileImage";
import { uploadImage } from "../../../helpers/cloudinary";

const days = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const BookServiceScreen = ({ route, navigation }) => {
  const { provider } = route.params;
  const { userId, userName, settingsRef } = useAppContext();

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [location, setLocation] = useState(null);
  const [note, setNote] = useState("");
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sched, setSched] = useState({});
  // const [allowNotif, setAllowNotif] = useState(true);

  const loading = useSelector((state) => state.loading.specific);

  useEffect(() => {
    loadingProcess(async () => {
      // find("settings", provider.providerId).then((snap) => {
      //   if (snap.exists()) setAllowNotif(snap.data().bookings);
      // });
      const bsnap = await find("providerBusinessHours", provider.providerId);
      if (bsnap.exists())
        setSched(bsnap.data());

      const snap = await find("users", userId);
      if (!snap.exists() || !snap.data().addresses) return;

      setAddresses(
        snap.data().addresses.map((item) => {
          if (item.default) setLocation(item.address);
          return {
            address: item.address,
            label: item.label,
          };
        })
      );

    });

    return () => {
      setShowSuccessModal(false);
    };
  }, []);

  const getDateTime = (sdate) => sched[days[new Date(sdate).getDay()]];

  const getTime = (t) => {
    let v = parseInt(t.substring(0, t.length - 3).replace(":", ""));
    if (t.includes("P")) v += 1200;
    return v;
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation);
  };

  const handleBooking = () => {
    console.log("Booking button pressed"); // Log when the button is pressed
    if (loading) {
      console.log("Loading in progress..."); // Log if it's loading
      return;
    }
  
    const v = getDateTime(date);
    console.log("Date and Time:", date); // Log the selected date and time
    console.log("Provider availability:", v); // Log the result of getDateTime
  
    if (!v || !v.isOpen) {
      console.log("Provider not available at this date"); // Log when the provider is not available
      alert(
        "Provider is not available at this date!!!!, Please try another date"
      );
      return;
    }

    const open = getTime(v.openTime);
    const close = getTime(v.closeTime);
    const t = getTime(
      time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );

    if (
      (open > close && t < open && t > close) ||
      (open < close && (t < open || t > close))
    ) {
      alert(
        "Provider is not available at this time!!!!, Please try another time"
      );
      return;
    }

    if (!location || !location.trim()) {
      Alert.alert("Error", "Please enter your location");
      return;
    }

    if (!paymentMethod) {
      Alert.alert("Error", "Please select a payment method");
      return;
    }

    specificLoadingProcess(
      async () => {
        const receiptUrl = await uploadImage(receipt, "imagereceipt");
        const bookingData = {
          providerId: provider.providerId,
          providerName: provider.providerName,
          customerId: userId,
          customerName: userName,
          // serviceId: provider.serviceId,
          service: provider.service,
          task: provider.task,
          price: provider.price,
          receipt: receiptUrl,
          // discountedPrice: provider.discountedPrice,
          date: date.toLocaleDateString(),
          time: time.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          address: location,
          note: note,
          paymentMethod: paymentMethod,
          referenceNumber: referenceNumber,
          status: "Pending",
          createdAt: serverTimestamp(),
        };

        const docRef = await add("bookings", bookingData);

        // if (allowNotif)
        addNotif(
          provider.providerId,
          `Bookings from ${userName}`,
          `${provider.service}/${provider.task} at ${location}`,
          "Main",
          { screen: "BookingsTab" }
        );

        setBookingId(docRef.id);
        setShowSuccessModal(true);
      },
      (error) => {
        Alert.alert("Error", "Failed to submit booking. Please try again.");
      }
    );
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
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Service</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Service Details */}
        <View style={styles.serviceCard}>
          <ProfileImageScreen
            image={provider.image}
            name={provider.providerName}
            style={styles.serviceImage}
            resizeMode="cover"
          />
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceTitle}>{provider.task}</Text>
            {/* <Text style={styles.estimatedTime}>
              ⏱️ {provider.estimatedTime}
            </Text> */}
            <View style={styles.priceContainer}>
              <Text style={styles.discountPrice}>₱{provider.price}</Text>
              {/* <Text style={styles.discountPrice}>
                ₱{provider.discountedPrice}
              </Text> */}
            </View>
          </View>
        </View>

        {/* Service Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionTitle}>Service Description</Text>
          <Text style={styles.descriptionText}>{provider.description}</Text>
          {/* <Text style={styles.includesTitle}>Service Includes:</Text>
          {provider.included.map((item, index) => (
            <View key={index} style={styles.includeItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.includeText}>{item}</Text>
            </View>
          ))} */}
        </View>

        {/* Date & Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>

          <TouchableOpacity
            style={styles.input}
            onPress={() => {
              setShowDatePicker(true);
            }}
          >
            <Feather name="calendar" size={20} color="#666" />
            <Text style={styles.inputText}>
              {date ? date.toLocaleDateString() : "Select booking date"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowTimePicker(true)}
          >
            <Feather name="clock" size={20} color="#666" />
            <Text style={styles.inputText}>
              {time
                ? time.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Select booking time"}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={onTimeChange}
            />
          )}
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          {settingsRef.current?.showLocation ? (
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowLocationPicker(true)}
            >
              <Feather name="map-pin" size={20} color="#666" />
              <Text style={[styles.inputText]}>Use current location</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.input}
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Feather name="map-pin" size={20} color="#666" />
            <Text
              style={[styles.inputText, !location && styles.placeholderText]}
            >
              {location || "Enter service location"}
            </Text>
          </TouchableOpacity>

          {isDropdownOpen && (
            <ScrollView
              style={styles.dropdownContent}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
            >
              {addresses.map((address, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.serviceItem,
                    index === addresses.length - 1 && styles.lastServiceItem,
                    location == address.address && styles.selectedServiceItem,
                  ]}
                  onPress={() => {
                    setLocation(address.address);
                    setIsDropdownOpen(false);
                  }}
                >
                  <View
                    style={[
                      styles.radio,
                      location == address.address && styles.radioSelected,
                    ]}
                  >
                    {location == address.address && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.serviceText,
                      location == address.address && styles.selectedServiceText,
                    ]}
                  >
                    {address.address}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Payment Options */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <TouchableOpacity
            style={styles.paymentSelector}
            onPress={() =>
              navigation.navigate("PaymentOptions", {
                setPaymentMethod: setPaymentMethod,
                setReferenceNo: setReferenceNumber,
                setReceipt: setReceipt,
                price: provider.price,
                providerId: provider.providerId,
              })
            }
          >
            <View style={styles.paymentSelectorLeft}>
              {paymentMethod ? (
                <>
                  {paymentMethod === "COD" ? (
                    <View style={styles.codIconContainer}>
                      <Feather name="dollar-sign" size={24} color="#FFB800" />
                    </View>
                  ) : (
                    <Image
                      source={
                        paymentMethod === "GCash"
                          ? require("../../../../assets/images/gcash.png")
                          : require("../../../../assets/images/maya.png")
                      }
                      style={styles.paymentMethodIcon}
                      resizeMode="contain"
                    />
                  )}
                  <View style={styles.paymentMethodInfo}>
                    <Text style={styles.paymentMethodText}>
                      {paymentMethod === "COD"
                        ? "Cash on Delivery"
                        : paymentMethod}
                    </Text>
                    <Text style={styles.paymentMethodSubtext}>
                      {paymentMethod === "COD"
                        ? "Pay when service is complete"
                        : `Pay with ${paymentMethod} e-wallet`}
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.noPaymentIcon}>
                    <Feather name="credit-card" size={24} color="#666" />
                  </View>
                  <View style={styles.paymentMethodInfo}>
                    <Text style={styles.selectPaymentText}>
                      Select Payment Method
                    </Text>
                    <Text style={styles.paymentMethodSubtext}>
                      Choose how you want to pay
                    </Text>
                  </View>
                </>
              )}
            </View>
            <Feather name="chevron-right" size={24} color="#DDD" />
          </TouchableOpacity>

          {/* Reference Number Input - Only show if payment method is selected and not COD */}
          {paymentMethod && paymentMethod !== "COD" && (
            <View style={styles.referenceNumberSection}>
              <TextInput
                style={styles.referenceNumberInput}
                placeholder="Enter reference number"
                editable={false}
                value={referenceNumber}
                onChangeText={setReferenceNumber}
              />
            </View>
          )}
        </View>

        {/* Additional Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <View style={styles.noteInput}>
            <TextInput
              style={styles.textInput}
              placeholder="Add notes for the service provider"
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Price Summary */}
        <View style={styles.priceSection}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service Fee</Text>
            <Text style={styles.priceValue}>₱{provider.price}</Text>
          </View>
          {/* <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Discount</Text>
            <Text style={styles.discountValue}>
              -₱{parseInt(provider.price) - parseInt(provider.discountedPrice)}
            </Text>
          </View> */}
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₱{provider.price}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Book Now Button */}
      <TouchableOpacity
        style={[styles.bookButton, loading && styles.disabledButton]}
        onPress={handleBooking}
        disabled={loading}
      >
        <Text style={styles.bookButtonText}>
          {loading ? "Processing..." : "Book Now"}
        </Text>
      </TouchableOpacity>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.successModal}>
            <View style={styles.successIconContainer}>
              <Feather name="check-circle" size={50} color="#4CAF50" />
            </View>

            <Text style={styles.successTitle}>Booking Successful!</Text>
            <Text style={styles.bookingId}>Booking ID: {bookingId}</Text>

            <View style={styles.bookingDetailsContainer}>
              <View style={styles.bookingDetailRow}>
                <Text style={styles.detailLabel}>Service:</Text>
                <Text style={styles.detailValue}>{provider.task}</Text>
              </View>
              <View style={styles.bookingDetailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>
                  {date ? date.toLocaleDateString() : null}
                </Text>
              </View>
              <View style={styles.bookingDetailRow}>
                <Text style={styles.detailLabel}>Time:</Text>
                <Text style={styles.detailValue}>
                  {time
                    ? time.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : null}
                </Text>
              </View>
              <View style={styles.bookingDetailRow}>
                <Text style={styles.detailLabel}>Total:</Text>
                <Text style={styles.detailValue}>₱{provider.price}</Text>
              </View>
              <View style={styles.bookingDetailRow}>
                <Text style={styles.detailLabel}>Payment Method:</Text>
                <Text style={styles.detailValue}>{paymentMethod}</Text>
              </View>
              <View style={styles.bookingDetailRow}>
                <Text style={styles.detailLabel}>Reference Number:</Text>
                <Text style={styles.detailValue}>{referenceNumber}</Text>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.viewBookingButton}
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.replace("JobStatus", { bookingId: bookingId });
                }}
              >
                <Text style={styles.viewBookingText}>View Booking</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.navigate("Main");
                }}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <LocationPickerModal
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelectLocation={handleLocationSelect}
      />
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
  },
  serviceCard: {
    margin: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  serviceImage: {
    width: "100%",
    height: 200,
  },
  serviceInfo: {
    padding: 16,
  },
  serviceTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 8,
  },
  estimatedTime: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
    marginRight: 8,
    textDecorationLine: "line-through",
  },
  discountPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFB800",
  },
  descriptionSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  serviceText: {
    fontSize: 16,
    color: "#1A1A1A",
  },
  selectedServiceText: {
    color: "#007AFF",
    fontWeight: "500",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#007AFF",
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666666",
    marginBottom: 16,
  },
  includesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  includeItem: {
    flexDirection: "row",
    marginBottom: 4,
    paddingLeft: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: "#666666",
    marginRight: 8,
  },
  includeText: {
    fontSize: 14,
    color: "#666666",
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",

    // marginBottom: 24,
    // backgroundColor: "#FFFFFF",
    // borderRadius: 16,
    // padding: 20,
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 1,
    // },
    // shadowOpacity: 0.08,
    // shadowRadius: 2.84,
    // elevation: 2,
    // zIndex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  inputText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333333",
  },
  dropdownContent: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8ECF2",
    maxHeight: 250,
  },
  placeholderText: {
    color: "#999999",
  },
  noteInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#333333",
  },
  priceSection: {
    padding: 16,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666666",
  },
  priceValue: {
    fontSize: 14,
    color: "#333333",
  },
  discountValue: {
    fontSize: 14,
    color: "#4CAF50",
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFB800",
  },
  bookButton: {
    backgroundColor: "#FFB800",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  successModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  successIconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  bookingId: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  bookingDetailsContainer: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  bookingDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  modalButtons: {
    gap: 12,
  },
  viewBookingButton: {
    backgroundColor: "#FFB800",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  viewBookingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  doneButton: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  doneButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  paymentSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  paymentSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  paymentSelectorLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  noPaymentIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    marginRight: 16,
  },
  codIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#FFF9E6",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  selectPaymentText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  paymentMethodSubtext: {
    fontSize: 14,
    color: "#999",
  },
  referenceNumberSection: {
    marginTop: 12,
  },
  referenceNumberInput: {
    borderWidth: 1,
    borderColor: "#F0F0F0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#333333",
    backgroundColor: "#FFFFFF",
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF2",
  },
  lastServiceItem: {
    borderBottomWidth: 0,
  },
  selectedServiceItem: {
    backgroundColor: "#F0F7FF",
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
});

export default BookServiceScreen;
