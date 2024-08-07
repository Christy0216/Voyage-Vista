import React from 'react';
import { View, Text, FlatList } from 'react-native';
import ThreeHourSummary from '../components/ThreeHourSummary';
import DailySummary from '../components/DailySummary';

const WeatherScreen = () => {
  const threeHourSummaries = [
    '3-Hour Summary 1',
    '3-Hour Summary 2',
    '3-Hour Summary 3',
  ];

  const dailySummaries = [
    'Day 1 Summary',
    'Day 2 Summary',
    'Day 3 Summary',
  ];

  return (
    <View>
      {/* Top Part: Current Weather Details */}
      <View>
        <Text>Current Weather Details</Text>
      </View>

      {/* Middle Part: Horizontally Scrollable Weather Summaries */}
      <FlatList
        horizontal
        data={threeHourSummaries}
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
