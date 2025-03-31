import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { find, loadingProcess } from "../../../helpers/databaseHelper";

const PaymentOptionsScreen = ({ navigation, route }) => {
  const { setPaymentMethod, price, setReferenceNo, providerId, setReceipt } =
    route.params;
  const [hasGcash, setHasGcash] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadingProcess(async () => {
        const snap = await find("providerGCash", providerId);
        if (snap.exists()) setHasGcash(true);
      });
    }, [])
  );

  // const handlePaymentSelect = (method) => {
  //   setReferenceNo(null);
  //   setPaymentMethod(method);
  //   navigation.goBack();
  // };

  const onGCash = () => {
    if (!hasGcash) {
      alert("GCash is not available for this provider.");
      return;
    }

    navigation.navigate("GCashPayment", {
      price,
      onSubmitPayment,
      providerId,
    });
  };

  // const onMaya = () => {
  //   navigation.navigate("PayMayaPayment", {
  //     price,
  //     onSubmitPayment,
  //   });
  // };

  const onSubmitPayment = (method, reference, receipt) => {
    setPaymentMethod(method);
    setReferenceNo(reference);
    setReceipt(receipt);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Method</Text>
      </View>

      <View style={styles.content}>
        {/* Payment Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.paymentOption} onPress={onGCash}>
            <View style={styles.optionLeft}>
              <Image
                source={require("../../../../assets/images/gcash.png")}
                style={styles.paymentIcon}
                resizeMode="contain"
              />
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>GCash</Text>
                <Text style={styles.optionSubtitle}>
                  Pay with GCash e-wallet
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={24} color="#DDD" />
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.paymentOption} onPress={onMaya}>
            <View style={styles.optionLeft}>
              <Image
                source={require("../../../../assets/images/maya.png")}
                style={styles.paymentIcon}
                resizeMode="contain"
              />
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Maya</Text>
                <Text style={styles.optionSubtitle}>
                  Pay with Maya e-wallet
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={24} color="#DDD" />
          </TouchableOpacity> */}

          {/* <TouchableOpacity
            style={styles.paymentOption}
            onPress={() => handlePaymentSelect("COD")}
          >
            <View style={styles.optionLeft}>
              <View style={styles.codIconContainer}>
                <Feather name="dollar-sign" size={24} color="#FFB800" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Cash on Delivery</Text>
                <Text style={styles.optionSubtitle}>
                  Pay when service is complete
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={24} color="#DDD" />
          </TouchableOpacity> */}
        </View>
      </View>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  optionsContainer: {
    marginTop: 8,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    marginRight: 16,
  },
  codIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#FFF9E6",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: "#999",
  },
});

export default PaymentOptionsScreen;
