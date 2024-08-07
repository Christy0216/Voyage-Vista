import React from 'react';
import { View, Text, Switch } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { themes } from '../styles/themes';


const SettingsScreen = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.backgroundColor }}>
      <Text style={{ color: theme.textColor }}>Toggle Theme</Text>
      <Switch
        onValueChange={toggleTheme}
        value={theme === themes.dark}
      />
    </View>
  );
};

export default SettingsScreen;
