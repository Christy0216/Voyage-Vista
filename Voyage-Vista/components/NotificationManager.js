import React, { useState, useEffect } from "react";
import { View, Alert, ActivityIndicator } from "react-native";
import * as Notifications from "expo-notifications";
import axios from "axios";
import { OPENWEATHER_API_KEY } from "@env";
import ThemedButton from "./ThemedButton";
import { useNotification } from "../context/NotificationContext"; // Import the context

const NotificationManager = ({ location }) => {
  const { notificationsEnabled } = useNotification(); // Use the context
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received!", notification);
      }
    );

    return () => subscription.remove();
  }, []);

  async function verifyPermissions() {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const { granted } = await Notifications.requestPermissionsAsync();
      return granted;
    }
    return true;
  }

  async function fetchWeather(latitude, longitude) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch weather data:", error);
      throw new Error("Failed to fetch weather data.");
    }
  }

  async function scheduleNotification() {
    if (!notificationsEnabled) {
      Alert.alert(
        "Notifications Disabled",
        "Enable notifications to schedule weather updates."
      );
      return;
    }
    setLoading(true);

    const hasPermission = await verifyPermissions();
    if (!hasPermission) {
      Alert.alert(
        "Permission required",
        "Enable notifications to receive weather updates."
      );
      setLoading(false);
      return;
    }

    try {
      const weather = await fetchWeather(location.latitude, location.longitude);
      const body = `The current temperature in ${weather.name} is ${Math.round(
        weather.main.temp
      )}°C with ${weather.weather[0].description}.`;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Daily Weather Update 🌤️",
          body: body,
          data: { weather },
        },
        trigger: {
          seconds: 5, // For testing purposes, set to 5 seconds
        //   hour: 24,
        //   repeats: true,
        },
      });
      Alert.alert("Success", "Notification has been scheduled.");
      console.log("Notification scheduled with ID:", notificationId);
    } catch (error) {
      console.error("Error setting notification:", error);
      Alert.alert(
        "Error",
        "Failed to set notification. See console for details."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View>
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <ThemedButton
          title="Set Daily Weather Notification"
          onPress={scheduleNotification}
        />
      )}
    </View>
  );
};

export default NotificationManager;
