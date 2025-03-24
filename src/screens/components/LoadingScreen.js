import { View, Text, Modal, ActivityIndicator, StyleSheet } from "react-native";
import { useSelector } from "react-redux";

const LoadingScreen = () => {
  const loading = useSelector((state) => state.loading.value);

  //   const toggleLoading = () => {
  //     setLoading(!loading);
  //   };

  if (!loading) return

  return (
    <View style={styles.container}>
      <Modal
        transparent={true}
        visible={loading}
        animationType="fade"
        // onRequestClose={toggleLoading}
      >
        <View style={styles.overlay}>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dim the background
  },
  loaderContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.8)", // Optional: Darken the background around the spinner
    borderRadius: 10,
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
});

export default LoadingScreen;
