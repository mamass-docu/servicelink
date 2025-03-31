import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { db } from "../../db/firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useAppContext } from "../../../AppProvider";
import { DateTimeConverter } from "../../helpers/DateTimeConverter";
import {
  add,
  loadingProcess,
  remove,
  serverTimestamp,
  specificLoadingProcess,
  useSelector,
} from "../../helpers/databaseHelper";
import { selectImage } from "../../helpers/ImageSelector";
import { uploadImage } from "../../helpers/cloudinary";

const ChatSupportScreen = ({ navigation }) => {
  const { userId } = useAppContext();
  const [message, setMessage] = useState("");
  const scrollViewRef = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSendingImage, setIsSendingImage] = useState(false);

  const [messages, setMessages] = useState([]);

  const isLoading = useSelector((state) => state.loading.specific);

  useEffect(() => {
    const messageQuery = query(
      collection(db, "supportChats"),
      where("senderId", "==", userId),
      orderBy("sentAt", "asc")
    );
    const unsubscribe = onSnapshot(messageQuery, (snapshot) => {
      setMessages(
        snapshot.docs.map((dc) => {
          const message = dc.data();
          return {
            id: dc.id,
            message: message.message,
            image: message.image,
            isUser: message.isUser,
            sentAt: DateTimeConverter(message.sentAt),
          };
        })
      );
    });

    return () => {
      console.log("unsubs message");
      unsubscribe();
    };
  }, []);

  const handleDeleteConversation = async () => {
    setIsModalVisible(false);
    if (messages.length == 0) {
      alert("No conversation to delete!!!");
      return;
    }

    for (const mess of messages) {
      await remove("supportChats", mess.id);
    }
    // setMessages([]);
    alert("Successfully deleted conversation.");
  };

  const handleSendMessage = () => {
    if (isLoading || message.trim() == "") return;

    specificLoadingProcess(async () => {
      await add("supportChats", {
        message: message.trim(),
        senderId: userId,
        isUser: true,
        sentAt: serverTimestamp(),
      });
      setMessage("");
    });
    // scrollViewRef.current?.scrollToEnd({ animated: true });
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

      await addDoc(collection(db, "supportChats"), {
        message: "Sent a image",
        image: imageUrl,
        isUser: true,
        sentAt: serverTimestamp(),
        senderId: userId,
      });
    } catch (e) {
      console.log(e, "error sending image");

      alert("Error sending image!!!");
    } finally {
      setIsSendingImage(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFB800" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <View style={styles.headerTopContent}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Feather name="arrow-left" size={24} color="#fff" />
              </TouchableOpacity>
              <View style={styles.profileSection}>
                <Image
                  style={styles.profileImage}
                  source={require("../../../assets/images/admin_avatar.png")}
                />
                <Text style={styles.chatText}>Chat with</Text>
                <Text style={styles.nameText}>Admin Support</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                <Feather name="more-vertical" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* More Options Modal */}
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
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Messages */}
      <ScrollView
        style={styles.messagesContainer}
        ref={scrollViewRef}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageBubble,
              msg.isUser ? styles.userMessage : styles.adminMessage,
            ]}
          >
            {msg.image ? (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("ImagePreview", { image: msg.image })
                }
              >
                <Image
                  source={{ uri: msg.image }}
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
                  msg.isUser ? styles.userMessageText : styles.adminMessageText,
                ]}
              >
                {msg.message}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer}
      >
        <View style={styles.inputWrapper}>
          {/* <TouchableOpacity style={styles.iconButton}>
            <Feather name="paperclip" size={20} color="#666" />
          </TouchableOpacity> */}
          <TouchableOpacity onPress={onSendImage} style={styles.iconButton}>
            {isSendingImage ? (
              <ActivityIndicator size="small" color="#666" />
            ) : (
              <Feather name="image" size={20} color="#666" />
            )}
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.iconButton}>
            <Feather name="smile" size={20} color="#666" />
          </TouchableOpacity> */}
          <TextInput
            style={styles.input}
            placeholder="Enter your message..."
            placeholderTextColor="#999"
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !message && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!message}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    backgroundColor: "#FFB800",
    paddingTop: Platform.OS === "ios" ? 0 : 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTop: {
    padding: 15,
  },
  headerTopContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: "#fff",
  },
  chatText: {
    color: "#fff",
    fontSize: 14,
    marginRight: 5,
  },
  nameText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  chevronButton: {
    marginLeft: 15,
  },
  onlineText: {
    color: "#fff",
    fontSize: 14,
    marginTop: 8,
    marginLeft: 42,
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
  messagesContainer: {
    flex: 1,
    padding: 15,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 20,
    marginBottom: 8,
  },
  userMessage: {
    backgroundColor: "#FFB800",
    alignSelf: "flex-end",
    borderTopRightRadius: 4,
  },
  adminMessage: {
    backgroundColor: "#F0F0F0",
    alignSelf: "flex-start",
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: "#fff",
  },
  adminMessageText: {
    color: "#333",
  },
  inputContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  iconButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 10,
    fontSize: 14,
    color: "#333",
  },
  sendButton: {
    width: 35,
    height: 35,
    backgroundColor: "#FFB800",
    borderRadius: 17.5,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default ChatSupportScreen;
