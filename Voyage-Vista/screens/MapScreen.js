import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Location from "expo-location";
import axios from "axios";
import DropDownPicker from "react-native-dropdown-picker";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { Map } from "../components/Map";
import { MAP_API_KEY } from "@env";

const MapScreen = ({ navigation }) => {
  const [cityName, setCityName] = useState("");
  const [cityPlaceId, setCityPlaceId] = useState("");
  const [location, setLocation] = useState(null);
  const [cities, setCities] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    fetchUserLocation();
  }, []);

  const fetchUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      setLocation({ latitude, longitude });

      console.log("User location fetched:", { latitude, longitude });

      // Reverse geocoding to get the city name
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${MAP_API_KEY}`
      );

      if (response.data.results.length > 0) {
        const addressComponents = response.data.results[0].address_components;
        const cityComponent = addressComponents.find((component) =>
          component.types.includes("locality")
        );

        if (cityComponent) {
          const userCity = cityComponent.long_name;
          const placeId = await getPlaceIdFromCityName(userCity);
          if (placeId) {
            console.log("User city and place ID found:", { userCity, placeId });
            setCityName(userCity); // Set city name
            setCityPlaceId(placeId); // Set place ID

            // Ensure "Use My Location" is added only once
            setCities((prevCities) => {
              const useMyLocationOption = { label: "Use My Location", value: "use_my_location" };
              const filteredCities = prevCities.filter(
                (city) => city.value !== placeId && city.value !== "use_my_location"
              );
              return [
                useMyLocationOption,
                ...filteredCities,
                { label: userCity, value: placeId },
              ];
            });

            fetchCityCoordinates(placeId); // Fetch initial coordinates for user's city
          }
        } else {
          console.log("City not found in reverse geocoding response");
        }
      }
    } catch (error) {
      console.error("Error fetching user location:", error);
    }
  };

  const fetchCities = async (query) => {
    if (query.length > 2) {
      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&types=(cities)&key=${MAP_API_KEY}`
        );
        console.log("API Response:", response.data);

        if (response.data.predictions.length > 0) {
          const citySuggestions = response.data.predictions.map(
            (prediction) => ({
              label: prediction.description,
              value: prediction.place_id, // Using place_id correctly as the unique key
            })
          );
          console.log("Cities:", citySuggestions);

          // Ensure "Use My Location" is added only once
          setCities((prevCities) => {
            const useMyLocationOption = { label: "Use My Location", value: "use_my_location" };
            const existingCities = new Set(prevCities.map(city => city.value));
            const uniqueCitySuggestions = citySuggestions.filter(
              (city) => !existingCities.has(city.value)
            );
            return [
              useMyLocationOption,
              ...uniqueCitySuggestions,
            ];
          });
        } else {
          setCities([{ label: "Use My Location", value: "use_my_location" }]);
          console.log("No cities found");
        }
      } catch (error) {
        console.error("Error fetching city suggestions:", error);
      }
    } else {
      setCities([{ label: "Use My Location", value: "use_my_location" }]);
    }
  };

  const fetchCityCoordinates = async (placeId) => {
    if (placeId === "use_my_location") {
      fetchUserLocation();
      return;
    }

    if (!placeId || placeId.trim() === "") {
      console.error("Invalid placeId provided:", placeId);
      return;
    }

    console.log("Fetching details for placeId:", placeId);

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${MAP_API_KEY}`
      );
      console.log("Place Details Response:", response.data);

      if (response.data.status !== "OK") {
        console.error(
          "Error in Places API response:",
          response.data.status,
          response.data.error_message
        );
        return;
      }

      if (response.data.result && response.data.result.geometry) {
        const { lat, lng } = response.data.result.geometry.location;
        setLocation({ latitude: lat, longitude: lng }); // Update map location
        console.log("New location set:", { latitude: lat, longitude: lng });

        // Update the city name based on the selected place ID
        const newCityName = response.data.result.name;
        setCityName(newCityName);
        console.log("City name updated to:", newCityName);
      } else {
        console.error("No geometry found in the Places API response.");
      }
    } catch (error) {
      console.error("Error fetching city coordinates:", error);
    }
  };

  const handleSelectCity = (placeId) => {
    if (!placeId) {
      console.log("Invalid placeId selected:", placeId);
      return;
    }

    console.log(`City selected with placeId: ${placeId}`);
    fetchCityCoordinates(placeId);
    setCityPlaceId(placeId);
  };

  const handleWeatherSummaryPress = () => {
    console.log(`Navigating to WeatherDetailsScreen for city: ${cityName}`);
    navigation.navigate("WeatherDetailsScreen", {
      lat: location.latitude,
      lon: location.longitude,
      cityName: cityName,
    });
    console.log(
      "lat and lon passed in weather: ",
      location.latitude,
      location.longitude
    );
  };

  const getPlaceIdFromCityName = async (cityName) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${cityName}&types=(cities)&key=${MAP_API_KEY}`
      );

      if (response.data.predictions.length > 0) {
        const placeId = response.data.predictions[0].place_id;
        return placeId;
      } else {
        console.log("No place ID found for the city:", cityName);
        return null;
      }
    } catch (error) {
      console.error("Error fetching place ID:", error);
      return null;
    }
  };

  const getCityNameFromPlaceId = async (placeId) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${MAP_API_KEY}`
      );

      if (response.data.status === "OK") {
        const cityName = response.data.result.name;
        return cityName;
      } else {
        console.error(
          "Error in Places API response:",
          response.data.status,
          response.data.error_message
        );
        return null;
      }
    } catch (error) {
      console.error("Error fetching city name:", error);
      return null;
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      {/* City selection dropdown with dynamic search */}
      <DropDownPicker
        open={isModalVisible}
        value={cityPlaceId}
        items={cities}
        setOpen={setModalVisible}
        setValue={setCityPlaceId}
        setItems={setCities}
        searchable={true}
        searchPlaceholder="Search for a city"
        placeholder="Select a city"
        onChangeValue={handleSelectCity}
        onChangeSearchText={fetchCities} // Fetch cities dynamically as the user types
        style={styles.dropdown}
        dropDownContainerStyle={{ backgroundColor: theme.backgroundColor }}
        textStyle={{ color: theme.textColor }}
        searchTextInputStyle={{
          color: theme.textColor,
        }}
      />

      {/* Weather summary */}
      <TouchableOpacity onPress={handleWeatherSummaryPress}>
        <View style={styles.weatherSummaryContainer}>
          <Text style={{ color: theme.textColor }}>
            Weather Summary for {cityName}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Map view */}
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
    borderColor: "#ccc",
  },
  weatherSummaryContainer: {
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#eee",
    borderRadius: 5,
  },
  mapContainer: {
    height: 200,
    backgroundColor: "lightgray",
    borderRadius: 10,
    overflow: "hidden",
  },
});

export default MapScreen;
