import React from 'react';
import { View, Text } from 'react-native';

const DailySummary = ({ summary }) => {
  return (
    <View>
      <Text>{summary.dt_txt.split(' ')[0]}</Text>
      <Text>Temperature: {summary.main.temp}°C</Text>
      <Text>Condition: {summary.weather[0].description}</Text>
    </View>
  );
};

export default DailySummary;
