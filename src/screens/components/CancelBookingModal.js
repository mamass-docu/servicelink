import { useState } from "react";
import { Modal, TextInput, TouchableOpacity, View, Text } from "react-native";
import {
  addNotif,
  loadingProcess,
  serverTimestamp,
  update,
} from "../../helpers/databaseHelper";

export default function CancelBookingModal({
  visible,
  onClose,
  bookingId,
  otherUserId,
}) {
  const [reason, setReason] = useState("");

  const onCancel = () => {
    const val = reason.trim();
    if (val == "") {
      alert("Please provide reason to confirm cancellation!");
      return;
    }

    loadingProcess(async () => {
      await update("bookings", bookingId, {
        status: "Cancelled",
        cancelReason: val,
        cancelledAt: serverTimestamp(),
      });
      addNotif(
        otherUserId,
        `Booking Status Updated`,
        `This booking has been cancelled.`,
        "JobStatus",
        { bookingId: bookingId }
      );
      alert("Successfully cancelled.");
      onClose();
    });
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
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
            Confirm Cancellation
          </Text>

          <Text
            style={{
              fontSize: 15,
              marginTop: 10,
              color: "#666666",
            }}
          >
            Are you sure you want to cancel?
          </Text>

          <Text
            style={{
              fontSize: 15,
              marginTop: 10,
              color: "#666666",
            }}
          >
            Add a note (required):
          </Text>

          <TextInput
            placeholder="Please provide a reason for cancellation..."
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
            <TouchableOpacity style={{}} onPress={onClose}>
              <Text style={{ color: "#8f1ee7", fontWeight: "700" }}>
                GO BACK
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: 5 }} onPress={onCancel}>
              <Text
                style={{ color: "#e73e1e", fontWeight: "700", marginLeft: 10 }}
              >
                CONFIRM CANCEL
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
