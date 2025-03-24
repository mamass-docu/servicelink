// src/screens/ServiceProvider/TransactionScreen.js
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  // FlatList,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { get, loadingProcess, where } from "../../../helpers/databaseHelper";
import { useAppContext } from "../../../../AppProvider";
import ListScreen from "../../components/ListScreen";
import { DateTimeConverter } from "../../../helpers/DateTimeConverter";

const TransactionScreen = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);

  const { userId } = useAppContext();

  // Dummy data for transactions
  // const transactions = [
  //   {
  //     id: '1',
  //     customerName: 'John Doe',
  //     service: 'Plumbing Service',
  //     amount: 2500,
  //     date: '2023-11-01',
  //     status: 'completed',
  //     time: '10:30 AM',
  //     paymentMethod: 'Cash',
  //   },
  //   {
  //     id: '2',
  //     customerName: 'Jane Smith',
  //     service: 'Pipe Repair',
  //     amount: 1800,
  //     date: '2023-11-02',
  //     status: 'pending',
  //     time: '2:15 PM',
  //     paymentMethod: 'GCash',
  //   },
  //   {
  //     id: '3',
  //     customerName: 'Mike Johnson',
  //     service: 'Bathroom Repair',
  //     amount: 3500,
  //     date: '2023-11-03',
  //     status: 'completed',
  //     time: '11:45 AM',
  //     paymentMethod: 'Maya',
  //   },
  //   {
  //     id: '4',
  //     customerName: 'Sarah Wilson',
  //     service: 'Kitchen Sink',
  //     amount: 2000,
  //     date: '2023-11-04',
  //     status: 'pending',
  //     time: '3:20 PM',
  //     paymentMethod: 'Cash',
  //   },
  //   {
  //     id: '5',
  //     customerName: 'David Brown',
  //     service: 'Toilet Repair',
  //     amount: 1500,
  //     date: '2023-11-05',
  //     status: 'completed',
  //     time: '9:00 AM',
  //     paymentMethod: 'GCash',
  //   },
  // ];

  useFocusEffect(
    useCallback(() => {
      loadingProcess(async () => {
        const snapData = await get(
          "bookings",
          where("providerId", "==", userId)
        );

        let temp = [];
        snapData.docs.forEach((doc) => {
          const data = doc.data();
          if (data.status == "Confirmed" || data.status == "Declined") return;

          temp.push({
            id: doc.id,
            customerId: data.customerId,
            customerName: data.customerName,
            customerImage: data.customerImage,
            service: data.service,
            task: data.task,
            price: data.price,
            date: data.date,
            time: data.time,
            status: data.status,
            paymentMethod: data.paymentMethod,
            referenceNumber: data.referenceNumber,
            createdAt: DateTimeConverter(data.createdAt),
            confirmedAt: data.confirmedAt,
            declinedAt: data.declinedAt,
            completedAt: data.completedAt,
            address: data.address,
          });
        });

        setAllTransactions(temp);
        setTransactions(temp);
      });

      // return () => {
      //   setTransactions([])
      // }
    }, [])
  );

  const isSameMonth = (date) => {
    const month = date.split("/")[0];
    const currentMonth = new Date().getMonth() + 1;
    return month == currentMonth;
  };

  const setSelectedFilterP = (value) => {
    setSelectedFilter(value);
    setTransactions(
      allTransactions.filter(
        (item) =>
          value == "All" ||
          (value == "month" && isSameMonth(item.date)) ||
          value == item.status
      )
    );
  };

  const FilterButton = ({ title, value }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === value && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedFilterP(value)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === value && styles.filterButtonTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const navigateOnDetails = (item) => {
    navigation.navigate("JobStatus", { bookingId: item.id });
    // navigation.navigate("JobStatus", {
    //   user: {
    //     id:item.customerId,
    //     name:item.customerName,
    //     image:item.customerImage,
    //     date: item.date,
    //     time: item.time,
    //     address: item.address,
    //     status: item.status,
    //     createdAt: item.createdAt,
    //     confirmedAt: item.confirmedAt,
    //     rejectedAt: item.rejectedAt,
    //     completedAt: item.completedAt,
    //   },
    // })
  };

  const TransactionCard = (item) => (
    <TouchableOpacity
      style={styles.transactionCard}
      onPress={() => navigateOnDetails(item)}
    >
      <View style={styles.transactionHeader}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{item.customerName}</Text>
          <Text style={styles.transactionDate}>
            {item.date} • {item.time}
          </Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amountPrefix}>₱</Text>
          <Text style={styles.amount}>{item.price}</Text>
        </View>
      </View>

      <View style={styles.transactionDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Service:</Text>
          <Text style={styles.detailValue}>
            {item.service}/{item.task}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Payment Method:</Text>
          <Text style={styles.detailValue}>{item.paymentMethod}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Reference Number:</Text>
          <Text style={styles.detailValue}>{item.referenceNumber}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status:</Text>
          <View
            style={[
              styles.statusBadge,
              item.status === "Completed"
                ? styles.statusCompleted
                : styles.statusPending,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.status === "Completed"
                  ? styles.statusTextCompleted
                  : styles.statusTextPending,
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Transactions</Text>
        {/* <TouchableOpacity style={styles.filterIcon}>
          <Feather name="filter" size={24} color="#333" />
        </TouchableOpacity> */}
      </View>

      {/* Filter Section */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <FilterButton title="All" value="All" />
          <FilterButton title="Completed" value="Completed" />
          <FilterButton title="Pending" value="Pending" />
          <FilterButton title="This Month" value="month" />
        </ScrollView>
      </View>

      {/* Transactions List */}
      <ListScreen
        data={transactions}
        contentContainerStyle={styles.transactionsList}
        showsVerticalScrollIndicator={false}
        renderItem={TransactionCard}
      />

      {/* <ScrollView
        contentContainerStyle={styles.transactionsList}
        showsVerticalScrollIndicator={false}>
      {
        transactions.map(item => (selectedFilter == "month" && !isSameMonth(item.date)) ||
        (selectedFilter != "All" &&
          selectedFilter != "month" &&
          selectedFilter != item.status) ? (
          <></>
        ) : (
          <TransactionCard item={item} />
        ))
      }
      </ScrollView> */}
      {/* <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          (selectedFilter == "month" && !isSameMonth(item.date)) ||
          (selectedFilter != "All" &&
            selectedFilter != "month" &&
            selectedFilter != item.status) ? (
            <></>
          ) : (
            <TransactionCard item={item} />
          )
        }
        contentContainerStyle={styles.transactionsList}
        showsVerticalScrollIndicator={false}
      /> */}
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  filterIcon: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  filterContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#FFB800",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },
  transactionsList: {
    padding: 16,
    gap: 12,
  },
  transactionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: "#666",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  amountPrefix: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginRight: 2,
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  transactionDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusCompleted: {
    backgroundColor: "#E8F5E9",
  },
  statusPending: {
    backgroundColor: "#FFF3E0",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  statusTextCompleted: {
    color: "#2E7D32",
  },
  statusTextPending: {
    color: "#EF6C00",
  },
});

export default TransactionScreen;
