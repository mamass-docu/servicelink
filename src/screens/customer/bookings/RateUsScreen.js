import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAppContext } from "../../../../AppProvider";
import { useSelector } from "react-redux";
import {
  find,
  serverTimestamp,
  set,
  specificLoadingProcess,
  update,
} from "../../../helpers/databaseHelper";

const RateUsScreen = ({ navigation, route }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const { userId, userName, userImage } = useAppContext();
  const { bookingId, providerId } = route.params;

  const isLoading = useSelector((state) => state.loading.specific);

  const handleSubmit = () => {
    if (isLoading) return;

    if (rating === 0) {
      Alert.alert("Please select a rating."); // Validation
      return;
    }

    specificLoadingProcess(async () => {
      const providerSnap = await find("users", providerId);
      if (!providerSnap.exists()) {
        alert("Unable to find this provider!!!");
        return;
      }

      const providerData = providerSnap.data();
      await update("users", providerId, {
        ratingsTotal: (providerData.ratingsTotal ?? 0) + rating,
        reviews: (providerData.reviews ?? 0) + 1,
      });

      await set("ratings", bookingId, {
        rating: rating,
        comment: comment,
        ratedById: userId,
        ratedBy: userName,
        ratedByImage: userImage ?? null,
        providerId: providerId,
        ratedAt: serverTimestamp(),
      });

      await update("bookings", bookingId, { rated: true });

      Alert.alert("Thank you for your feedback!"); // Confirmation message
      navigation.goBack(); // Navigate back after submission
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <MaterialIcons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Your opinion matters to us!</Text>
        <Text style={styles.subtitle}>
          We work super hard to serve you better and would love to know how you
          would rate our app.
        </Text>
      </View>

      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <MaterialIcons
              name={star <= rating ? "star" : "star-border"}
              size={50}
              color="#FFB800"
            />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.commentLabel}>Comment (Optional)</Text>
      <TextInput
        style={styles.commentInput}
        multiline
        placeholder="Write your comment here..."
        value={comment}
        onChangeText={setComment}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Submit</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    marginBottom: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  commentLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    padding: 10,
    height: 100,
    marginBottom: 20,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#FFB800",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
    fontSize: 16,
  },
});

export default RateUsScreen;
