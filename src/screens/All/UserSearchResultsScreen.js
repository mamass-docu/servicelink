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
import EmptyScreen from "../components/EmptyScreen";
import { all, loadingProcess } from "../../helpers/databaseHelper";
import { useAppContext } from "../../../AppProvider";
import { useFocusEffect } from "@react-navigation/native";
import ProfileImageScreen from "../components/ProfileImage";

const UserSearchResultsScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [users, setUsers] = useState([]);
  const { userId } = useAppContext();

  useFocusEffect(
    useCallback(() => {
      loadingProcess(async () => {
        const snap = await all("users");
        let temp = [];
        snap.docs.forEach((doc) => {
          if (doc.id == userId) return;

          const data = doc.data();
          temp.push({
            id: doc.id,
            name: data.name,
            image: data.image,
          });
        });
        setUsers(temp);
        // setSearchResults(temp);
      });

      return () => {
        setSearchQuery("");
        // setSearchResults(users)
      };
    }, [])
  );

  // const onSearch = () => {
  //   if (searchQuery.trim() == "") {
  //     setSearchResults([]);
  //     return;
  //   }

  //   setSearchResults(
  //     users.filter((item) =>
  //       item.name?.toLowerCase().includes(searchQuery.toLowerCase())
  //     )
  //   );
  //   setSearchQuery("");
  // };

  const handleClearSearch = () => {
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleServicePress = (user) => {
    navigation.navigate("Message", {
      otherUserId: user.id,
      otherUserName: user.name,
      otherUserImage: user.image,
    });
  };

  const onSearchChange = (value) => {
    setSearchQuery(value);

    if (value.trim() == "") {
      setSearchResults([]);
      return;
    }

    setSearchResults(
      users.filter((item) =>
        item.name?.toLowerCase().includes(value.toLowerCase())
      )
    );
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
            placeholder="Search for other users"
            value={searchQuery}
            // onSubmitEditing={onSearch}
            onChangeText={onSearchChange}
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <Feather name="x" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {searchResults.length == 0 ? (
        <EmptyScreen message={"No users found"} />
      ) : (
        <ScrollView>
          {/* Popular Services Section */}
          <View style={styles.popularServicesContainer}>
            <Text style={styles.sectionTitle}>Search Results</Text>
            {searchResults.map((user) => (
              <TouchableOpacity
                key={user.id}
                // style={styles.serviceItem}
                onPress={() => handleServicePress(user)}
              >
                <View
                  style={{
                    ...styles.serviceItem,
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <ProfileImageScreen
                    image={user.image}
                    name={user.name}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 28,
                      marginRight: 10,
                    }}
                  />
                  <Text style={styles.serviceText}>{user.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
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

export default UserSearchResultsScreen;
