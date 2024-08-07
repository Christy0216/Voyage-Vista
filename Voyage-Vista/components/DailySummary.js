import React from 'react';
import { View, Text } from 'react-native';

const DailySummary = ({ summary }) => {
  return (
    <View>
      <Text>{summary}</Text>
    </View>
  );
};

export default DailySummary;
