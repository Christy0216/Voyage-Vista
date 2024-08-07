import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import ThreeHourSummary from '../components/ThreeHourSummary';
import DailySummary from '../components/DailySummary';
import { getCurrentWeather } from '../openWeather/weatherManager';

const WeatherScreen = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);

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
    <View>
      {/* Top Part: Current Weather Details */}
      <View>
        <Text>Current Weather Details</Text>
        {error && <Text style={{ color: 'red' }}>Error: {error}</Text>}
        {weatherData && (
          <>
            <Text>Temperature: {weatherData.list[0].main.temp}°C</Text>
            <Text>Condition: {weatherData.list[0].weather[0].description}</Text>
          </>
        )}
      </View>

      {/* Middle Part: Horizontally Scrollable Weather Summaries */}
      <FlatList
        horizontal
        data={weatherData ? weatherData.list.slice(0, 8) : []}
        renderItem={({ item }) => <ThreeHourSummary summary={item} />}
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
      />

      {/* Bottom Part: Non-scrollable Weather Summaries for Following Days */}
      <FlatList
        data={dailySummaries}
        renderItem={({ item }) => <DailySummary summary={item} />}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

export default WeatherScreen;
