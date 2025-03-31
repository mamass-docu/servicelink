import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Image,
  Platform,
  KeyboardAvoidingView,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { db } from "../../db/firebase";
import { useAppContext } from "../../../AppProvider";
import ProfileImageScreen from "../components/ProfileImage";
import {
  addNotif,
  find,
  get,
  loadingProcess,
  remove,
  serverTimestamp,
  set,
  specificLoadingProcess,
  update,
  updateAllAsSeen,
  useSelector,
} from "../../helpers/databaseHelper";
import { DateTimeConverter } from "../../helpers/DateTimeConverter";
import EmptyScreen from "../components/EmptyScreen";
import { selectImage } from "../../helpers/ImageSelector";
import { uploadImage } from "../../helpers/cloudinary";
import { Feather } from "@expo/vector-icons";

export const ReportModal = ({
  visible,
  onCancel,
  otherUserId,
  otherUserName,
  otherUserImage,
}) => {
  const { userId, userName, userRole } = useAppContext();

  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  const onSave = () => {
    if (reason.trim() == "") {
      alert("Please enter a reason");
      return;
    }
    if (description.trim() == "") {
      alert("Please enter a description");
      return;
    }

    loadingProcess(async () => {
      await set("reportedUsers", otherUserId, {
        name: otherUserName,
        image: otherUserImage,
        role: userRole == "Customer" ? "Provider" : "Customer",
        reportedBy: userId,
        reportedByName: userName,
        reason: reason,
        description: description,
        status: "Pending",
        at: serverTimestamp(),
      });

      alert("Successfully reported.");
      onCancelI();
    });
  };

  const onCancelI = () => {
    setReason("");
    setDescription("");
    onCancel();
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
            Report Details
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
            placeholder="Please provide a reason"
            style={{
              borderWidth: 2,
              borderColor: "#8f1ee7",
              marginTop: 10,
              padding: 15,
              fontSize: 15,
            }}
            value={reason}
            onChangeText={(e) => setReason(e)}
          />

          <Text
            style={{
              fontSize: 15,
              marginTop: 10,
              color: "#666666",
            }}
          >
            Detailed Description
          </Text>
          <TextInput
            placeholder="Please provide a description"
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
            value={description}
            onChangeText={(e) => setDescription(e)}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              marginTop: 30,
            }}
          >
            <TouchableOpacity style={{}} onPress={onCancelI}>
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
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const MessageScreen = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const [isSendingImage, setIsSendingImage] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);

  // const [allowNotif, setAllowNotif] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const { userId, userName, userImage } = useAppContext();
  const isLoading = useSelector((state) => state.loading.specific);

  const { otherUserId, otherUserName, otherUserImage } = route.params;
  // useFocusEffect(useCallback(() => {

  const scrollViewRef = useRef(null);

  const updateMessagesAsSeen = () => {
    get(
      "messages",
      where("senderId", "==", otherUserId),
      where("participants", "array-contains", userId),
      where("seen", "==", false)
    ).then(({ docs }) =>
      docs.forEach((doc) => {
        update("messages", doc.id, { seen: true });
      })
    );
  };

  useEffect(() => {
    // const uri = require(otherUserImage)
    console.log(otherUserImage);

    // find("settings", otherUserId).then((snap) => {
    //   if (snap.exists()) setAllowNotif(snap.data().messages);
    // });
    // console.log(imageRef.current);

    const messageQuery = query(
      collection(db, "messages"),
      where("participants", "array-contains", userId),
      orderBy("sentAt", "asc")
    );
    const unsubscribe = onSnapshot(messageQuery, (snapshot) => {
      updateAllAsSeen(userId, "Message");
      updateMessagesAsSeen();

      let temp = [];
      snapshot.docs.forEach((dc) => {
        const message = dc.data();

        if (message.participants.some((mess) => mess == otherUserId)) {
          let strDatetime = DateTimeConverter(message.sentAt);

          temp.push({
            id: dc.id,
            message: message.message,
            image: message.image,
            isUserSender: message.senderId == userId,
            seen: message.seen,
            sentAt: strDatetime,
          });
        }
      });

      // if (scrollViewRef.current) {
      //   scrollViewRef.current.scrollToEnd({ animated: false });
      // }
      setMessages(temp);
    });

    return () => {
      console.log("unsubs message");
      unsubscribe();
    };
  }, []);

  const sendMessage = () => {
    if (isLoading || newMessage.trim() == "") return;

    specificLoadingProcess(async () => {
      setNewMessage("");
      await addDoc(collection(db, "messages"), {
        participants: [userId, otherUserId],
        message: newMessage,
        seen: false,
        sentAt: serverTimestamp(),
        senderId: userId,
      });
      // if (!allowNotif) return;

      let params = { otherUserId: userId, otherUserName: userName };
      if (userImage) params["otherUserImage"] = userImage;
      addNotif(
        otherUserId,
        `Message from ${otherUserName}`,
        newMessage,
        "Message",
        params
      );
    });
  };

  const onSendImage = async () => {
    if (isSendingImage) return;

    const image = await selectImage();
    if (!image) return;

    setIsSendingImage(true);
    try {
      const imageUrl = await uploadImage(image, `image_${Date.now()}`);
      if (!imageUrl) {
        alert("Unable to save image!!!");
        return;
      }

      await addDoc(collection(db, "messages"), {
        participants: [userId, otherUserId],
        message: "Sent a image",
        image: imageUrl,
        seen: false,
        sentAt: serverTimestamp(),
        senderId: userId,
      });
      // if (!allowNotif) return;

      let params = { otherUserId: userId, otherUserName: userName };
      if (userImage) params["otherUserImage"] = userImage;
      addNotif(
        otherUserId,
        `Message from ${otherUserName}`,
        "Sent a image",
        "Message",
        params
      );
    } catch (e) {
      console.log(e, "error sending image");

      alert("Error sending image!!!");
    } finally {
      setIsSendingImage(false);
    }
  };

  // function getDateTime() {
  //   const date = new Date();
  //   const day = String(date.getDate()).padStart(2, "0");
  //   const month = String(date.getMonth() + 1).padStart(2, "0");
  //   const year = date.getFullYear();
  //   const hours = String(date.getHours()).padStart(2, "0");
  //   const minutes = String(date.getMinutes()).padStart(2, "0");
  //   const seconds = String(date.getSeconds()).padStart(2, "0");

  //   return `${month}-${day}-${year} ${hours}:${minutes}:${seconds}`;
  // }

  const handleDeleteConversation = () =>
    loadingProcess(async () => {
      for (const m of messages) {
        await remove("messages", m.id);
      }
      setIsModalVisible(false);
    });

  const handleReport = () => {
    setIsReportModalVisible(true);
    setIsModalVisible(false);
  };

  const renderItem = (item, navigation) => (
    <View
      key={item.id}
      style={[
        styles.messageRow,
        item.isUserSender ? styles.sentMessageRow : styles.receivedMessageRow,
      ]}
    >
      {!item.isUserSender && (
        <ProfileImageScreen
          image={otherUserImage}
          name={otherUserName}
          style={{
            width: 36,
            height: 36,
            borderRadius: 28,
            marginRight: 8,
          }}
          textSize={18}
        />

        // <Image
        //   source={{ uri: otherUserImage }}
        //   style={{
        //     width: 36,
        //     height: 36,
        //     borderRadius: 28,
        //     backgroundColor: "#F0F0F0",
        //     justifyContent: "center",
        //     alignItems: "center",
        //     marginRight: 8,
        //   }}
        // />
      )}
      {/* <View style={styles.avatar}> */}
      {/* <Text style={styles.avatarText}>{otherUserName.charAt(0)}</Text> */}
      {/* </View> */}
      <View
        style={[
          styles.messageBubble,
          item.isUserSender
            ? styles.sentMessageBubble
            : styles.receivedMessageBubble,
        ]}
      >
        {!item.isUserSender && (
          <Text style={styles.senderName}>{otherUserName}</Text>
        )}
        {item.image ? (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ImagePreview", { image: item.image })
            }
          >
            <Image
              source={{ uri: item.image }}
              resizeMode="contain"
              style={{
                width: 120,
                aspectRatio: 1,
                maxHeight: 160,
                borderRadius: 5,
              }}
            />
          </TouchableOpacity>
        ) : (
          <Text
            style={[
              styles.messageText,
              item.isUserSender && styles.sentMessageText,
            ]}
          >
            {item.message}
          </Text>
        )}
        <Text style={[styles.timeText]}>{item.sentAt ?? "Sending..."}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{otherUserName}</Text>
        <TouchableOpacity onPress={() => setIsModalVisible((prev) => !prev)}>
          <Icon name="dots-vertical" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {messages.length == 0 ? (
          <EmptyScreen message="No messages found." />
        ) : (
          <ScrollView
            ref={scrollViewRef}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
            contentContainerStyle={styles.messageList}
            scrollEventThrottle={16}
          >
            {messages.map((message) => renderItem(message, navigation))}
          </ScrollView>
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer}
      >
        <TouchableOpacity onPress={onSendImage} style={styles.attachButton}>
          {isSendingImage ? (
            <ActivityIndicator size="small" color="#666" />
          ) : (
            <Icon name="plus" size={24} color="#666" />
          )}
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="#999"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="send" size={22} color="#fff" />
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleDeleteConversation}
            >
              <Feather name="trash-2" size={20} color="#FF3B30" />
              <Text style={styles.modalOptionTextDelete}>
                Delete Conversation
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOption} onPress={handleReport}>
              <Feather name="user-minus" size={20} color="#FF3B30" />
              <Text style={styles.modalOptionTextDelete}>Report</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ReportModal
        visible={isReportModalVisible}
        onCancel={() => setIsReportModalVisible(false)}
        otherUserId={otherUserId}
        otherUserName={otherUserName}
        otherUserImage={otherUserImage}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  messageList: {
    padding: 16,
    paddingBottom: 15,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  receivedMessageRow: {
    justifyContent: "flex-start",
  },
  sentMessageRow: {
    justifyContent: "flex-end",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFB800",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 20,
  },
  receivedMessageBubble: {
    backgroundColor: "#F0F0F0",
  },
  sentMessageBubble: {
    backgroundColor: "#FFB800",
  },
  senderName: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
  },
  modalContent: {
    backgroundColor: "#fff",
    marginTop: 60,
    marginRight: 20,
    marginLeft: "auto",
    borderRadius: 8,
    width: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  modalOptionTextDelete: {
    color: "#FF3B30",
    marginLeft: 10,
    fontSize: 16,
  },
  sentMessageText: {
    color: "#FFFFFF",
  },
  timeText: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  sentTimeText: {
    color: "#FFFFFF",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    backgroundColor: "#FFFFFF",
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#FFB800",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MessageScreen;
