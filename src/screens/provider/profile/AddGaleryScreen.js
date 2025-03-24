import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { selectImage } from "../../../helpers/ImageSelector";
import { add, loadingProcess } from "../../../helpers/databaseHelper";
import { uploadImage } from "../../../helpers/cloudinary";
import { useAppContext } from "../../../../AppProvider";

export default function AddGaleryScreen({ navigation }) {
  const { userId } = useAppContext();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [image, setImage] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const pickImage = async () => {
    const image = await selectImage();
    setImage(image);
  };

  const handleChangeImage = async () => {
    const image = await selectImage();
    if (image) setImage(image);
  };

  const onSave = () => {
    if (title.trim() == "") {
      alert("Please enter a title!!!");
      return;
    }
    if (image == null) {
      alert("Please provide a image!!!");
      return;
    }

    loadingProcess(async () => {
      const imageUrl = await uploadImage(image, getFormattedDateTime());
      await add("galleries", {
        title: title,
        date: date.toLocaleDateString(),
        image: imageUrl,
        providerId: userId,
      });

      setTitle("");
      setDate(new Date());
      setImage(null);
      alert("Successfully saved.");
    });
  };

  function getFormattedDateTime() {
    const now = new Date();

    const mm = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const dd = String(now.getDate()).padStart(2, "0");
    const yyyy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, "0");
    const ii = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");

    return `${mm}${dd}${yyyy}${hh}${ii}${ss}`;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Image to Gallery</Text>
        <View></View>
      </View>

      <ScrollView style={{ margin: 20 }}>
        <View style={{ marginTop: 10 }}>
          <Text style={styles.label}>Title</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              height: 56,
              backgroundColor: "#F7F7F7",
              borderRadius: 12,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: "#E0E0E0",
            }}
          >
            <TextInput
              style={{
                flex: 1,
                marginLeft: 12,
                fontFamily: "Poppins-Regular",
                fontSize: 16,
                color: "#1A1A1A",
              }}
              placeholder="Enter title"
              placeholderTextColor="#999"
              value={title}
              onChangeText={(text) => setTitle(text)}
            />
          </View>
        </View>
        <View style={{ marginTop: 10 }}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#F5F5F5",
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
              height: 56,
            }}
            onPress={() => setShowDatePicker(true)}
          >
            <Feather
              style={{ marginLeft: 12 }}
              name="calendar"
              size={20}
              color="#666"
            />
            <Text
              style={{
                marginLeft: 8,
                fontSize: 16,
                color: "#333333",
              }}
            >
              {date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}
        </View>

        <View style={{ marginTop: 10 }}>
          <Text style={styles.label}>Image</Text>
          {image ? (
            <View style={{ alignItems: "center" }}>
              <Image
                source={{ uri: image.uri }}
                style={{
                  width: 300,
                  height: 300,
                  resizeMode: "contain",
                  marginBottom: 16,
                  borderRadius: 12,
                }}
              />
              <View style={styles.qrButtonsContainer}>
                <TouchableOpacity
                  style={styles.changeQrButton}
                  onPress={handleChangeImage}
                >
                  <Text style={styles.changeQrButtonText}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Feather name="upload" size={24} color="#666666" />
              <Text style={styles.uploadButtonText}>Upload Image</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.saveButton} onPress={onSave}>
        <Text style={styles.saveButtonText}>Add to Gallery</Text>
      </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  label: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  qrButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  changeQrButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    marginHorizontal: 8,
  },
  changeQrButtonText: {
    fontSize: 14,
    color: "#333333",
  },
  removeButton: {
    backgroundColor: "#FFF0F0",
  },
  removeButtonText: {
    fontSize: 14,
    color: "#FF3B30",
  },
  uploadButton: {
    height: 120,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
  },
  uploadButtonText: {
    fontSize: 14,
    color: "#666666",
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: "#FFB800",
    padding: 16,
    margin: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#FFB800",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
