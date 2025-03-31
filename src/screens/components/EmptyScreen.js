import { View, StyleSheet, Text } from "react-native";
// import { Ionicons } from "@expo/vector-icons";

const EmptyScreen = ({ message }) => {
  return (
    <View style={styles.container}>
      <View style={styles.emptyStateContainer}>
        {/* <Ionicons name="ios-folder-open" size={100} color="gray" /> */}
        <Text style={styles.emptyStateText}>
          {message ?? "No Messages"}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  emptyStateContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 18,
    color: "#888",
    marginTop: 20,
  },
});

export default EmptyScreen;
