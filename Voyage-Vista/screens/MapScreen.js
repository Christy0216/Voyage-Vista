import React, { useState } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet } from 'react-native';
import CitySelectionModal from '../modal/CitySelectionModal';
import { useTheme } from '../context/ThemeContext';

const MapScreen = ({ navigation }) => {
  const [city, setCity] = useState('Vancouver');
  const [isModalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSelectCity = (selectedCity) => {
    setCity(selectedCity);
  };

  const handleWeatherSummaryPress = () => {
    navigation.navigate('WeatherDetailsScreen', { city });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      {/* Part 1: Pressable view to show and select city */}
      <TouchableOpacity onPress={handleOpenModal}>
        <View>
          <Text style={{ color: theme.textColor }}>City: {city}</Text>
        </View>
      </TouchableOpacity>

      {/* City selection modal */}
      <CitySelectionModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSelectCity={handleSelectCity}
      />

      {/* Part 2: Pressable view for weather summary */}
      <TouchableOpacity onPress={handleWeatherSummaryPress}>
        <View>
          <Text style={{ color: theme.textColor }}>Weather Summary for {city}</Text>
          {/* Add more detailed weather summary information here */}
        </View>
      </TouchableOpacity>

      {/* Part 3: Map view (placeholder for now) */}
      <View style={styles.mapView}>
        <Text style={{ color: theme.textColor }}>Map View</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapView: {
    flex: 1,
    backgroundColor: 'lightgray',
  }
});

export default MapScreen;
