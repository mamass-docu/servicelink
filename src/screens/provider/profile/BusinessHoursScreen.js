import React, { useCallback, useState } from "react";
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
  Switch,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { find, loadingProcess, set } from "../../../helpers/databaseHelper";
import { useAppContext } from "../../../../AppProvider";
import { useFocusEffect } from "@react-navigation/native";

const DayScheduleCard = ({ day, schedule, onToggle, onTimePress }) => {
  return (
    <View style={styles.scheduleCard}>
      <View style={styles.daySection}>
        <View>
          <Text style={styles.dayName}>{day.label}</Text>
          <Text
            style={[
              styles.statusText,
              { color: schedule.isOpen ? "#4CAF50" : "#FF4444" },
            ]}
          >
            {schedule.isOpen ? "Open" : "Closed"}
          </Text>
        </View>
        <Switch
          value={schedule.isOpen}
          onValueChange={() => onToggle(day.key)}
          trackColor={{ false: "#E8ECF2", true: "#4CAF50" }}
          thumbColor="#FFFFFF"
        />
      </View>

      {schedule.isOpen && (
        <View style={styles.timeSection}>
          <TouchableOpacity
            style={styles.timeBlock}
            onPress={() => onTimePress(day.key, "open")}
          >
            <Text style={styles.timeLabel}>Opens</Text>
            <View style={styles.timeDisplay}>
              <Feather name="clock" size={16} color="#666666" />
              <Text style={styles.timeText}>{schedule.openTime}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.timeSeparator}>
            <View style={styles.separatorLine} />
          </View>

          <TouchableOpacity
            style={styles.timeBlock}
            onPress={() => onTimePress(day.key, "close")}
          >
            <Text style={styles.timeLabel}>Closes</Text>
            <View style={styles.timeDisplay}>
              <Feather name="clock" size={16} color="#666666" />
              <Text style={styles.timeText}>{schedule.closeTime}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const BusinessHoursScreen = ({ navigation }) => {
  const { userId } = useAppContext();

  const [businessHours, setBusinessHours] = useState({
    monday: { isOpen: false, openTime: "9:00 AM", closeTime: "5:00 PM" },
    tuesday: { isOpen: false, openTime: "9:00 AM", closeTime: "5:00 PM" },
    wednesday: { isOpen: false, openTime: "9:00 AM", closeTime: "5:00 PM" },
    thursday: { isOpen: false, openTime: "9:00 AM", closeTime: "5:00 PM" },
    friday: { isOpen: false, openTime: "9:00 AM", closeTime: "5:00 PM" },
    saturday: { isOpen: false, openTime: "9:00 AM", closeTime: "5:00 PM" },
    sunday: { isOpen: false, openTime: "9:00 AM", closeTime: "5:00 PM" },
  });

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [tempTime, setTempTime] = useState(new Date());

  const days = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  useFocusEffect(
    useCallback(() => {
      loadingProcess(async () => {
        const snap = await find("providerBusinessHours", userId);
        if (!snap.exists()) return;
        setBusinessHours(snap.data());
      });
    }, [])
  );

  const toggleDay = (day) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day].isOpen,
      },
    }));
  };

  const handleTimePress = (day, type) => {
    setSelectedDay(day);
    setSelectedType(type);
    setShowTimePicker(true);
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime && selectedDay && selectedType) {
      const timeString = selectedTime.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      setBusinessHours((prev) => ({
        ...prev,
        [selectedDay]: {
          ...prev[selectedDay],
          [`${selectedType}Time`]: timeString,
        },
      }));
    }
  };

  const handleSave = () => {
    const hasOpenDays = Object.values(businessHours).some((day) => day.isOpen);
    if (!hasOpenDays) {
      Alert.alert("Error", "Please set business hours for at least one day");
      return;
    }

    loadingProcess(async () => {
      await set("providerBusinessHours", userId, businessHours);

      Alert.alert("Success", "Business hours saved successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    });
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
          <Feather name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Operating Hours</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Set Your Schedule</Text>
          <Text style={styles.infoText}>
            Configure your business hours for each day of the week. These hours
            will be shown to customers.
          </Text>
        </View>

        <View style={styles.scheduleContainer}>
          {days.map((day) => (
            <DayScheduleCard
              key={day.key}
              day={day}
              schedule={businessHours[day.key]}
              onToggle={toggleDay}
              onTimePress={handleTimePress}
            />
          ))}
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Schedule</Text>
        </TouchableOpacity>
      </View>

      {showTimePicker && (
        <DateTimePicker
          value={tempTime}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 16 : 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF2",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
    marginRight: 40,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  infoContainer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF2",
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  scheduleContainer: {
    padding: 16,
  },
  scheduleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
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
  daySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dayName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  timeSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E8ECF2",
  },
  timeBlock: {
    flex: 1,
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 8,
  },
  timeDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  timeText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333333",
    fontWeight: "500",
  },
  timeSeparator: {
    width: 40,
    alignItems: "center",
  },
  separatorLine: {
    width: 20,
    height: 1,
    backgroundColor: "#E8ECF2",
  },
  bottomBar: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E8ECF2",
  },
  saveButton: {
    backgroundColor: "#FFB800",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default BusinessHoursScreen;
