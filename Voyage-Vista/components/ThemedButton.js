import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

const ThemedButton = ({ title, onPress }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, { backgroundColor: theme.buttonColor }]}
    >
      <Text style={[styles.text, { color: theme.textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
    width: "30%",
  },
  text: {
    fontWeight: "bold",
  },
});

export default ThemedButton;
