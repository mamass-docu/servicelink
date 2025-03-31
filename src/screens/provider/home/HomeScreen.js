import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAppContext } from "../../../../AppProvider";
import { useFocusEffect } from "@react-navigation/native";
import {
  addNotif,
  find,
  get,
  getNotifCount,
  loadingProcess,
  serverTimestamp,
  update,
  where,
} from "../../../helpers/databaseHelper";
import ProfileImageScreen from "../../components/ProfileImage";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../../../db/firebase";
import { DeclineModal } from "../../All/DeclineModal";

const JobRequestCard = ({ job, onAccept, onDecline }) => (
  <View style={styles.requestCard}>
    <View style={styles.requestHeader}>
      <View style={styles.customerInfo}>
        <ProfileImageScreen
          image={job.customerImage}
          name={job.customerName}
          style={styles.customerAvatar}
        />
        <View>
          <Text style={styles.customerName}>{job.customerName}</Text>
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, index) => (
              <Icon
                key={index}
                name="star"
                size={12}
                color={index < Math.floor(job.rating) ? "#FFB800" : "#DDDDDD"}
              />
            ))}
          </View>
        </View>
      </View>
      <Text style={styles.jobPrice}>₱{job.price}</Text>
    </View>

    <View style={styles.jobDetails}>
      <View style={styles.detailItem}>
        <Icon name="briefcase-outline" size={16} color="#666" />
        <Text style={styles.detailText}>
          {job.service}/{job.task}
        </Text>
      </View>
      <View style={styles.detailItem}>
        <Icon name="map-marker" size={16} color="#666" />
        <Text style={styles.detailText}>{job.address}</Text>
      </View>
    </View>

    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={styles.declineButton}
        onPress={() => onDecline(job)}
      >
        <Text style={styles.declineButtonText}>Decline</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.acceptButton}
        onPress={() => onAccept(job)}
      >
        <Text style={styles.acceptButtonText}>Accept</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const HomeScreen = ({ navigation }) => {
  const { userName, userId, userImage } = useAppContext();

  const [totalCompleted, setTotalCompleted] = useState(0);
  const [totalActive, setTotalActive] = useState(0);
  const [totalTodaysEarnings, setTotalTodaysEarnings] = useState(0);
  const [upcomingJobs, setUpcomingJobs] = useState([]);
  const [notifCount, setNotifCount] = useState(0);
  const [verified, setVerified] = useState(false);
  const [declineBooking, setDeclineBooking] = useState(null);
  const [ratings, setRatings] = useState(0);
  const [reviews, setReviews] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const today = new Date();

      const q = query(
        collection(db, "bookings"),
        where("providerId", "==", userId),
        where("status", "!=", "Cancelled")
      );

      const unsubs = onSnapshot(q, async (snapshot) => {
        let temp = [];
        let totalA = 0,
          totalE = 0,
          totalC = 0;
        for (const dd of snapshot.docs) {
          let d = dd.data();

          if (d.status == "Declined") {
            continue;
          }

          const date = d.createdAt.toDate();
          if (
            today.getFullYear() == date.getFullYear() &&
            today.getMonth() == date.getMonth() &&
            today.getDate() == date.getDate()
          ) {
            totalE += parseInt(d.price);
          }

          if (d.status == "Completed") {
            totalC++;
            continue;
          }

          if (d.status != "Pending") {
            totalA++;
            continue;
          }

          const usersnap = await find("users", d.customerId);
          temp.push({
            ...d,
            id: dd.id,
            customerImage: usersnap.exists() ? usersnap.data().image : null,
          });
        }
        setTotalActive(totalA);
        setTotalCompleted(totalC);
        setTotalTodaysEarnings(totalE);
        setUpcomingJobs(temp);
      });

      loadingProcess(async () => {
        const snap = await find("users", userId);
        const userData = snap.data();
        setVerified(userData.verified);
        setReviews(userData.reviews);
        const rate = userData.ratingsTotal
          ? parseFloat(userData.ratingsTotal / userData.reviews).toFixed(1)
          : 0;
        setRatings(rate);
        await refresh();
      });

      return () => {
        unsubs();
      };
    }, [])
  );

  async function refresh() {
    const c = await getNotifCount(userId);
    setNotifCount(c);
    // const snapshot = await get(
    //   "bookings",
    //   where("providerId", "==", userId),
    //   where("status", "!=", "Cancelled")
    // );
    // const today = new Date();

    // let temp = [];
    // let totalA = 0,
    //   totalE = 0,
    //   totalC = 0;
    // for (const dd of snapshot.docs) {
    //   let d = dd.data();

    //   if (d.status == "Declined") {
    //     continue;
    //   }

    //   const date = d.createdAt.toDate();
    //   if (
    //     today.getFullYear() == date.getFullYear() &&
    //     today.getMonth() == date.getMonth() &&
    //     today.getDate() == date.getDate()
    //   ) {
    //     totalE += parseInt(d.price);
    //   }

    //   if (d.status == "Completed") {
    //     totalC++;
    //     continue;
    //   }

    //   if (d.status != "Pending") {
    //     totalA++;
    //     continue;
    //   }

    //   const usersnap = await find("users", d.customerId);
    //   temp.push({
    //     ...d,
    //     id: dd.id,
    //     customerImage: usersnap.exists() ? usersnap.data().image : null,
    //   });
    // }
    // setTotalActive(totalA);
    // setTotalCompleted(totalC);
    // setTotalTodaysEarnings(totalE);
    // setUpcomingJobs(temp);
  }

  const handleAcceptJob = (job) => {
    Alert.alert(
      "Accept Booking",
      "Are you sure you want to accept this booking?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Accept",
          onPress: () =>
            loadingProcess(async () => {
              await update("bookings", job.id, {
                status: "Confirmed",
                confirmedAt: serverTimestamp(),
              });
              addNotif(
                job.customerId,
                "Confirmed",
                "Your booking has been confirmed.",
                "JobStatus",
                { bookingId: job.id }
              );

              // await refresh();

              Alert.alert("Success", "Booking request accepted");
            }),
        },
      ]
    );
  };

  const handleDeclineJob = (job) => {
    // Alert.alert(
    //   "Decline Booking",
    //   "Are you sure you want to decline this booking?",
    //   [
    //     {
    //       text: "Cancel",
    //       style: "cancel",
    //     },
    //     {
    //       text: "Decline",
    //       onPress: async () =>
    //         loadingProcess(async () => {
    //           await update("bookings", job.id, {
    //             status: "Declined",
    //             declinedAt: serverTimestamp(),
    //           });
    //           addNotif(
    //             job.customerId,
    //             "Declined",
    //             "Your booking has been declined.",
    //             "JobStatus",
    //             { bookingId: job.id }
    //           );
    //           // await refresh();
    //           Alert.alert("Success", "Booking request declined");
    //         }),
    //     },
    //   ]
    // );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar backgroundColor="#FFB800" barStyle="light-content" />

      {/* Provider Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.profileSection}>
            <ProfileImageScreen
              image={userImage}
              name={userName}
              style={styles.profileImage}
            />
            {/* <Image
              source={{
                uri: userImage,
              }}
              style={styles.profileImage}
            /> */}
            <View>
              <Text style={styles.greetingText}>Welcome!</Text>
              <Text style={styles.providerName}>{userName}</Text>
            </View>
          </View>
          <View style={styles.notificationContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Notifications")}
              style={styles.notificationButton}
            >
              <Icon name="bell" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.requestBadge}>
              <Text style={styles.requestCount}>{notifCount}</Text>
            </View>
          </View>
        </View>

        {/* Rating Card */}
        <View style={styles.ratingCard}>
          <View style={styles.ratingInfo}>
            <Icon name="star" size={24} color="#FFB800" />
            <Text style={styles.ratingText}>{ratings}</Text>
            <Text style={styles.reviewCount}>({reviews} reviews)</Text>
          </View>
          {verified ? (
            <Text style={styles.verifiedText}>
              <Icon name="check-circle" size={16} color="#4CAF50" /> Verified
              Provider
            </Text>
          ) : (
            <Text
              style={{
                color: "#e67f12",
                fontSize: 14,
              }}
            >
              <Icon name="check-circle" size={16} color="#e67f12" /> Not
              Verified Provider
            </Text>
          )}
        </View>
      </View>

      {verified ? null : (
        <View
          style={{
            backgroundColor: "#16c47f",
            height: 63,
            marginTop: -27,
            zIndex: 1,
            flex: 1,
            justifyContent: "flex-end",
            padding: 10,
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate("VerificationStatus")}
          >
            <Text
              style={{
                fontSize: 15,
                marginLeft: 13,
                fontWeight: 500,
                color: "#fff",
              }}
            >
              Verify to full access
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.serviceCard}>
          <Icon name="cash" size={24} color="#FFB800" />
          <Text style={styles.serviceCardTitle}>Today's Earnings</Text>
          <Text style={styles.serviceCardCount}>₱{totalTodaysEarnings}</Text>
        </View>
        <View style={styles.serviceCard}>
          <Icon name="briefcase-check" size={24} color="#FFB800" />
          <Text style={styles.serviceCardTitle}>Completed Jobs</Text>
          <Text style={styles.serviceCardCount}>{totalCompleted}</Text>
        </View>
        <View style={styles.serviceCard}>
          <Icon name="calendar-clock" size={24} color="#FFB800" />
          <Text style={styles.serviceCardTitle}>Active Jobs</Text>
          <Text style={styles.serviceCardCount}>{totalActive}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.viewBookingsButton}
          onPress={() => navigation.navigate("BookingsTab")}
        >
          <Icon name="calendar-check" size={20} color="#FFF" />
          <Text style={styles.viewBookingsText}>View Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.viewShopButton}
          onPress={() => navigation.navigate("Shop")}
        >
          <Icon name="store" size={20} color="#FFB800" />
          <Text style={styles.viewShopText}>View Shop</Text>
        </TouchableOpacity>
      </View>

      {/* Job Requests */}
      <View style={styles.jobsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {upcomingJobs.length} New Service Requests
          </Text>
        </View>

        {upcomingJobs.map((job) => (
          <JobRequestCard
            key={job.id}
            job={job}
            onAccept={handleAcceptJob}
            onDecline={() =>
              setDeclineBooking({ id: job.id, customerId: job.customerId })
            }
          />
        ))}
      </View>

      <DeclineModal
        booking={declineBooking}
        onCancel={() => setDeclineBooking(null)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#FFB800",
    paddingTop: 60,
    paddingHorizontal: 20,
    zIndex: 5,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  greetingText: {
    color: "#FFF",
    fontSize: 14,
  },
  providerName: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "600",
  },
  notificationContainer: {
    position: "relative",
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  requestBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF4444",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
  },
  requestCount: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  ratingCard: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
    marginRight: 4,
  },
  reviewCount: {
    color: "#666",
  },
  verifiedText: {
    color: "#4CAF50",
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    gap: 12,
  },
  serviceCard: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    elevation: 2,
  },
  serviceCardTitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  serviceCardCount: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "row",
    marginHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  viewBookingsButton: {
    flex: 1,
    height: 45,
    flexDirection: "row",
    backgroundColor: "#FFB800",
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 2,
  },
  viewShopButton: {
    flex: 1,
    height: 45,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#FFB800",
    elevation: 2,
  },
  viewBookingsText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  viewShopText: {
    color: "#FFB800",
    fontSize: 15,
    fontWeight: "600",
  },
  jobsSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  requestCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: "row",
    gap: 2,
  },
  jobPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  jobDetails: {
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 14,
  },
  declineButton: {
    flex: 1,
    height: 45,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButton: {
    flex: 1,
    height: 45,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  declineButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  acceptButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  noBookingsContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 15,
    elevation: 2,
  },
  noBookingsText: {
    color: "#666",
    fontSize: 16,
  },
});

export default HomeScreen;
