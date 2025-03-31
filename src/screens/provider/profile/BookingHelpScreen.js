import React, { useState } from 'react';
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
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const BookingHelpScreen = ({ navigation }) => {
  const [bookingId, setBookingId] = useState('');
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');

  const issueTypes = [
    'Booking Cancellation',
    'Schedule Conflict',
    'Payment Issue',
    'Customer No-show',
    'Technical Problem',
    'Other',
  ];

  const handleSubmit = () => {
    if (!bookingId.trim() || !issueType || !description.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Here you would typically send the report to your backend
    Alert.alert(
      'Success',
      'Your report has been submitted. Our support team will review it shortly.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
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
        <Text style={styles.headerTitle}>Report Booking Issue</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Booking ID Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Booking ID</Text>
          <TextInput
            style={styles.input}
            value={bookingId}
            onChangeText={setBookingId}
            placeholder="Enter booking ID"
            placeholderTextColor="#999"
          />
        </View>

        {/* Issue Type Selection */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Issue Type</Text>
          <View style={styles.issueTypesContainer}>
            {issueTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.issueTypeButton,
                  issueType === type && styles.issueTypeButtonSelected,
                ]}
                onPress={() => setIssueType(type)}
              >
                <Text
                  style={[
                    styles.issueTypeText,
                    issueType === type && styles.issueTypeTextSelected,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your issue in detail"
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Submit Report</Text>
        </TouchableOpacity>

        {/* Help Text */}
        <Text style={styles.helpText}>
          Our support team will review your report and respond within 24 hours.
          For urgent matters, please contact us directly through chat support.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        paddingTop: 44,
      },
      android: {
        paddingTop: StatusBar.currentHeight,
      },
    }),
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  issueTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  issueTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 4,
    marginVertical: 4,
  },
  issueTypeButtonSelected: {
    backgroundColor: '#FFB800',
  },
  issueTypeText: {
    fontSize: 14,
    color: '#666',
  },
  issueTypeTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    height: 120,
  },
  submitButton: {
    backgroundColor: '#FFB800',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    marginTop: 24,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
});

export default BookingHelpScreen;
