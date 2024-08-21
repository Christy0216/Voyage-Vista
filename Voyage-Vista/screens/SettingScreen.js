// src/screens/SettingsScreen.js
import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useTheme } from "../context/ThemeContext";
import { useNotification } from "../context/NotificationContext"; // Import useNotification
import ThemedButton from "../components/ThemedButton";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseSetUp";
import { themes } from '../styles/themes';

const SettingsScreen = ({ navigation }) => {
  const { theme, toggleTheme } = useTheme();
  const { notificationsEnabled, toggleNotifications } = useNotification(); // Use the context

  async function handleSignOut() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.content}>
        <Text style={[styles.text, { color: theme.textColor }]}>Toggle Theme</Text>
        <Switch onValueChange={toggleTheme} value={theme === themes.dark} />
        <Text style={[styles.text, { color: theme.textColor, marginTop: 20 }]}>
          Enable Notifications
        </Text>
        <Switch
          onValueChange={toggleNotifications}
          value={notificationsEnabled}
        />
      </View>
      <ThemedButton title="Sign Out" onPress={handleSignOut} style={styles.signOutButton} />
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
    justifyContent: "center",
    alignItems: "center",
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
