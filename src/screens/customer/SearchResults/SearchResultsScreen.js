import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ScrollView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
// import { services } from "../../../services";
import { useFocusEffect } from "@react-navigation/native";
import { all, loadingProcess } from "../../../helpers/databaseHelper";

const SearchResultsScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [services, setServices] = useState([]);

  // const popularServices = [
  //   "Plumbing Services",
  //   "Laundry",
  //   "Car Wash",
  //   "Cellphone Repair",
  //   "House Cleaning",
  // ];

  useFocusEffect(
    useCallback(() => {
      loadingProcess(async () => {
        const snap = await all("providerServices");
        setServices(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });
    }, [])
  );

  const onSearch = () => {
    if (searchQuery.trim() == "") {
      setSearchResults([]);
      return;
    }
    const searchValue = searchQuery.trim().toLowerCase();

    setSearchResults(
      services.filter(
        (item) =>
          item.task.toLowerCase().includes(searchValue) ||
          item.providerName.toLowerCase().includes(searchValue) ||
          item.service.toLowerCase().includes(searchValue)
      )
    );
    setSearchQuery("");
  };

  const handleClearSearch = () => {
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleServicePress = (provider) => {
    navigation.navigate("BookService", {
      provider: provider,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for service's"
            value={searchQuery}
            onSubmitEditing={onSearch}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <Feather name="x" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView>
        {/* Popular Services Section */}
        <View style={styles.popularServicesContainer}>
          <Text style={styles.sectionTitle}>Search Results</Text>
          {searchResults.map((service, index) => (
            <TouchableOpacity
              key={index}
              style={styles.serviceItem}
              onPress={() => handleServicePress(service)}
            >
              <Text style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>
                {service.providerName}
              </Text>
              <Text style={{ fontSize: 15, fontStyle: "italic" }}>
                {service.task}/{service.service}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 8,
    marginVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    padding: 0, // Removes default padding on Android
  },
  popularServicesContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  serviceItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  serviceText: {
    fontSize: 16,
    color: "#333",
  },
});

export default SearchResultsScreen;
