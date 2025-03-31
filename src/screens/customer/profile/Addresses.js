import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppContext } from "../../../../AppProvider";
import { find, loadingProcess, update } from "../../../helpers/databaseHelper";
import LocationPickerModal from "../../components/LocationPickerModal";

const AddressModal = ({
  showAddModal,
  setShowAddModal,
  //   selectedIndex,
  //   setSelectedIndex,
  //   label,
  //   setLabel,
  //   address,
  //   setAddress,
  //   city,
  //   setCity,
  //   isDefault,
  //   setIsDefault,
  showLocation,
  addresses,
  setAddresses,
  curAddress,
  setCurrAddress,
  userId,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [label, setLabel] = useState(null);
  const [address, setAddress] = useState(null);
  const [city, setCity] = useState(null);
  const [isDefault, setIsDefault] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  useEffect(() => {
    if (!curAddress) return;

    setSelectedIndex(curAddress.index);
    setAddress(curAddress.address);
    setCity(curAddress.city);
    setLabel(curAddress.label);
    setIsDefault(curAddress.default);
  }, [curAddress]);

  const handleAddAddress = () => {
    if (!address || !label || !city) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    loadingProcess(async () => {
      let updatedAddress = [];
      if (selectedIndex != null) {
        // Update existing address
        updatedAddress = addresses.map((addr, index) =>
          index === selectedIndex
            ? {
                address: address,
                city: city,
                label: label,
                default: isDefault,
              }
            : addr
        );
      } else {
        // Add new address
        updatedAddress = [
          ...addresses,
          {
            label: label,
            address: address,
            city: city,
            default: isDefault,
          },
        ];
      }

      await update("users", userId, {
        addresses: updatedAddress,
      });

      setAddresses(updatedAddress);
      resetFields();
    });
  };

  const handleLocationSelect = (loc) => {
    setAddress(loc);
  };

  function resetFields() {
    setSelectedIndex(null);
    setAddress(null);
    setCity(null);
    setIsDefault(false);
    setLabel(null);
    setCurrAddress(null);
    setShowAddModal(false);
  }

  const handleEditAddress = (index, address) => {
    setSelectedIndex(index);
    setAddress(address.address);
    setCity(address.city);
    setLabel(address.label);
    setIsDefault(address.default);
    setShowAddModal(true);
  };

  return (
    <Modal
      visible={showAddModal}
      transparent={true}
      animationType="slide"
      onRequestClose={resetFields}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {selectedIndex != null ? "Edit Address" : "Add New Address"}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Label (e.g., Home, Office)</Text>
            <TextInput
              style={styles.input}
              value={label}
              onChangeText={(text) => setLabel(text)}
              placeholder="Enter label"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Address</Text>
          </View>
          <View
            style={{
              marginBottom: 35,
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TextInput
              style={[styles.input, { flex: 1, height: 45 }]}
              value={address}
              onChangeText={(text) => setAddress(text)}
              placeholder="Enter street address"
              multiline
            />
            {showLocation ? (
              <TouchableOpacity
                style={{ marginLeft: 10, height: 20 }}
                onPress={() => setShowLocationPicker(true)}
              >
                <Feather name="map-pin" size={20} color="#666" />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={(text) => setCity(text)}
              placeholder="Enter city"
            />
          </View>

          {/* <TouchableOpacity
            style={styles.defaultCheckbox}
            onPress={() => setIsDefault(!isDefault)}
          >
            <View
              style={[styles.checkbox, isDefault && styles.checkboxChecked]}
            >
              {isDefault && <Feather name="check" size={16} color="#FFF" />}
            </View>
            <Text style={styles.checkboxLabel}>Set as default address</Text>
          </TouchableOpacity> */}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={resetFields}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleAddAddress}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <LocationPickerModal
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelectLocation={handleLocationSelect}
      />
    </Modal>
  );
};

export default function Addresses({ navigation }) {
  const { userId, settingsRef } = useAppContext();
  const [addresses, setAddresses] = useState([]);

  //   {
  //     id: 1,
  //     label: "Home",
  //     address: "123 Main Street, Barangay San Antonio",
  //     city: "Makati City",
  //     default: true,
  //   },
  //   {
  //     id: 2,
  //     label: "Office",
  //     address: "456 Corporate Ave, Barangay Bel-Air",
  //     city: "Makati City",
  //     default: false,
  //   },
  // ]);

  const [showAddModal, setShowAddModal] = useState(false);
  //   const [selectedIndex, setSelectedIndex] = useState(null);
  //   const [label, setLabel] = useState(null);
  const [address, setAddress] = useState(null);
  //   const [city, setCity] = useState(null);
  //   const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    loadingProcess(async () => {
      const snap = await find("users", userId);
      const userData = snap.data();
      // const userSnapshot = await getDoc(doc(db, "users", userId));

      if (userData?.addresses) setAddresses(userData?.addresses);
    });
  }, []);

  const handleEditAddress = (index, item) => {
    setAddress({
      index: index,
      ...item,
    });
    setShowAddModal(true);
  };

  const handleDeleteAddress = (index) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            const data = addresses.filter((addr, i) => i !== index);
            setAddresses(data);
            updateAddress(data);
          },
          style: "destructive",
        },
      ]
    );
  };

  function updateAddress(data) {
    loadingProcess(async () => {
      await update("users", userId, {
        addresses: data,
      });
    });
  }

  const handleSetDefault = (index) => {
    try {
      console.log("afsksdfj");

      const data = addresses.map((addr, i) => ({
        ...addr,
        default: i === index,
      }));
      setAddresses(data);

      updateAddress(data);
    } catch (e) {
      console.log(e, "error setting address default");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.content}>
        {addresses.map((address, index) => (
          <View key={index} style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <View style={styles.labelContainer}>
                <Text style={styles.labelText}>{address.label}</Text>
                {address.default && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditAddress(index, address)}
                >
                  <Feather name="edit" size={20} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteAddress(index)}
                >
                  <Feather name="trash-2" size={20} color="#FF4444" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.addressText}>{address.address}</Text>
            <Text style={styles.cityText}>{address.city}</Text>
            {!address.default && (
              <TouchableOpacity
                style={styles.setDefaultButton}
                onPress={() => handleSetDefault(index)}
              >
                <Text style={styles.setDefaultText}>Set as Default</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add New Address</Text>
      </TouchableOpacity>

      <AddressModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        // selectedIndex={selectedIndex}
        // setSelectedIndex={setSelectedIndex}
        // label={label}
        // setLabel={setLabel}
        showLocation={settingsRef.current.showLocation}
        curAddress={address}
        setCurrAddress={setAddress}
        // city={city}
        // setCity={setCity}
        // isDefault={isDefault}
        // setIsDefault={setIsDefault}
        addresses={addresses}
        setAddresses={setAddresses}
        userId={userId}
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
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  addressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  labelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: "#FFB800",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  cityText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  setDefaultButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#FFF9E6",
  },
  setDefaultText: {
    fontSize: 14,
    color: "#FFB800",
    fontWeight: "500",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFB800",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  defaultCheckbox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFB800",
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#FFB800",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#FFB800",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
