import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios'; // Import axios for reverse geocoding
import DropDownPicker from 'react-native-dropdown-picker'; // Import dropdown picker
import CitySelectionModal from '../modal/CitySelectionModal';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { Map } from '../components/Map';
import { fetchPostsInRegion } from '../firebase/firebasePostHelper';
import { mapsApiKey } from "@env"; // Assuming you have an API key set up

const MapScreen = ({ navigation }) => {
  const [city, setCity] = useState('');
  const [location, setLocation] = useState(null);
  const [cities, setCities] = useState([]); // To store city options
  const [isModalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
          return;
        }

        let loc = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = loc.coords;
        setLocation({ latitude, longitude });

        // Reverse geocoding to get the city name
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${mapsApiKey}`
        );

        if (response.data.results.length > 0) {
          const addressComponents = response.data.results[0].address_components;
          const cityComponent = addressComponents.find(component =>
            component.types.includes("locality")
          );

          if (cityComponent) {
            const userCity = cityComponent.long_name;
            setCity(userCity);
            setCities([{ label: userCity, value: userCity }]); // Add the current city to the dropdown
          } else {
            console.log('City not found in reverse geocoding response');
          }
        }
      } catch (error) {
        console.error('Error fetching user location:', error);
      }
    };

    fetchUserLocation();
  }, []);

  const handleSelectCity = (selectedCity) => {
    setCity(selectedCity);
  };

  const handleWeatherSummaryPress = () => {
    navigation.navigate('WeatherDetailsScreen', { city });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      {/* Part 1: Dropdown to select city */}
      <DropDownPicker
        open={isModalVisible}
        value={city}
        items={cities}
        setOpen={setModalVisible}
        setValue={setCity}
        setItems={setCities}
        searchable={true}
        placeholder="Select a city"
        onChangeValue={handleSelectCity}
        style={styles.dropdown}
        dropDownContainerStyle={{ backgroundColor: theme.backgroundColor }}
        textStyle={{ color: theme.textColor }}
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
        <Map location={location} /> 
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  dropdown: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  weatherSummaryContainer: {
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#eee',
    borderRadius: 5,
  },
  mapContainer: {
    height: 200,  // Adjust this value to make the map smaller or larger
    backgroundColor: 'lightgray',
    borderRadius: 10,
    overflow: 'hidden',
  },
});

export default MapScreen;
