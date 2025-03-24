// src/screens/ServiceProvider/MyAvailabilityScreen.js
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppContext } from "../../../../AppProvider";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import { find, set, loadingProcess } from "../../../helpers/databaseHelper";

const DateTimeModal = ({ visible, onClose, onSave, initialSchedule }) => {
  const [selectedDate, setSelectedDate] = useState(
    initialSchedule ? new Date(initialSchedule.timestamp) : new Date()
  );
  const [startTime, setStartTime] = useState(
    initialSchedule ? new Date(initialSchedule.startTime) : new Date()
  );
  const [endTime, setEndTime] = useState(
    initialSchedule
      ? new Date(initialSchedule.endTime)
      : new Date(new Date().setHours(new Date().getHours() + 1))
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const formatTime = (date) => {
    return moment(date).format("hh:mm A");
  };

  const formatDate = (date) => {
    return moment(date).format("MMM DD, YYYY");
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const handleStartTimeChange = (event, selectedTime) => {
    setShowStartPicker(false);
    if (selectedTime) {
      setStartTime(selectedTime);
      // Automatically set end time to 1 hour after start time
      const newEndTime = new Date(selectedTime);
      newEndTime.setHours(selectedTime.getHours() + 1);
      setEndTime(newEndTime);
    }
  };

  const handleEndTimeChange = (event, selectedTime) => {
    setShowEndPicker(false);
    if (selectedTime) {
      if (selectedTime <= startTime) {
        Alert.alert("Invalid Time", "End time must be after start time");
        return;
      }
      setEndTime(selectedTime);
    }
  };

  const handleSave = () => {
    if (endTime <= startTime) {
      Alert.alert("Invalid Time Range", "End time must be after start time");
      return;
    }

    // Check if the selected date is not in the past
    if (selectedDate < new Date().setHours(0, 0, 0, 0)) {
      Alert.alert("Invalid Date", "Cannot select past dates");
      return;
    }

    onSave({
      date: selectedDate,
      startTime: startTime,
      endTime: endTime,
      timeSlot: `${formatTime(startTime)} - ${formatTime(endTime)}`,
      fullDate: formatDate(selectedDate),
      dayOfWeek: moment(selectedDate).format("ddd"),
      timestamp: selectedDate.getTime(),
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {initialSchedule ? "Edit Schedule" : "Set Schedule"}
            </Text>
          </View>

          <View style={styles.modalContent}>
            {/* Date Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date:</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.inputText}>{formatDate(selectedDate)}</Text>
                <Feather name="calendar" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Start Time */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Start Time:</Text>
              <TouchableOpacity
                style={styles.timeInput}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={styles.inputText}>{formatTime(startTime)}</Text>
                <Feather name="clock" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* End Time */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>End Time:</Text>
              <TouchableOpacity
                style={styles.timeInput}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={styles.inputText}>{formatTime(endTime)}</Text>
                <Feather name="clock" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {showStartPicker && (
            <DateTimePicker
              value={startTime}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={handleStartTimeChange}
            />
          )}

          {showEndPicker && (
            <DateTimePicker
              value={endTime}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={handleEndTimeChange}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const MyAvailabilityScreen = ({ navigation }) => {
  const { userId } = useAppContext();
  const [schedules, setSchedules] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  // Fetch saved schedules
  useFocusEffect(
    useCallback(() => {
      loadingProcess(async () => {
        const docSnap = await find("providerSchedules", userId);
        if (!docSnap.exists()) return;

        const data = docSnap.data();
        // Sort schedules by date
        const sortedSchedules = data.schedules || [];
        sortedSchedules.sort((a, b) => a.timestamp - b.timestamp);
        setSchedules(sortedSchedules);
      });
    }, [])
  );

  const handleAddSchedule = (newSchedule) =>
    // Check for overlapping schedules
    loadingProcess(
      async () => {
        const isOverlapping = schedules.some((schedule) => {
          const newStart = newSchedule.startTime;
          const newEnd = newSchedule.endTime;
          const existingStart = new Date(schedule.startTime);
          const existingEnd = new Date(schedule.endTime);

          return (
            newSchedule.fullDate === schedule.fullDate &&
            ((newStart >= existingStart && newStart < existingEnd) ||
              (newEnd > existingStart && newEnd <= existingEnd) ||
              (newStart <= existingStart && newEnd >= existingEnd))
          );
        });

        if (isOverlapping) {
          Alert.alert(
            "Schedule Conflict",
            "This time slot overlaps with an existing schedule"
          );
          return;
        }

        const updatedSchedules = [...schedules, newSchedule].sort(
          (a, b) => a.timestamp - b.timestamp
        );

        await set("providerSchedules", userId, {
          schedules: updatedSchedules,
        });
        setSchedules(updatedSchedules);
      },
      (error) => {
        Alert.alert("Error", "Failed to save schedule. Please try again.");
      }
    );

  const handleEditSchedule = (updatedSchedule) =>
    loadingProcess(
      async () => {
        const isOverlapping = schedules.some((schedule) => {
          if (schedule.timestamp === editingSchedule.timestamp) return false;

          const newStart = updatedSchedule.startTime;
          const newEnd = updatedSchedule.endTime;
          const existingStart = new Date(schedule.startTime);
          const existingEnd = new Date(schedule.endTime);

          return (
            updatedSchedule.fullDate === schedule.fullDate &&
            ((newStart >= existingStart && newStart < existingEnd) ||
              (newEnd > existingStart && newEnd <= existingEnd) ||
              (newStart <= existingStart && newEnd >= existingEnd))
          );
        });

        if (isOverlapping) {
          Alert.alert(
            "Schedule Conflict",
            "This time slot overlaps with an existing schedule"
          );
          return;
        }

        const updatedSchedules = schedules
          .map((schedule) =>
            schedule.timestamp === editingSchedule.timestamp
              ? updatedSchedule
              : schedule
          )
          .sort((a, b) => a.timestamp - b.timestamp);

        await set("providerSchedules", userId, {
          schedules: updatedSchedules,
        });
        setSchedules(updatedSchedules);
        setEditingSchedule(null);
      },
      (error) => {
        console.error("Error updating schedule:", error);
        Alert.alert("Error", "Failed to update schedule. Please try again.");
      }
    );

  const handleRemoveSchedule = (scheduleToRemove) =>
    Alert.alert(
      "Remove Schedule",
      "Are you sure you want to remove this schedule?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            loadingProcess(
              async () => {
                const updatedSchedules = schedules.filter(
                  (schedule) =>
                    schedule.timestamp !== scheduleToRemove.timestamp
                );
                await set("providerSchedules", userId, {
                  schedules: updatedSchedules,
                });
                setSchedules(updatedSchedules);
              },
              (error) => {
                Alert.alert(
                  "Error",
                  "Failed to remove schedule. Please try again."
                );
              }
            );
          },
        },
      ]
    );

  const groupSchedulesByDate = () => {
    const grouped = {};
    schedules.forEach((schedule) => {
      if (!grouped[schedule.fullDate]) {
        grouped[schedule.fullDate] = [];
      }
      grouped[schedule.fullDate].push(schedule);
    });
    return grouped;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFB800" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Availability</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Add Schedule Button */}
        <TouchableOpacity
          style={styles.addScheduleButton}
          onPress={() => {
            setEditingSchedule(null);
            setShowAddModal(true);
          }}
        >
          <Feather name="plus-circle" size={20} color="#FFB800" />
          <Text style={styles.addScheduleText}>Add Your Schedule</Text>
        </TouchableOpacity>

        {/* Schedules List */}
        <ScrollView style={styles.schedulesList}>
          {Object.entries(groupSchedulesByDate()).map(
            ([date, daySchedules]) => (
              <View key={date} style={styles.dateGroup}>
                <Text style={styles.dateHeader}>{date}</Text>
                {daySchedules.map((schedule, index) => (
                  <View key={index} style={styles.scheduleItem}>
                    <View style={styles.scheduleInfo}>
                      <View style={styles.scheduleTimeContainer}>
                        <Feather name="clock" size={16} color="#666" />
                        <Text style={styles.scheduleTime}>
                          {schedule.timeSlot}
                        </Text>
                      </View>
                      <Text style={styles.scheduleDay}>
                        {schedule.dayOfWeek}
                      </Text>
                    </View>
                    <View style={styles.scheduleActions}>
                      <TouchableOpacity
                        onPress={() => {
                          setEditingSchedule(schedule);
                          setShowAddModal(true);
                        }}
                        style={styles.editButton}
                      >
                        <Feather name="edit-2" size={20} color="#007AFF" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleRemoveSchedule(schedule)}
                        style={styles.removeButton}
                      >
                        <Feather name="trash-2" size={20} color="#FF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )
          )}
          {schedules.length === 0 && (
            <Text style={styles.noSchedulesText}>
              No schedules set. Tap the button above to add your availability.
            </Text>
          )}
        </ScrollView>
      </View>

      {/* Date Time Modal */}
      <DateTimeModal
        visible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingSchedule(null);
        }}
        onSave={(schedule) => {
          if (editingSchedule) {
            handleEditSchedule(schedule);
          } else {
            handleAddSchedule(schedule);
          }
          setShowAddModal(false);
        }}
        initialSchedule={editingSchedule}
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
    backgroundColor: "#FFB800",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 16 : 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  addScheduleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#FFF9E6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFB800",
    marginBottom: 16,
  },
  addScheduleText: {
    fontSize: 16,
    color: "#FFB800",
    fontWeight: "600",
    marginLeft: 8,
  },
  schedulesList: {
    flex: 1,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    backgroundColor: "#F8F9FA",
    padding: 8,
    borderRadius: 8,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
    marginLeft: 8,
  },
  scheduleDay: {
    fontSize: 13,
    color: "#666",
    marginLeft: 24,
  },
  scheduleActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  removeButton: {
    padding: 8,
  },
  noSchedulesText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    marginTop: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalContent: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  timeInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  inputText: {
    fontSize: 16,
    color: "#333",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
  },
  saveButton: {
    backgroundColor: "#FFB800",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // Additional styles for edit functionality
  editModeIndicator: {
    backgroundColor: "#E3F2FD",
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  editModeText: {
    color: "#007AFF",
    fontSize: 14,
    textAlign: "center",
  },
  scheduleItemEditing: {
    borderColor: "#007AFF",
    borderWidth: 2,
  },
  timePickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    width: "100%",
  },
  timePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  timePickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  timePickerContent: {
    maxHeight: 200,
  },
  timeOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  timeOptionText: {
    fontSize: 16,
    color: "#333",
  },
  selectedTimeOption: {
    backgroundColor: "#F0F7FF",
  },
  selectedTimeOptionText: {
    color: "#007AFF",
    fontWeight: "500",
  },
  modalCloseButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
  },
  modalOverlayButton: {
    flex: 1,
    width: "100%",
  },
});

export default MyAvailabilityScreen;
