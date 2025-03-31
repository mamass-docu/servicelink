import {
  View,
  Dimensions,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { width, height } = Dimensions.get("window");

export const ImagePreviewScreen = ({ route, navigation }) => {
  const { image } = route.params;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#F5F5F5",
      }}
    >
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      <View
        style={{
          backgroundColor: "#FFFFFF",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
          paddingTop: 20,
          borderBottomWidth: 1,
          borderBottomColor: "#EEEEEE",
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={{ uri: image }}
          resizeMode="contain"
          style={{
            width: width - 10,
            aspectRatio: 1,
            maxHeight: height - 10,
          }}
        />
      </View>
    </SafeAreaView>
  );
};
