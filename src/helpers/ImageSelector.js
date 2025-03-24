import * as ImagePicker from "expo-image-picker";

const selectImage = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== "granted") {
    alert("Sorry, we need camera roll permissions to make this work!");
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 1,
  });

  return result.canceled ? null : result.assets[0];
};

export { selectImage };
