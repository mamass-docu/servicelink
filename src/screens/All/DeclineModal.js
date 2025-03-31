import {
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  addNotif,
  loadingProcess,
  serverTimestamp,
  update,
} from "../../helpers/databaseHelper";
import { useEffect, useState } from "react";

export const DeclineModal = ({ onCancel, booking, navigation }) => {
  const [reason, setReason] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(booking ? true : false);
    setReason("");
  }, [booking]);

  const onSave = () => {
    if (reason.trim() == "") {
      alert("Please enter a reason");
      return;
    }

    loadingProcess(async () => {
      await update("bookings", booking?.id, {
        status: "Declined",
        declineReason: reason,
        declinedAt: serverTimestamp(),
      });
      addNotif(
        booking.customerId,
        "Declined",
        "Your booking has been declined.",
        "JobStatus",
        { bookingId: booking?.id }
      );
      Alert.alert("Success", "Booking request declined");
      onCancel();
      if (navigation)
        navigation.navigate("JobStatus", { bookingId: booking?.id });
    });
  };

  return (
    <Modal visible={show} transparent={true} animationType="fade">
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            padding: 20,
            margin: 20,
            borderRadius: 10,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "800",
            }}
          >
            Decline Booking
          </Text>

          <Text
            style={{
              fontSize: 15,
              marginTop: 10,
              color: "#666666",
            }}
          >
            Reason
          </Text>

          <TextInput
            placeholder="Please provide a decline reason"
            style={{
              borderWidth: 2,
              borderColor: "#8f1ee7",
              marginTop: 10,
              padding: 15,
              minHeight: 70,
              fontSize: 15,
            }}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={reason}
            onChangeText={(e) => setReason(e)}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              marginTop: 30,
            }}
          >
            <TouchableOpacity style={{}} onPress={onCancel}>
              <Text
                style={{ color: "#8f1ee7", fontSize: 17, fontWeight: "700" }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: 5 }} onPress={onSave}>
              <Text
                style={{
                  color: "#e73e1e",
                  fontSize: 17,
                  fontWeight: "700",
                  marginLeft: 10,
                }}
              >
                Decline
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
