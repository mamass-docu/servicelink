import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  get,
  loadingProcess,
  orderBy,
  remove,
  where,
} from "../../helpers/databaseHelper";
import { Feather } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
const imageSize = parseInt((width - 60) / 3);
const maxHeight = height - 200;

export default function Gallery({ providerId, isProvider, navigation }) {
  const [galleries, setGalleries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  const [allSelected, setAllSelected] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedImgs, setSelectedImgs] = useState({});

  const refresh = () => {
    get(
      "galleries",
      where("providerId", "==", providerId),
      orderBy("date", "desc")
    ).then(({ docs }) => {
      let temp = [];
      let temp1 = {};
      for (const doc of docs) {
        temp.push({
          id: doc.id,
          ...doc.data(),
        });
        temp1[doc.id] = false;
      }
      setGalleries(temp);
      setSelectedImgs(temp1);
    });
  };

  useFocusEffect(useCallback(refresh, []));

  useEffect(() => {
    let has = false;
    let all = true;
    for (const id in selectedImgs) {
      if (selectedImgs[id]) has = true;
      else all = false;
    }
    setHasSelected(has);
    setAllSelected(all);
  }, [selectedImgs]);

  const setSelection = (id) => {
    if (!isProvider) return;

    setSelectedImgs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const onSelectAll = () => {
    if (galleries.length == 0) return;

    const all = !allSelected;
    let imgs = selectedImgs;

    for (const id in selectedImgs) {
      imgs[id] = all;
    }

    setSelectedImgs((prev) => ({ ...prev, ...imgs }));
  };

  const onClickImg = (gallery) => {
    if (isProvider && hasSelected) {
      setSelectedImgs((prev) => ({ ...prev, [gallery.id]: !prev[gallery.id] }));
      return;
    }

    setSelected(gallery);
    setShowModal(true);
  };

  const onDelete = () => {
    if (!hasSelected) {
      alert("Please select an image to delete");
      return;
    }

    Alert.alert(
      "Delete Confirmation",
      "Are you sure you want to delete this images?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            loadingProcess(async () => {
              for (const id in selectedImgs) {
                if (selectedImgs[id]) await remove("galleries", id);
              }

              refresh();
              alert("Successfully deleted.");
            });
          },
          style: "destructive",
        },
      ]
    );

    // setSelectedImgs((prev) => {
    //   const updatedState = { ...prev };

    //   for (const id of Object.keys(updatedState)) {
    //     if (updatedState[id]) delete updatedState[id];
    //   }

    //   return updatedState;
    // });
  };

  return (
    <View
      style={{
        flex: 1,
        margin: 10,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          flex: 1,
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginRight: 10,
        }}
      >
        <View>
          <View
            style={{ flexDirection: "row", flex: 1, alignItems: "flex-end" }}
          >
            <Feather name="image" size={22} color="#666" />
            <Text style={{ fontSize: 16, fontWeight: 700, marginLeft: 10 }}>
              Recent Service Gallery
            </Text>
          </View>
          <Text
            style={{
              fontSize: 15,
              fontWeight: 500,
              marginTop: 15,
              marginLeft: 30,
              color: "#666",
            }}
          >
            View our recent services
          </Text>
        </View>

        {isProvider ? (
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#FFF9E6",
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
            }}
            onPress={() => navigation.navigate("AddGallery")}
          >
            <Icon name="plus" size={20} color="#FFB800" />
            <Text
              style={{
                fontSize: 14,
                color: "#FFB800",
                fontWeight: "600",
                marginLeft: 4,
              }}
            >
              Add Image
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {isProvider ? (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginLeft: 10,
            marginTop: 15,
            marginBottom: 10,
            marginRight: 10,
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: "row",
              borderWidth: 2,
              borderColor: "#FFB800",
              paddingHorizontal: 10,
              borderRadius: 5,
              alignItems: "center",
            }}
            onPress={onSelectAll}
          >
            {allSelected && galleries.length > 0 ? (
              <Icon name="check-circle" size={22} color="#00FFFF" />
            ) : (
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 20,
                  borderWidth: 2,
                  borderColor: "#FFB800",
                }}
              />
            )}

            <Text
              style={{
                marginLeft: 5,
                color: "#FFB800",
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              Select All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#FF0000",
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
            }}
            onPress={onDelete}
          >
            <Icon name="delete" size={20} color="#fff" />
            <Text
              style={{
                fontSize: 14,
                color: "#fff",
                fontWeight: "600",
                marginLeft: 4,
              }}
            >
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View
        style={{
          flex: 1,
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "flex-start",
          gap: 10,
          margin: 10,
        }}
      >
        {galleries.map((gallery) => (
          <TouchableOpacity
            key={gallery.id}
            onPress={() => onClickImg(gallery)}
            onLongPress={() => setSelection(gallery.id)}
            style={{ position: "relative" }}
          >
            <Image
              key={gallery.id}
              style={{
                width: imageSize,
                // aspectRatio:1,
                height: imageSize,
                resizeMode: "contain",
                borderRadius: 12,
              }}
              source={{ uri: gallery.image }}
            />

            {hasSelected ? (
              selectedImgs[gallery.id] ? (
                <Icon
                  style={{
                    position: "absolute",
                    bottom: 5,
                    right: 5,
                  }}
                  name="check-circle"
                  size={20}
                  color="#00FFFF"
                />
              ) : (
                <View
                  style={{
                    position: "absolute",
                    bottom: 5,
                    right: 5,
                    width: 20,
                    height: 20,
                    borderWidth: 2,
                    borderRadius: 20,
                    borderColor: "#00FFFF",
                  }}
                />
              )
            ) : null}
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={showModal} transparent={true} animationType="fade">
        <SafeAreaView
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
          }}
        >
          <TouchableOpacity
            style={{
              top: 0,
              right: 10,
              position: "absolute",
            }}
            onPress={() => {
              setSelected(null);
              setShowModal(false);
            }}
          >
            <Text
              style={{
                color: "#fff",
                top: 0,
                right: 0,
                padding: 10,
                fontSize: 25,
                fontWeight: 600,
                position: "absolute",
              }}
            >
              X
            </Text>
          </TouchableOpacity>

          <Image
            resizeMode="contain"
            style={{ width: "95%", aspectRatio: 1, maxHeight: maxHeight }}
            source={{
              uri: selected?.image,
            }}
          />

          <View
            style={{
              borderRadius: 5,
              marginTop: 20,
              padding: 15,
              width: "95%",
              backgroundColor: "#000000",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#fff",
              }}
            >
              {selected?.title}
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "300",
                marginTop: 10,
                color: "#fff",
              }}
            >
              {selected?.date}
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
