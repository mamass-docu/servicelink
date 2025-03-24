import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { db } from "../../db/firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  getDocs,
  where,
} from "firebase/firestore";
import { useAppContext } from "../../../AppProvider";
import ListScreen from "../components/ListScreen";
import ProfileImageScreen from "../components/ProfileImage";
import { setIsLoading } from "../../helpers/databaseHelper";
import { DateTimeConverter } from "../../helpers/DateTimeConverter";

export default function MessengerScreen({ navigation }) {
  const [chatHeads, setChatHeads] = useState([]);
  const [messengers, setMessengers] = useState([]);

  const { userId, userRole } = useAppContext();

  const callback = () => {
    setIsLoading(true);
    let loaded = false;
    let users = {};
    let booked = {};
    // let excludeInActive = {};
    // let usersChatted = {};
    let unsubscribeMess = null;
    let unsubscribeActive = null;

    getDocs(
      query(
        collection(db, "bookings"),
        where(
          userRole == "Customer" ? "customerId" : "providerId",
          "==",
          userId
        )
      )
    ).then(async (docs) => {
      const key = userRole == "Provider" ? "customerId" : "providerId";
      docs.forEach((dc) => {
        booked[dc.data()[key]] = true;
      });
      // const snap = await all("settings");
      // snap.docs.forEach((dc) => {
      //   if (!dc.data().showOnlineStatus) excludeInActive[dc.id] = true;
      // });
      const messengerQuery = query(
        collection(db, "users"),
        where("role", "!=", "Admin"),
        where("active", "==", true)
      );

      unsubscribeActive = onSnapshot(messengerQuery, (snapshot) => {
        let activeUsers = [];
        // let temp = messengers;
        users = {};
        console.log("users snap messager");

        snapshot.docs.forEach((doc) => {
          if (doc.id == userId) return;

          const user = doc.data();

          users[doc.id] = {
            name: user.name,
            image: user.image ?? null,
            isOnline: user.isOnline ?? false,
          };
          // for (let i in temp) {
          //   let mess = temp[i];
          //   if (mess.otherUserId != doc.id) continue;

          //   temp[i] = {
          //     ...mess,
          //     otherUserName: user.name,
          //     otherUserImage: user.image,
          //     isOnline: user.isOnline,
          //   };
          //   break;
          // }

          // if (!user.isOnline || !usersChatted[doc.id]) return;
          if (
            !user.isOnline ||
            !booked[doc.id] ||
            (user.showOnlineStatus !== undefined && !user.showOnlineStatus)
          )
            return;

          // usersChatted[doc.id] = true;
          activeUsers.push({
            name: user.name,
            otherUserId: doc.id,
            otherUserName: user.name,
            otherUserImage: user.image ?? null,
          });
        });
        console.log("setting of user");

        // setMessengers(temp);
        // if (activeUsers.length > 0)
        setChatHeads(activeUsers);

        if (unsubscribeMess) return;

        const messageQuery = query(
          collection(db, "messages"),
          where("participants", "array-contains", userId),
          orderBy("sentAt", "desc")
        );

        unsubscribeMess = onSnapshot(messageQuery, (snapshot) => {
          let temp = [];
          // console.log(users);
          let checked = {};
          // let temp1 = [];

          try {
            for (const mess of snapshot.docs) {
              const message = mess.data();

              const otherUserId =
                message.participants[0] == userId
                  ? message.participants[1]
                  : message.participants[0];

              if (checked[otherUserId] || !otherUserId || userId == otherUserId)
                continue;

              checked[otherUserId] = true;
              const userData = users[otherUserId];

              // if (!usersChatted[otherUserId]) {
              //   if (userData.isOnline)
              //     temp1.push({
              //       name: userData.name,
              //       otherUserId: otherUserId,
              //       otherUserName: userData.name,
              //       otherUserImage: userData.image ?? null,
              //     });
              //   usersChatted[otherUserId] = true;
              // }

              const isUserSender = message.senderId == userId;

              temp.push({
                sentAt: DateTimeConverter(message.sentAt),
                lastMessage: message.message,
                name: userData.name,
                otherUserId: otherUserId,
                otherUserName: userData.name,
                otherUserImage: userData.image,
                isOnline: userData.isOnline,
                seenByUser: isUserSender || (!isUserSender && message.seen),
                seenByOtherUser: isUserSender && message.seen,
              });
            }
            // if (temp1.length > 0) setChatHeads(temp1);
            // if (temp.length > 0)
            setMessengers(temp);
          } catch (e) {
            console.log(e, "error sa getting messages");
          } finally {
            console.log("snap message");
            if (loaded) return;

            console.log("close loading message");

            loaded = true;
            setIsLoading(false);
          }
        });
      });
    });

    return () => {
      console.log("unsubs");
      loaded = false;
      if (unsubscribeActive) unsubscribeActive();
      if (unsubscribeMess) unsubscribeMess();
    };
  };

  useFocusEffect(useCallback(callback, []));

  const renderChatHead = (item) => (
    <View style={styles.chatHeadWrapper}>
      <TouchableOpacity
        style={styles.chatHeadContainer}
        onPress={() =>
          navigation.navigate("Message", {
            otherUserId: item.otherUserId,
            otherUserName: item.otherUserName,
            otherUserImage: item.otherUserImage,
          })
        }
      >
        <View style={styles.chatHeadImageContainer}>
          <ProfileImageScreen
            image={item.otherUserImage}
            name={item.otherUserName}
            style={styles.chatHeadImage}
          />
          {/* <Image
            source={{
              uri: item.otherUserImage,
            }}
            style={styles.chatHeadImage}
          /> */}
          <View style={styles.onlineIndicator} />
        </View>
        <Text style={styles.chatHeadName} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderChatItem = (item) => (
    <TouchableOpacity
      style={styles.chatItemContainer}
      onPress={() =>
        navigation.navigate("Message", {
          otherUserId: item.otherUserId,
          otherUserName: item.otherUserName,
          otherUserImage: item.otherUserImage,
        })
      }
    >
      <View style={styles.chatItemLeft}>
        <View style={styles.avatarContainer}>
          <ProfileImageScreen
            image={item.otherUserImage}
            name={item.otherUserName}
            style={styles.avatar}
          />
          {/* <Image source={{ uri: item.otherUserImage }} style={styles.avatar} /> */}
          {/* {item.isOnline && <View style={styles.onlineIndicator} />} */}
        </View>
        <View style={styles.chatItemInfo}>
          <Text style={styles.chatItemName}>{item.name}</Text>
          <Text
            style={{
              ...styles.chatItemService,
              fontWeight: item.seenByUser ? "400" : "800",
            }}
          >
            {item.lastMessage}
          </Text>
          <Text style={styles.chatItemMessage}>{item.sentAt}</Text>

          {!item.seenByUser ? (
            <View style={styles.notSeenIndicator} />
          ) : item.seenByOtherUser ? (
            <Text style={styles.seenText}>seen</Text>
          ) : null}
        </View>
      </View>
      <Text style={styles.chatItemTime}>{item.time}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity onPress={() => navigation.navigate("UserSearch")}>
          <Icon name="magnify" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Chat Heads */}
      <View style={styles.chatHeadsContainer}>
        <ListScreen
          data={chatHeads}
          keyExtractor={(item) => item.otherUserId}
          contentContainerStyle={styles.chatHeadsScroll}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderChatHead}
        />
        {/* <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chatHeadsScroll}
        >
          {chatHeads.map((chatHead) => (
            <View key={chatHead.otherUserId} style={styles.chatHeadWrapper}>
              {renderChatHead({ item: chatHead })}
            </View>
          ))}
        </ScrollView> */}
      </View>

      {/* Chat List */}
      {/* <FlatList
        data={messengers}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.otherUserId?.toString()}
        contentContainerStyle={styles.chatList}
      /> */}

      <ListScreen
        data={messengers}
        keyExtractor={(item) => item.otherUserId}
        contentContainerStyle={styles.chatList}
        renderItem={renderChatItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: Platform.OS === "android" ? 40 : 16, // Added padding for Android
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
  },
  chatHeadsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    backgroundColor: "#FFFFFF",
  },
  chatHeadsScroll: {
    padding: 16,
  },
  chatHeadWrapper: {
    marginRight: 20,
  },
  chatHeadContainer: {
    alignItems: "center",
    width: 70,
  },
  chatHeadImageContainer: {
    position: "relative",
    marginBottom: 8,
  },
  chatHeadImage: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "#F0F0F0",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  notSeenIndicator: {
    position: "absolute",
    top: 24,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 7,
    backgroundColor: "#2022ff",
  },
  seenText: {
    position: "absolute",
    top: 24,
    right: 2,
    paddingRight: 5,
    paddingLeft: 5,
    paddingBottom: 2,
    color: "#094512",
    borderRadius: 5,
    fontSize: 12,
    backgroundColor: "#98f2a5",
  },
  chatHeadName: {
    fontSize: 13,
    color: "#333",
    textAlign: "center",
    width: 70,
    fontWeight: "500",
  },
  chatItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  chatItemLeft: {
    flexDirection: "row",
    flex: 1,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F0F0F0",
  },
  chatItemInfo: {
    flex: 1,
    justifyContent: "center",
  },
  chatItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  chatItemService: {
    fontSize: 15,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  chatItemMessage: {
    fontSize: 14,
    color: "#999",
  },
  chatItemTime: {
    fontSize: 12,
    color: "#999",
    marginLeft: 8,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  chatList: {
    flexGrow: 1,
  },
});

// const unsubscribeActive = onSnapshot(messengerQuery, (snapshot) => {
//   let activeUsers = [];
//   // let temp = messengers;
//   users = {};
//   console.log("users snap messager");

//   snapshot.docs.forEach((doc) => {
//     if (doc.id == userId) return;

//     const user = doc.data();

//     users[doc.id] = {
//       name: user.name,
//       image: user.image ?? null,
//       isOnline: user.isOnline ?? false,
//     };
//     // for (let i in temp) {
//     //   let mess = temp[i];
//     //   if (mess.otherUserId != doc.id) continue;

//     //   temp[i] = {
//     //     ...mess,
//     //     otherUserName: user.name,
//     //     otherUserImage: user.image,
//     //     isOnline: user.isOnline,
//     //   };
//     //   break;
//     // }

//     if (!user.isOnline || !usersChatted[doc.id]) return;

//     usersChatted[doc.id] = true;
//     activeUsers.push({
//       name: user.name,
//       otherUserId: doc.id,
//       otherUserName: user.name,
//       otherUserImage: user.image ?? null,
//     });
//   });
//   console.log("setting of user");

//   // setMessengers(temp);
//   if (activeUsers.length > 0) setChatHeads(activeUsers);

//   if (unsubscribeMess) return;

//   const messageQuery = query(
//     collection(db, "messages"),
//     where("participants", "array-contains", userId),
//     orderBy("sentAt", "desc")
//   );

//   unsubscribeMess = onSnapshot(messageQuery, (snapshot) => {
//     let temp = [];
//     // console.log(users);
//     let checked = {};
//     let temp1 = [];

//     try {
//       for (let i in snapshot.docs) {
//         const message = snapshot.docs[i].data();

//         const otherUserId =
//           message.participants[0] == userId
//             ? message.participants[1]
//             : message.participants[0];

//         if (checked[otherUserId] || !otherUserId || userId == otherUserId)
//           continue;

//         checked[otherUserId] = true;
//         const userData = users[otherUserId];

//         if (!usersChatted[otherUserId]) {
//           if (userData.isOnline)
//             temp1.push({
//               name: userData.name,
//               otherUserId: otherUserId,
//               otherUserName: userData.name,
//               otherUserImage: userData.image ?? null,
//             });
//           usersChatted[otherUserId] = true;
//         }

//         const isUserSender = message.senderId == userId;

//         temp.push({
//           sentAt: DateTimeConverter(message.sentAt),
//           lastMessage: message.message,
//           name: userData.name,
//           otherUserId: otherUserId,
//           otherUserName: userData.name,
//           otherUserImage: userData.image,
//           isOnline: userData.isOnline,
//           seenByUser: isUserSender || (!isUserSender && message.seen),
//           seenByOtherUser: isUserSender && message.seen,
//         });
//       }
//       if (temp1.length > 0) setChatHeads(temp1);
//       if (temp.length > 0) setMessengers(temp);
//     } catch (e) {
//       console.log(e, "error sa getting messages");
//     } finally {
//       console.log("snap message");
//       if (loaded) return;

//       console.log("close loading message");

//       loaded = true;
//       setIsLoading(false);
//     }
//   });
// });
