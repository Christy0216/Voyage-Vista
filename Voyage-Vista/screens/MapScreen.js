import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import axios from "axios";
import DropDownPicker from "react-native-dropdown-picker";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Map } from "../components/Map";
import { MAP_API_KEY, OPENWEATHER_API_KEY } from "@env";
import NotificationManager from "../components/NotificationManager";

const MapScreen = ({ navigation }) => {
  const [cityName, setCityName] = useState("");
  const [cityPlaceId, setCityPlaceId] = useState("");
  const [location, setLocation] = useState(null);
  const [cities, setCities] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
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
              console.log("User city and place ID found:", {
                userCity,
                placeId,
              });
              setCityName(userCity); // Set city name
              setCityPlaceId(placeId); // Set place ID
              setCities([{ label: userCity, value: placeId }]); // Use placeId as value
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

    fetchUserLocation();
  }, []);

  useEffect(() => {
    if (location && weatherData) {
      // This will re-trigger the notification setup whenever the weatherData changes
      // Consider conditions or specific events when you would want to set this up
      <NotificationManager location={location} />;
    }
  }, [location, weatherData]);


  const fetchCities = async (query) => {
    if (query.length > 2) {
      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&types=(cities)&key=${MAP_API_KEY}`
        );

        if (response.data.predictions.length > 0) {
          const citySuggestions = response.data.predictions.map(
            (prediction) => ({
              label: prediction.description,
              value: prediction.place_id, // Using place_id correctly
            })
          );
          setCities(citySuggestions);
        } else {
          setCities([]);
          console.log("No cities found");
        }
      } catch (error) {
        console.error("Error fetching city suggestions:", error);
      }
    } else {
      setCities([]);
    }
  };

  const fetchCityCoordinates = async (placeId) => {
    if (!placeId || placeId.trim() === "") {
      console.error("Invalid placeId provided:", placeId);
      return;
    }

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${MAP_API_KEY}`
      );

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

        // Update the city name based on the selected place ID
        const newCityName = response.data.result.name;
        setCityName(newCityName);

        // Fetch weather for the new location
        fetchWeather(lat, lng);
      } else {
        console.error("No geometry found in the Places API response.");
      }
    } catch (error) {
      console.error("Error fetching city coordinates:", error);
    }
  };

  const fetchWeather = async (latitude, longitude) => {
    setIsLoadingWeather(true);
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${OPENWEATHER_API_KEY}`
      );
      if (response.data) {
        setWeatherData(response.data);
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const handleSelectCity = (placeId) => {
    if (!placeId) {
      console.error("Invalid placeId selected:", placeId);
      return;
    }

    fetchCityCoordinates(placeId);
    setCityPlaceId(placeId);
  };

  const handleWeatherSummaryPress = () => {
    navigation.navigate("WeatherScreen", {
      lat: location.latitude,
      lon: location.longitude,
      cityName: cityName,
    });
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

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case "Clear":
        return "sunny";
      case "Clouds":
        return "cloudy";
      case "Rain":
        return "rainy";
      case "Snow":
        return "snow";
      case "Thunderstorm":
        return "thunderstorm";
      default:
        return "partly-sunny";
    }
  };

  const getWeatherIconColor = (condition) => {
    switch (condition) {
      case "Clear":
        return "#FFD700"; // Gold for sunny
      case "Clouds":
        return "#B0C4DE"; // Light Steel Blue for cloudy
      case "Rain":
        return "#00BFFF"; // Deep Sky Blue for rainy
      case "Snow":
        return "#FFFFFF"; // White for snow
      case "Thunderstorm":
        return "#FF4500"; // Orange Red for thunderstorm
      default:
        return theme.iconColor; // Default to theme's icon color
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
        <View style={[styles.weatherSummaryContainer, {backgroundColor: theme.inputBackgroundColor}]}>
          <Text style={[styles.weatherSummaryText, { color: theme.textColor }]}>
            Weather Summary for {cityName}
          </Text>
          {isLoadingWeather ? (
            <ActivityIndicator size="small" color={theme.textColor} />
          ) : (
            weatherData && (
              <View style={styles.weatherPreviewContainer}>
                <Ionicons
                  name={getWeatherIcon(weatherData.weather[0].main)}
                  size={50}
                  color={getWeatherIconColor(weatherData.weather[0].main)}
                />
                <Text
                  style={[
                    styles.weatherPreviewText,
                    { color: theme.textColor },
                  ]}
                >
                  {Math.round(weatherData.main.temp)}°C
                </Text>
              </View>
            )
          )}
        </View>
      </TouchableOpacity>

      {/* Map view */}
      <View style={styles.mapContainer}>
        <Map location={location} />
      </View>

      {/* Conditional rendering of NotificationManager */}
      {weatherData && location && (
        <NotificationManager location={location} />
      )}
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
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: "#ADD8E6",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  weatherSummaryText: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  weatherPreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  weatherPreviewText: {
    fontSize: 20,
    marginLeft: 15,
    fontWeight: "bold",
  },
  mapContainer: {
    height: 400,  // Increased height of the map
    backgroundColor: "lightgray",
    borderRadius: 10,
    overflow: "hidden",
  },
  postDetailsContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  postDetailsText: {
    fontSize: 16,
    marginBottom: 10,
  },
  linkText: {
    fontSize: 16,
    color: "#1E90FF",
    fontWeight: "bold",
  },
});

export default MapScreen;
