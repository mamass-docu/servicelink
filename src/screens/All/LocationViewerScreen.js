import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { loadingProcess } from "../../helpers/databaseHelper";
import { Feather } from "@expo/vector-icons";

const LocationViewerScreen = ({ route, navigation }) => {
  const [region, setRegion] = useState(null);

  const { address } = route.params;

  useEffect(() => {
    loadingProcess(async () => {
      const geocode = await Location.geocodeAsync(address);
      if (geocode.length > 0) {
        setRegion({
          latitude: geocode[0].latitude,
          longitude: geocode[0].longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } else {
        alert("Address not found");
      }
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#EEEEEE",
        }}
      >
        <TouchableOpacity
          style={{
            marginRight: 16,
          }}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: "#333333",
          }}
        >
          Viewing of Location
        </Text>
      </View>

      {region ? (
        <MapView style={styles.map} initialRegion={region}>
          <Marker coordinate={region} title={address} />
        </MapView>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});

export default LocationViewerScreen;
