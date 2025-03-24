import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppContext } from "../../../../AppProvider";
import { useFocusEffect } from "@react-navigation/native";
import {
  addNotif,
  get,
  loadingProcess,
  orderBy,
  serverTimestamp,
  update,
  where,
} from "../../../helpers/databaseHelper";
import ProfileImageScreen from "../../components/ProfileImage";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../../../db/firebase";
import CancelBookingModal from "../../components/CancelBookingModal";

const CustomerBookingsScreen = ({ navigation }) => {
  const { userId, userRole, userName } = useAppContext();

  const [activeTab, setActiveTab] = useState("upcoming");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelData, setCancelData] = useState(null);

  const [bookings, setBookings] = useState({
    upcoming: [],
    completed: [],
  });

  // const refresh = async () => {
  //   const querySnapshot = await get(
  //     "bookings",
  //     where("customerId", "==", userId),
  //     where("status", "!=", "Cancelled"),
  //     orderBy("createdAt", "desc")
  //   );
  //   let upcoming = [];
  //   let completed = [];
  //   const usersSnap = await get("users", where("role", "==", "Provider"));
  //   let users = {};
  //   for (const d of usersSnap.docs) {
  //     const userImage = d.data().image;
  //     users[d.id] = userImage;
  //   }

  //   for (const serviceDoc of querySnapshot.docs) {
  //     const serviceData = serviceDoc.data();
  //     if (serviceData.status != "Completed")
  //       upcoming.push({
  //         id: serviceDoc.id,
  //         ...serviceData,
  //         providerImage: users[serviceData.providerId],
  //       });
  //     else
  //       completed.push({
  //         id: serviceDoc.id,
  //         ...serviceData,
  //         providerImage: users[serviceData.providerId],
  //       });
  //   }

  //   setBookings({
  //     upcoming: upcoming,
  //     completed: completed,
  //   });
  // };

  useFocusEffect(
    useCallback(() => {
      const q = query(
        collection(db, "bookings"),
        where("customerId", "==", userId),
        where("status", "!=", "Cancelled"),
        orderBy("createdAt", "desc")
      );
      const unsubs = onSnapshot(q, (snap) => {
        let upcoming = [];
        let completed = [];
        for (const serviceDoc of snap.docs) {
          const serviceData = serviceDoc.data();
          if (serviceData.status != "Completed")
            upcoming.push({
              id: serviceDoc.id,
              ...serviceData,
              providerImage: users[serviceData.providerId],
            });
          else
            completed.push({
              id: serviceDoc.id,
              ...serviceData,
              providerImage: users[serviceData.providerId],
            });
        }

        setBookings({
          upcoming: upcoming,
          completed: completed,
        });
      });

      let users = {};
      loadingProcess(async () => {
        const usersSnap = await get("users", where("role", "==", "Provider"));
        for (const d of usersSnap.docs) {
          const userImage = d.data().image;
          users[d.id] = userImage;
        }
      });

      return () => {
        unsubs();
      };
    }, [])
  );

  const onCancel = (id, providerId) => {
    setCancelData({
      bookingId: id,
      otherUserId: providerId,
    });
    setShowCancelModal(true);
    // loadingProcess(async () => {
    //   await update("bookings", id, {
    //     status: "Cancelled",
    //     cancelledAt: serverTimestamp(),
    //   });

    //   addNotif(
    //     providerId,
    //     `${userName} Cancelled a booking`,
    //     `This booking has been cancelled.`,
    //     "JobStatus",
    //     { bookingId: id }
    //   );
    //   // await refresh();
    // });
  };

  const BookingCard = (booking) => {
    const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
        case "pending":
          return "#FFB800";
        case "confirmed":
          return "#4CAF50";
        case "completed":
          return "#2196F3";
        case "cancelled":
          return "#F44336";
        default:
          return "#666666";
      }
    };

    return (
      <View key={booking.id}>
        <TouchableOpacity
          style={styles.bookingCard}
          onPress={
            () => navigation.navigate("JobStatus", { bookingId: booking.id })
            // navigation.navigate("JobStatus", {
            //   user: {
            //     id:
            //       userRole == "Customer"
            //         ? booking.customerId
            //         : booking.providerId,
            //     name:
            //       userRole == "Customer"
            //         ? booking.customerName
            //         : booking.providerName,
            //     image:
            //       userRole == "Customer"
            //         ? booking.customerImage
            //         : booking.providerImage,
            //     date: booking.date,
            //     time: booking.time,
            //     address: booking.address,
            //     status: booking.status,
            //     createdAt: booking.createdAt,
            //     confirmedAt: booking.confirmedAt,
            //     rejectedAt: booking.rejectedAt,
            //     completedAt: booking.completedAt,
            //   },
            // })
          }
        >
          <View style={styles.cardHeader}>
            <ProfileImageScreen
              image={booking.providerImage}
              name={booking.providerName}
              style={styles.providerImage}
            />
            <View style={styles.headerInfo}>
              <Text style={styles.providerName}>{booking.providerName}</Text>
              <Text style={styles.serviceType}>{booking.service}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(booking.status)}20` },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(booking.status) },
                ]}
              >
                {booking.status}
              </Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Feather name="calendar" size={16} color="#666" />
                <Text style={styles.infoText}>{booking.date}</Text>
              </View>
              <View style={styles.infoItem}>
                <Feather name="clock" size={16} color="#666" />
                <Text style={styles.infoText}>{booking.time}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Total Amount</Text>
              <Text style={styles.priceValue}>₱{booking.price}</Text>
            </View>

            {booking.status === "Completed" ? (
              booking.rated ? null : (
                <TouchableOpacity
                  style={styles.rateUsButton}
                  onPress={() => {
                    navigation.navigate("RateUs", {
                      bookingId: booking.id,
                      providerId: booking.providerId,
                    });
                  }}
                >
                  <Text style={styles.rateUsButtonText}>Rate Us</Text>
                </TouchableOpacity>
              )
            ) : booking.status != "Completed" &&
              booking.status != "Declined" ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => onCancel(booking.id, booking.providerId)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "upcoming" && styles.activeTab]}
          onPress={() => setActiveTab("upcoming")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "upcoming" && styles.activeTabText,
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "completed" && styles.activeTab]}
          onPress={() => setActiveTab("completed")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "completed" && styles.activeTabText,
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      {/* <ListScreen
        data={bookings[activeTab]}
        contentContainerStyle={styles.bookingsList}
        renderItem={BookingCard}
      /> */}
      <ScrollView
        style={styles.bookingsList}
        showsVerticalScrollIndicator={false}
      >
        {bookings[activeTab].map((booking) => BookingCard(booking))}

        {bookings[activeTab].length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="calendar" size={50} color="#CCC" />
            <Text style={styles.emptyStateText}>No bookings found</Text>
          </View>
        )}
      </ScrollView>

      <CancelBookingModal
        visible={showCancelModal}
        onClose={() => {
          setCancelData(null);
          setShowCancelModal(false);
        }}
        bookingId={cancelData?.bookingId}
        otherUserId={cancelData?.otherUserId}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  declineButton: {
    flex: 1,
    height: 45,
    backgroundColor: "#ecdbda",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  declineButtonText: {
    color: "#FF0000",
    fontSize: 14,
    fontWeight: "600",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333333",
  },
  tabContainer: {
    flexDirection: "row",
    padding: 20,
    paddingTop: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#FFB800",
  },
  tabText: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#FFB800",
  },
  bookingsList: {
    flex: 1,
    padding: 20,
  },
  bookingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  providerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  providerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 14,
    color: "#666666",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666666",
  },
  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666666",
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#FFF5F5",
  },
  cancelButtonText: {
    color: "#F44336",
    fontWeight: "500",
  },
  rateUsButton: {
    backgroundColor: "#FFB800",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  rateUsButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  rescheduleButton: {
    backgroundColor: "#FFB80020",
  },
  rescheduleButtonText: {
    color: "#FFB800",
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666666",
  },
});

export default CustomerBookingsScreen;
