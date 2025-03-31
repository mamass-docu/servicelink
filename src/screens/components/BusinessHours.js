import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { find } from "../../helpers/databaseHelper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const days = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

export default function BusinessHours({ providerId }) {
  const [businessHours, setBusinessHours] = useState({});

  useEffect(() => {
    find("providerBusinessHours", providerId).then((snap) => {
      if (snap.exists()) setBusinessHours(snap.data());
    });
  }, []);

  return (
    <View
      style={{
        padding: 10,
        borderRadius: 10,
        marginBottom: 5,
        borderLeftWidth: 5,
        borderLeftColor: "#1188fe",
        backgroundColor: "#F8F9FA",
      }}
    >
      <View style={{ flexDirection: "row" }}>
        <Icon
          name="clock"
          size={20}
          color="#afb5b9"
          style={{
            marginRight: 5,
          }}
        />
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
          }}
        >
          Business Hours
        </Text>
      </View>

      {days.map((day) => (
        <View
          key={day.value}
          style={{
            flexDirection: "row",
            marginTop: 6,
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontSize: 15,
              color: "#666666",
            }}
          >
            {day.label}
          </Text>
          {businessHours[day.value] && businessHours[day.value].isOpen ? (
            <Text
              style={{
                fontSize: 15,
                color: "#1188fe",
              }}
            >
              {businessHours[day.value].openTime} -{" "}
              {businessHours[day.value].closeTime}
            </Text>
          ) : (
            <Text
              style={{
                fontSize: 15,
                color: "#fe3111",
              }}
            >
              Closed
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}
