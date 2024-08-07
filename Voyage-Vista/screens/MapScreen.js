import React, { useState } from 'react';
import { View, Text, Button, TouchableOpacity } from 'react-native';
import CitySelectionModal from '../modal/CitySelectionModal';

const MapScreen = ({ navigation }) => {
  const [city, setCity] = useState('Unknown City');
  const [isModalVisible, setModalVisible] = useState(false);

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
    <View>
      {/* Part 1: Pressable view to show and select city */}
      <TouchableOpacity onPress={handleOpenModal}>
        <View>
          <Text>City: {city}</Text>
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
          <Text>Weather Summary for {city}</Text>
          {/* Add more detailed weather summary information here */}
        </View>
      </TouchableOpacity>

      {/* Part 3: Map view (placeholder for now) */}
      <View style={{ flex: 1, backgroundColor: 'lightgray' }}>
        <Text>Map View</Text>
      </View>
    </View>
  );
};

export default MapScreen;
