import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAppContext } from "../../../AppProvider";
import {
  addNotif,
  find,
  get,
  loadingProcess,
  serverTimestamp,
  setIsLoading,
  update,
  updateAllAsSeen,
} from "../../helpers/databaseHelper";
import ProfileImageScreen from "../components/ProfileImage";
import { useFocusEffect } from "@react-navigation/native";
import { DateTimeConverter } from "../../helpers/DateTimeConverter";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../db/firebase";
import CancelBookingModal from "../components/CancelBookingModal";

const Status = ({ active, text, date }) => {
  if (!date) return;

  return (
    <View>
      {!active && (
        <View
          style={[styles.timelineConnector, active && styles.activeConnector]}
        />
      )}

      <View style={[styles.timelineDot, active && styles.activeDot]} />
      <Text style={[styles.timelineText, active && styles.activeText]}>
        {text}
      </Text>
      <Text style={styles.timelineTime}>{date}</Text>
    </View>
  );
};

const JobStatusScreen = ({ route, navigation }) => {
  const { userRole, userId, settingsRef } = useAppContext();
  const { bookingId } = route.params;
  const [currentStatus, setCurrentStatus] = useState(null);
  const [progressAt, setProgressAt] = useState(null);
  const [completedAt, setCompletedAt] = useState(null);
  const [doneAt, setDoneAt] = useState(null);
  const [user, setUser] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let loaded = false;
      setIsLoading(true);
      const q = doc(db, "bookings", bookingId);
      const unsubs = onSnapshot(q, async (snap) => {
        try {
          updateAllAsSeen(userId, "JobStatus");
          if (!snap.exists()) {
            alert("Unable to find this booking!!!");
            return;
          }

          const booking = snap.data();
          const id =
            userRole == "Provider" ? booking.customerId : booking.providerId;

          const userSnap = await find("users", id);

          setCurrentStatus(booking.status);
          setCompletedAt(DateTimeConverter(booking.completedAt));
          setProgressAt(DateTimeConverter(booking.progressAt));
          setDoneAt(DateTimeConverter(booking.doneAt));

          setUser({
            id: id,
            bookingId: snap.id,
            name:
              userRole == "Provider"
                ? booking.customerName
                : booking.providerName,
            image: userSnap.exists() ? userSnap.data().image : null,
            date: booking.date,
            time: booking.time,
            receipt: booking.receipt,
            providerAddress: userSnap.exists() ? userSnap.data().address : null,
            address: booking.address,
            task: booking.task,
            declineReason: booking.declineReason,
            service: booking.service,
            price: booking.price,
            cancelReason: booking.cancelReason,
            paymentMethod: booking.paymentMethod,
            referenceNumber: booking.referenceNumber,
            createdAt: DateTimeConverter(booking.createdAt),
            confirmedAt: DateTimeConverter(booking.confirmedAt),
            declinedAt: DateTimeConverter(booking.declinedAt),
            cancelledAt: DateTimeConverter(booking.cancelledAt),
          });
        } finally {
          if (loaded) return;

          setIsLoading(false);
          loaded = true;
        }
      });

      return () => {
        unsubs();
      };
    }, [])
  );

  const updateStatus = async (
    statusV,
    dateName,
    title,
    body,
    setDateValue,
    alertMessage
  ) => {
    let data = { status: statusV };
    const datetime = serverTimestamp();
    data[dateName] = datetime;
    await update("bookings", user?.bookingId, data);
    addNotif(user?.id, title, body, "JobStatus", {
      bookingId: user?.bookingId,
    });
    Alert.alert("Status Updated", alertMessage);
  };

  const handleConfirm = () =>
    loadingProcess(
      async () => {
        await update("bookings", user?.bookingId, {
          status: "Completed",
          doneAt: serverTimestamp(),
        });
        addNotif(
          user?.id,
          "Booking Confirmation",
          "Booking was confirmed as completed by customer",
          "JobStatus",
          {
            bookingId: user?.bookingId,
          }
        );
        Alert.alert(
          "Status Updated",
          "Successfully confirmed service completion."
        );
      },
      (error) => {
        console.error("Error updating status:", error);
        Alert.alert("Error", "Failed to confirm!!!");
      }
    );

  const handleDecline = () =>
    loadingProcess(
      async () => {
        await update("bookings", user?.bookingId, {
          status: "On Process",
        });
        addNotif(
          user?.id,
          "Booking Confirmation",
          "Booking was declined as completed by customer",
          "JobStatus",
          {
            bookingId: user?.bookingId,
          }
        );
        Alert.alert(
          "Status Updated",
          "Successfully declined service completion."
        );
      },
      (error) => {
        console.error("Error updating status:", error);
        Alert.alert("Error", "Failed to decline!!!");
      }
    );

  const handleStatusUpdate = () =>
    loadingProcess(
      async () => {
        if (currentStatus === "Confirmed") {
          await updateStatus(
            "On Process",
            "progressAt",
            "Booking Status Updated",
            "Your booking is now on progress",
            setProgressAt,
            "Service is now in progress."
          );
        } else if (currentStatus === "On Process") {
          await updateStatus(
            "Waiting for Confirmation",
            "completedAt",
            "Booking Status Updated",
            "Your booking is now completed, Please confirm.",
            setCompletedAt,
            "Service has been completed."
          );
        }
      },
      (error) => {
        console.error("Error updating status:", error);
        Alert.alert("Error", "Failed to update status");
      }
    );

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const getCancelButton = () => {
    if (currentStatus != "Confirmed" && currentStatus != "On Process") return;

    return (
      <TouchableOpacity
        style={{
          paddingVertical: 16,
          marginHorizontal: 16,
          borderRadius: 8,
          alignItems: "center",
          backgroundColor: "#F44336",
          marginBottom: 10,
        }}
        onPress={handleCancel}
      >
        <Text
          style={{
            color: "#fff",
            fontWeight: "500",
          }}
        >
          Cancel Booking
        </Text>
      </TouchableOpacity>
    );
  };

  const getStatusButton = () => {
    if (userRole != "Provider") {
      if (currentStatus == "Waiting for Confirmation" && !doneAt) {
        return (
          <View
            style={{
              flexDirection: "row",
              flex: 1,
              justifyContent: "space-between",
              marginHorizontal: 16,
              gap: 10,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: "#6C3EE9",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                borderRadius: 8,
                gap: 8,
                width: "45%",
              }}
              onPress={handleConfirm}
            >
              <Text style={styles.goToJobText}>Confirm</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: "#FF0000",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                borderRadius: 8,
                gap: 8,
                width: "45%",
              }}
              onPress={handleDecline}
            >
              <Text style={styles.goToJobText}>Decline</Text>
            </TouchableOpacity>
          </View>
        );
      }
      return;
    }

    if (currentStatus == "Confirmed")
      return (
        <TouchableOpacity
          style={styles.goToJobButton}
          onPress={handleStatusUpdate}
        >
          <Icon name="bicycle" size={24} color="#FFF" />
          <Text style={styles.goToJobText}>Go to Service</Text>
        </TouchableOpacity>
      );
    if (currentStatus === "On Process")
      return (
        <TouchableOpacity
          style={[styles.goToJobButton, { backgroundColor: "#6C3EE9" }]}
          onPress={handleStatusUpdate}
        >
          <Icon name="check-circle" size={24} color="#FFF" />
          <Text style={styles.goToJobText}>Complete Service</Text>
        </TouchableOpacity>
      );
  };

  const onMessage = () => {
    if (!user) return;

    navigation.navigate("Message", {
      otherUserId: user.id,
      otherUserName: user.name,
      otherUserImage: user.image,
    });
  };

  const viewReceipt = () => {
    navigation.navigate("ImagePreview", { image: user?.receipt });
  };

  const onShowLocation = () => {
    const address =
      userRole == "Provider" ? user?.address : user?.providerAddress;

    if (!address) {
      alert("Address not found!!!");
      return;
    }

    navigation.navigate("LocationViewer", { address: address });
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
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Detail</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        {/* Customer Card */}
        <View style={styles.customerCard}>
          <View style={styles.customerInfo}>
            <ProfileImageScreen
              image={user?.image}
              name={user?.name}
              style={styles.customerImage}
            />
            <View style={styles.customerDetails}>
              <Text style={styles.customerName}>{user?.name}</Text>
              <Text style={styles.serviceType}>{user?.service}</Text>
            </View>
          </View>

          <View style={styles.contactButtons}>
            <TouchableOpacity style={styles.iconButton}>
              {/* <Icon name="phone" size={20} color="#6C3EE9" /> */}
            </TouchableOpacity>
            <TouchableOpacity onPress={onMessage} style={styles.iconButton}>
              <Icon name="message-text" size={20} color="#6C3EE9" />
            </TouchableOpacity>
          </View>

          <View style={styles.bookingDetails}>
            <View style={styles.detailRow}>
              <View>
                <Text style={styles.detailLabel}>Service</Text>
                <Text style={styles.detailValue}>
                  {user?.task}/{user?.service}
                </Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.firstRow}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{user?.date}</Text>
              </View>
              <View>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{user?.time}</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.firstRow}>
                <Text style={styles.detailLabel}>Address</Text>
                <Text style={styles.detailValue}>{user?.address}</Text>
              </View>
              <View>
                <Text style={styles.detailLabel}>Price</Text>
                <Text style={styles.detailValue}>₱{user?.price}</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.firstRow}>
                <Text style={styles.detailLabel}>Payment Method</Text>
                <Text style={styles.detailValue}>{user?.paymentMethod}</Text>
              </View>
              {user?.referenceNumber ? (
                <View>
                  <Text style={styles.detailLabel}>Reference Number</Text>
                  <Text style={styles.detailValue}>
                    {user?.referenceNumber}
                  </Text>
                </View>
              ) : null}
            </View>
            <View style={styles.detailRow}>
              <View style={styles.firstRow}>
                <Text style={styles.detailLabel}>Receipt </Text>
                <TouchableOpacity onPress={viewReceipt}>
                  <Text
                    style={{
                      color: "#007BFF", // Highlight color for the clickable text
                      fontSize: 14,
                      fontWeight: "600",
                      marginTop: 8,
                    }}
                  >
                    View Receipt
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            {user?.cancelReason ? (
              <View style={styles.detailRow}>
                <View>
                  <Text style={styles.detailLabel}>Cancel Reason</Text>
                  <Text style={styles.detailValue}>{user?.cancelReason}</Text>
                </View>
              </View>
            ) : null}
            {user?.declineReason ? (
              <View style={styles.detailRow}>
                <View>
                  <Text style={styles.detailLabel}>Decline Reason</Text>
                  <Text style={styles.detailValue}>{user?.declineReason}</Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>

        {/* Status Buttons */}
        {getCancelButton()}

        {getStatusButton()}

        {settingsRef.current.showLocation ? (
          <TouchableOpacity
            style={{
              backgroundColor: "#4CAF50",
              flexDirection: "row",
              marginTop: 10,
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              marginHorizontal: 16,
              borderRadius: 8,
              gap: 8,
            }}
            onPress={onShowLocation}
          >
            <Text
              style={{
                color: "#FFF",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              View Location
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* Service Status Section */}
        <View style={styles.statusSection}>
          <Text style={styles.statusTitle}>Service Status</Text>
          <View style={styles.statusTimeline}>
            <View style={styles.timelineItem}>
              <Status
                active={currentStatus == "Pending"}
                text="Service is Pending"
                date={user?.createdAt}
              />
              <Status
                active={currentStatus == "Declined"}
                text="Service Declined"
                date={user?.declinedAt}
              />
              <Status
                active={currentStatus == "Confirmed"}
                text="Service Accepted"
                date={user?.confirmedAt}
              />
              <Status
                active={currentStatus == "On Process"}
                text="Service On Process"
                date={progressAt}
              />
              {!doneAt && currentStatus == "Waiting for Confirmation" ? (
                <View>
                  <View style={[styles.timelineDot, styles.activeDot]} />
                  <Text style={[styles.timelineText, styles.activeText]}>
                    Service Waiting for Confirmation
                  </Text>
                </View>
              ) : null}
              {doneAt && currentStatus == "Completed" ? (
                <Status
                  active={doneAt && currentStatus == "Completed"}
                  text="Service Completed"
                  date={completedAt}
                />
              ) : null}
              <Status
                active={currentStatus == "Cancelled"}
                text="Service Cancelled"
                date={user?.cancelledAt}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <CancelBookingModal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        bookingId={bookingId}
        otherUserId={user?.id}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  customerCard: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  customerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 14,
    color: "#666",
  },
  contactButtons: {
    flexDirection: "row",
    position: "absolute",
    right: 16,
    top: 16,
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  bookingDetails: {
    marginTop: 16,
  },
  detailRow: {
    marginBottom: 12,
    flexDirection: "row",
  },
  secondRow: {
    width: "40%",
  },
  firstRow: {
    width: "60%",
  },
  detailLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
  },
  goToJobButton: {
    backgroundColor: "#6C3EE9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  goToJobText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  statusSection: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
  },
  statusTimeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: "column",
    marginBottom: 24,
    position: "relative",
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#DDD",
    marginRight: 5,
    marginBottom: -5,
  },
  activeDot: {
    backgroundColor: "#4CAF50",
  },
  timelineConnector: {
    position: "absolute",
    left: 5,
    top: 0,
    width: 2,
    height: 50,
    backgroundColor: "#DDD",
  },
  activeConnector: {
    backgroundColor: "#4CAF50",
  },
  timelineText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 18,
  },
  activeText: {
    color: "#333",
    fontWeight: "500",
  },
  timelineTime: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    marginLeft: 18,
  },
});

export default JobStatusScreen;
