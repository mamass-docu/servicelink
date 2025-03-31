import { createContext, useContext, useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import LoadingScreen from "./src/screens/components/LoadingScreen";
import { useNavigation } from "@react-navigation/native";
import { db } from "./src/db/firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { remove, setNotifPrompt } from "./src/helpers/databaseHelper";
import { logout } from "./src/db/UpdateUser";

const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const settingsRef = useRef({
    bookings: true,
    messages: true,
    showOnlineStatus: true,
    showLocation: true,
  });
  const [userName, setUserName] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userImage, setUserImage] = useState(null);

  const notificationListenerRef = useRef(null);
  const notifClickListenerRef = useRef(null);

  const navigation = useNavigation();

  useEffect(() => {
    console.log("nag mount");

    async function requestPermissions() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("permision not granted");
        return;
      }

      console.log("Permission granted for notifications");
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true, // Show notification alert
          shouldPlaySound: true, // Play sound
          shouldSetBadge: true, // Optionally set the badge on the app icon
        }),
      });
    }

    requestPermissions();

    return () => {
      const lg = async () => {
        if (userId) await logout(userId, setUserId);
      };
      lg();
      console.log("unmount the provider");

      removeListeners();
    };
  }, []);

  const setSettings = (settings) => (settingsRef.current = settings);

  const removeListeners = () => {
    if (notifClickListenerRef.current) notifClickListenerRef.current.remove();
    if (notificationListenerRef.current) notificationListenerRef.current();
  };

  useEffect(() => {
    if (!userId) {
      removeListeners();
      return;
    }

    notifClickListenerRef.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        if (!userId) return;

        const data = response.notification.request.content.data;

        const screen = data?.screen;
        if (!screen) return;

        navigation.navigate(screen, data.params);
      });

    const q = query(
      collection(db, "notifications"),
      where("receiverId", "==", userId),
      where("prompt", "==", false),
      // where("seen", "==", false),
      orderBy("sentAt", "desc")
    );
    notificationListenerRef.current = onSnapshot(q, (snapshot) => {
      snapshot.docs.forEach(async (dc) => {
        const notif = dc.data();

        if (notif.screen == "Login") {
          await remove("notifications", dc.id);
          alert(`Your account has been ${notif.title}`);
          await logout(userId, setUserId, true);
          navigation.reset({
            index: 0,
            routes: [
              {
                name: "Login",
              },
            ],
          });
          return;
        }

        setNotifPrompt(dc.id);

        if (
          ((notif.screen == "JobStatus" || notif.screen == "Main") &&
            !settingsRef.current.bookings) ||
          (notif.screen == "Message" && !settingsRef.current.messages)
        )
          return;

        Notifications.scheduleNotificationAsync({
          content: {
            title: notif.title,
            body: notif.body,
            icon: require("./assets/images/logo.png"),
            data: {
              screen: notif.screen,
              notifId: dc.id,
              params: notif.params,
            },
          },
          trigger: null,
          sound: "default",
        });
      });
    });
  }, [userId]);

  return (
    <AppContext.Provider
      value={{
        userId,
        setUserId,
        userName,
        setUserName,
        userEmail,
        setUserEmail,
        userRole,
        setUserRole,
        userImage,
        setUserImage,
        setSettings,
        settingsRef,
      }}
    >
      {children}
      <LoadingScreen />
    </AppContext.Provider>
  );
};
