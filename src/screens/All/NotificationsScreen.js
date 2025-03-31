import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { get, loadingProcess, where } from "../../helpers/databaseHelper";
import { useAppContext } from "../../../AppProvider";

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const { userId } = useAppContext();

  useFocusEffect(
    useCallback(() => {
      loadingProcess(async () => {
        const snap = await get(
          "notifications",
          where("receiverId", "==", userId)
          // where("seen", "==", false)
        );
        setNotifications(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      });
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {notifications.length == 0 ? (
        <View style={styles.content}>
          <Text style={styles.notificationText}>
            You have no new notifications.
          </Text>
        </View>
      ) : (
        <ScrollView>
          {notifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => navigation.navigate(item.screen, item.params)}
              style={{
                marginRight: 20,
                marginLeft: 20,
                marginTop: 5,
                backgroundColor: "#808080",
                borderRadius: 10,
                padding: 10,
                paddingLeft: 20,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 18 }}>{item.title}</Text>
              <Text style={{ color: "#fff", fontSize: 16 }}>{item.body}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationText: {
    fontSize: 16,
    color: "#999",
  },
});

export default NotificationsScreen;
