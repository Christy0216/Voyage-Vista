import React from 'react';
import { View, Text, Switch, Button, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { themes } from '../styles/themes';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseSetUp';

const SettingsScreen = ({ navigation }) => {
  const { theme, toggleTheme } = useTheme();

  async function handleSignOut() {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.content}>
        <Text style={[styles.text, { color: theme.textColor }]}>Toggle Theme</Text>
        <Switch
          onValueChange={toggleTheme}
          value={theme === themes.dark}
        />
      </View>
      <View style={styles.signOutButton}>
        <Button title="Sign Out" onPress={handleSignOut} color="darkmagenta" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 16,
  },
  signOutButton: {
    paddingVertical: 16,
  },
});

export default SettingsScreen;
