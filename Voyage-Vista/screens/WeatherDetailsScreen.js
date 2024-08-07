import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import ThreeHourSummary from '../components/ThreeHourSummary';
import DailySummary from '../components/DailySummary';
import { getCurrentWeather } from '../openWeather/weatherManager';
import { useTheme } from '../context/ThemeContext';

const WeatherScreen = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const data = await getCurrentWeather(40.7128, -74.0060);
        setWeatherData(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchWeather();
  }, []);

  const dailySummaries = weatherData
    ? weatherData.list.filter((item, index) => index % 8 === 0)
    : [];

  return (
    <View style={{ backgroundColor: theme.backgroundColor, flex: 1 }}>
      <View>
        <Text style={{ color: theme.textColor }}>Current Weather Details</Text>
        {error && <Text style={{ color: 'red' }}>Error: {error}</Text>}
        {weatherData && (
          <>
            <Text style={{ color: theme.textColor }}>Temperature: {weatherData.list[0].main.temp}°C</Text>
            <Text style={{ color: theme.textColor }}>Condition: {weatherData.list[0].weather[0].description}</Text>
          </>
        )}
      </View>

      <FlatList
        horizontal
        data={weatherData ? weatherData.list.slice(0, 8) : []}
        renderItem={({ item }) => <ThreeHourSummary summary={item} theme={theme} />}
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
      />

      <FlatList
        data={dailySummaries}
        renderItem={({ item }) => <DailySummary summary={item} theme={theme} />}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

export default WeatherScreen;
