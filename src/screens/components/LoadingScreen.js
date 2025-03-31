import React from "react";
import { View, Text, Modal, ActivityIndicator, StyleSheet } from "react-native";
import { useSelector } from "react-redux";

const LoadingScreen = () => {
  const loading = useSelector((state) => state.loading.value);

  if (!loading) return null;

  return (
    <Modal transparent={true} visible={loading} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dim the background
  },
  loaderContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
});

export default LoadingScreen;
