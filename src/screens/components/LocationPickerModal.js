import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker, Circle } from 'react-native-maps';

const { width } = Dimensions.get('window');

const LocationPickerModal = ({ visible, onClose, onSelectLocation }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Initial region (Pinamalayan center)
  const initialRegion = {
    latitude: 13.0019,
    longitude: 121.5177,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  // Get current location when modal opens
  useEffect(() => {
    if (visible) {
      getCurrentLocation();
    }
  }, [visible]);

  const isLocationWithinBounds = (lat, lng, center) => {
    const radius = 1; // 1 kilometer radius
    const centerLat = center ? center.latitude : initialRegion.latitude;
    const centerLng = center ? center.longitude : initialRegion.longitude;
    
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat - centerLat);
    const dLng = toRad(lng - centerLng);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(centerLat)) * Math.cos(toRad(lat)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return distance <= radius;
  };

  const toRad = (value) => {
    return value * Math.PI / 180;
  };

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow location access to use this feature.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const newCenter = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCurrentLocation(newCenter);

      const address = await Location.reverseGeocodeAsync(newCenter);

      if (address[0]) {
        const formattedAddress = `${address[0].street || ''} ${address[0].name || ''}, ${address[0].city || ''}, ${address[0].region || ''}`.trim();
        setSelectedLocation({
          ...newCenter,
          address: formattedAddress,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
      console.error('Location error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const searchWithCity = `${searchQuery}, Pinamalayan, Oriental Mindoro, Philippines`;
      const searchResults = await Location.geocodeAsync(searchWithCity);
      
      if (searchResults.length > 0) {
        const { latitude, longitude } = searchResults[0];
        
        if (!isLocationWithinBounds(latitude, longitude, currentLocation)) {
          Alert.alert(
            'Location Error', 
            'The selected location is outside the 1km service radius. Please select a closer location.'
          );
          return;
        }

        const address = await Location.reverseGeocodeAsync({ latitude, longitude });

        if (address[0]) {
          const formattedAddress = `${address[0].street || ''} ${address[0].name || ''}, ${address[0].city || ''}, ${address[0].region || ''}`.trim();
          setSelectedLocation({
            latitude,
            longitude,
            address: formattedAddress,
          });
        }
      } else {
        Alert.alert('Not Found', 'No location found in the area');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search location');
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = async (event) => {
    const { coordinate } = event.nativeEvent;
    
    if (!isLocationWithinBounds(coordinate.latitude, coordinate.longitude, currentLocation)) {
      Alert.alert(
        'Location Error', 
        'The selected location is outside the 1km service radius. Please select a closer location.'
      );
      return;
    }

    setLoading(true);
    try {
      const address = await Location.reverseGeocodeAsync(coordinate);

      if (address[0]) {
        const formattedAddress = `${address[0].street || ''} ${address[0].name || ''}, ${address[0].city || ''}, ${address[0].region || ''}`.trim();
        setSelectedLocation({
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          address: formattedAddress,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get address for selected location');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedLocation?.address) {
      Alert.alert('Error', 'Please select a location');
      return;
    }
    onSelectLocation(selectedLocation.address);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Select Location</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Feather name="search" size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search nearby location (1km radius)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                >
                  <Feather name="x-circle" size={18} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <MapView
            style={styles.map}
            region={currentLocation ? {
              ...currentLocation,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            } : initialRegion}
            onPress={handleMapPress}
          >
            {selectedLocation && (
              <Marker
                coordinate={{
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                }}
              />
            )}
            {currentLocation && (
              <Circle
                center={currentLocation}
                radius={1000} // 1km in meters
                strokeWidth={1}
                strokeColor="#FFB800"
                fillColor="rgba(255, 184, 0, 0.1)"
              />
            )}
          </MapView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={getCurrentLocation}
              disabled={loading}
            >
              <Feather name="crosshair" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>
                {loading ? 'Getting location...' : 'Use current location'}
              </Text>
            </TouchableOpacity>

            {selectedLocation && (
              <View style={styles.selectedLocationContainer}>
                <Feather name="map-pin" size={20} color="#666" />
                <Text style={styles.selectedLocationText} numberOfLines={2}>
                  {selectedLocation.address}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.confirmButton,
                !selectedLocation && styles.disabledButton
              ]}
              onPress={handleConfirm}
              disabled={!selectedLocation}
            >
              <Text style={styles.confirmButtonText}>Confirm Location</Text>
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#FFB800" />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333333',
  },
  clearButton: {
    padding: 4,
  },
  map: {
    flex: 1,
    width: '100%',
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  selectedLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  selectedLocationText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB800',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  confirmButton: {
    backgroundColor: '#333333',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LocationPickerModal;
