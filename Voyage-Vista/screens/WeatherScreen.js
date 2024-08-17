import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { OPENWEATHER_API_KEY } from '@env';

const WeatherScreen = ({ route }) => {
  const { lat, lon, cityName } = route.params;
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    console.log("Received lat, lon, and cityName in WeatherScreen:", lat, lon, cityName);

    const fetchWeather = async () => {
      try {
        if (lat === undefined || lat === null || lon === undefined || lon === null) {
          throw new Error("Latitude or Longitude is undefined or null");
        }

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
        );

        if (!response.ok) {
          const errorDetails = await response.json();
          console.log("Error details:", errorDetails);
          throw new Error(`Network response was not ok: ${response.status}`);
        }

        const data = await response.json();
        setWeatherData(data);
      } catch (error) {
        console.error("Error fetching weather data:", error.message);
        setError(error.message);
      }
    };

    fetchWeather();
  }, [lat, lon]);

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'Clear':
        return 'sunny';
      case 'Clouds':
        return 'cloudy';
      case 'Rain':
        return 'rainy';
      case 'Snow':
        return 'snow';
      case 'Thunderstorm':
        return 'thunderstorm';
      default:
        return 'partly-sunny';
    }
  };

  const renderThreeHourSummary = ({ item }) => (
    <View style={styles.threeHourSummaryContainer}>
      <Text style={[styles.timeText, { color: theme.textColor }]}>
        {new Date(item.dt_txt).getHours()}:00
      </Text>
      <Ionicons
        name={getWeatherIcon(item.weather[0].main)}
        size={30}
        color={getWeatherIconColor(item.weather[0].main)}
      />
      <Text style={[styles.tempText, { color: theme.textColor }]}>
        {Math.round(item.main.temp)}°C
      </Text>
    </View>
  );

  const renderDailySummary = ({ item }) => (
    <View style={styles.dailySummaryContainer}>
      <Text style={[styles.dayText, { color: theme.textColor }]}>
        {new Date(item.dt_txt).toLocaleDateString('en-US', { weekday: 'long' })}
      </Text>
      <Ionicons
        name={getWeatherIcon(item.weather[0].main)}
        size={30}
        color={getWeatherIconColor(item.weather[0].main)}
      />
      <Text style={[styles.tempText, { color: theme.textColor }]}>
        {Math.round(item.main.temp_min)}°C / {Math.round(item.main.temp_max)}°C
      </Text>
    </View>
  );

  const getWeatherIconColor = (condition) => {
    switch (condition) {
      case 'Clear':
        return '#FFD700'; // Gold for sunny
      case 'Clouds':
        return '#B0C4DE'; // Light Steel Blue for cloudy
      case 'Rain':
        return '#00BFFF'; // Deep Sky Blue for rainy
      case 'Snow':
        return '#FFFFFF'; // White for snow
      case 'Thunderstorm':
        return '#FF4500'; // Orange Red for thunderstorm
      default:
        return theme.iconColor; // Default to theme's icon color
    }
  };

  const dailySummaries = weatherData
    ? weatherData.list.filter((item, index) => index % 8 === 0)
    : [];

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.cityText, { color: theme.textColor }]}>
          {cityName}
        </Text>
        <Text style={[styles.headerText, { color: theme.textColor }]}>
          Current Weather
        </Text>
        {error && (
          <Text style={[styles.errorText, { color: theme.errorColor }]}>
            Error: {error}
          </Text>
        )}
        {weatherData ? (
          <View style={styles.currentWeatherContainer}>
            <Ionicons
              name={getWeatherIcon(weatherData.list[0].weather[0].main)}
              size={80}
              color={getWeatherIconColor(weatherData.list[0].weather[0].main)}
            />
            <View style={styles.currentWeatherTextContainer}>
              <Text style={[styles.temperatureText, { color: theme.textColor }]}>
                {Math.round(weatherData.list[0].main.temp)}°C
              </Text>
              <Text style={[styles.conditionText, { color: theme.textColor }]}>
                {weatherData.list[0].weather[0].description}
              </Text>
            </View>
          </View>
        ) : (
          <ActivityIndicator size="large" color={theme.textColor} />
        )}
      </View>

      <FlatList
        horizontal
        data={weatherData ? weatherData.list.slice(0, 8) : []}
        renderItem={renderThreeHourSummary}
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContainer}
      />

      <FlatList
        data={dailySummaries}
        renderItem={renderDailySummary}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.flatListContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  cityText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  currentWeatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  currentWeatherTextContainer: {
    marginLeft: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  temperatureText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  conditionText: {
    fontSize: 18,
    textTransform: 'capitalize',
  },
  errorText: {
    fontSize: 16,
    marginTop: 10,
  },
  flatListContainer: {
    paddingBottom: 20,
  },
  threeHourSummaryContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  timeText: {
    fontSize: 16,
    marginBottom: 4,
  },
  tempText: {
    fontSize: 16,
  },
  dailySummaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
  },
  dayText: {
    fontSize: 18,
    flex: 1,
  },
});

export default WeatherScreen;
