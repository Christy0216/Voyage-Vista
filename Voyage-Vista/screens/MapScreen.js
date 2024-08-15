import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CitySelectionModal from '../modal/CitySelectionModal';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { Map } from '../components/Map';
import { fetchPostsInRegion } from '../firebase/firebasePostHelper';

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
        <View style={styles.cityContainer}>
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
        <View style={styles.weatherSummaryContainer}>
          <Text style={{ color: theme.textColor }}>Weather Summary for {city}</Text>
          {/* Add more detailed weather summary information here */}
        </View>
      </TouchableOpacity>

      {/* Part 3: Map view */}
      <View style={styles.mapContainer}>
        <Map />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  cityContainer: {
    marginBottom: 20,
  },
  weatherSummaryContainer: {
    marginBottom: 20,
  },
  mapContainer: {
    height: 200,  // Adjust this value to make the map smaller or larger
    backgroundColor: 'lightgray',
    borderRadius: 10,
    overflow: 'hidden',
  },
});

export default MapScreen;
