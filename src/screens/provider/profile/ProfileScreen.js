import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StatusBar,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppContext } from "../../../../AppProvider";
import { useFocusEffect } from "@react-navigation/native";
import {
  update,
  loadingProcess,
  count,
  where,
  find,
} from "../../../helpers/databaseHelper";
import { selectImage } from "../../../helpers/ImageSelector";
import { uploadImage } from "../../../helpers/cloudinary";
import { logout } from "../../../db/UpdateUser";
import ProfileImageScreen from "../../components/ProfileImage";

const ProfileScreen = ({ navigation }) => {
  const { userName, userId, userImage, setUserImage, setUserId } =
    useAppContext();
  const [profile, setProfile] = useState({
    totalCompleted: 0,
    ratings: 0,
    reviews: 0,
    service: null,
    verified: false,
  });

  useFocusEffect(
    useCallback(() => {
      loadingProcess(async () => {
        const completedCount = await count(
          "bookings",
          where("providerId", "==", userId),
          where("status", "==", "Completed")
        );
        // setTotalCompleted(completedCount);

        const userSnap = await find("users", userId);
        const data = userSnap.data();
        // setReviews(data.reviews);
        const rate = data.ratingsTotal
          ? parseFloat(data.ratingsTotal / data.reviews).toFixed(1)
          : 0;
        // setRatings(rate);

        setProfile({
          totalCompleted: completedCount,
          ratings: rate,
          reviews: data.reviews,
          service: data.service,
          verified: data.verified,
        });
      });
    }, [])
  );

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => {
          loadingProcess(
            async () => {
              await logout(userId, setUserId, true);

              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            },
            (error) => {
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          );
        },
      },
    ]);
  };

  const MenuItem = ({ icon, title, onPress, color = "#666" }) => (
    <TouchableOpacity
      style={[styles.menuItem, title === "Logout" && styles.logoutButton]}
      onPress={onPress}
    >
      <View style={styles.menuIconContainer}>
        <Feather name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.menuText, { color: color }]}>{title}</Text>
      <Feather name="chevron-right" size={22} color={color} />
    </TouchableOpacity>
  );

  const updateProfileImage = async () => {
    const image = await selectImage();
    if (!image) return;

    // const imageName = image.fileName;
    // const imageExtension = imageName.substring(imageName.lastIndexOf("."));
    // const filename = `${userId}${imageExtension}`;

    loadingProcess(
      async () => {
        // await deleteImage(userImage);
        const imgUrl = await uploadImage(image, userId);

        await update("users", userId, {
          image: imgUrl,
        });

        // updateProviderUserImage(userId, imgUrl);

        setUserImage(imgUrl);
        alert("Image uploaded successfully!");
      },
      (e) => {
        alert(e);
      }
    );
  };

  return (
    <>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.imageContainer}>
              <ProfileImageScreen
                image={userImage}
                name={userName}
                style={styles.profileImage}
              />
              <TouchableOpacity
                style={styles.editImageButton}
                onPress={updateProfileImage}
              >
                <Feather name="camera" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profession}>{profile.service}</Text>

            <View style={styles.ratingContainer}>
              <Feather name="star" size={20} color="#FFB800" />
              <Text style={styles.ratingText}>{profile.ratings}</Text>
              <Text style={styles.reviewCount}>
                ({profile.reviews} reviews)
              </Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile.totalCompleted}</Text>
                <Text style={styles.statLabel}>Jobs Done</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                {profile.verified ? null : (
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#FF0000",
                    }}
                  >
                    Not
                  </Text>
                )}
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: profile.verified ? "#4CAF50" : "#FF0000",
                  }}
                >
                  Verified
                </Text>
              </View>
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            <MenuItem
              icon="edit"
              title="Edit Profile"
              onPress={() => navigation.navigate("EditProfile")}
            />
            <MenuItem
              icon="clock" // Changed icon to clock
              title="Manage Availability"
              onPress={() => navigation.navigate("BusinessHours")}
            />
            <MenuItem
              icon="inbox"
              title="Transactions"
              onPress={() => navigation.navigate("Transactions")}
            />
            <MenuItem
              icon="shield"
              title="Verification Status"
              onPress={() => navigation.navigate("VerificationStatus")}
            />
            <MenuItem
              icon="dollar-sign"
              title="Payment Methods"
              onPress={() => navigation.navigate("AddGCashPaymentMethod")}
            />
            {/* <MenuItem
              icon="image"
              title="Add New Image to Gallery"
              onPress={() => navigation.navigate("AddGallery")}
            /> */}
            <MenuItem
              icon="credit-card"
              title="Pay Bills"
              onPress={() => navigation.navigate("PayBills")}
            />
            <MenuItem
              icon="help-circle"
              title="Help & Support"
              onPress={() => navigation.navigate("HelpAndSupport")}
            />
            <MenuItem
              icon="settings"
              title="Settings"
              onPress={() => navigation.navigate("Settings")}
            />
            <MenuItem
              icon="log-out"
              title="Logout"
              onPress={handleLogout}
              color="#FF4444"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#FFB800",
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFB800",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  profession: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    width: "90%",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#DDD",
    marginHorizontal: 15,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  menuContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F8F9FA",
    marginBottom: 8,
    borderRadius: 12,
  },
  menuIconContainer: {
    width: 24,
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 12,
    marginBottom: 30,
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FFE5E5",
  },
});

export default ProfileScreen;
