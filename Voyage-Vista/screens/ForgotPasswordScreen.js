import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebaseSetUp";
import { useTheme } from '../context/ThemeContext';
import ThemedButton from "../components/ThemedButton";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const { theme } = useTheme();

  const resetPasswordHandler = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email to reset the password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Success", "Password reset email sent!");
      navigation.goBack(); // Go back to the login screen
    } catch (error) {
      Alert.alert("Reset Password Error", error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.label, { color: theme.textColor }]}>Enter your email address</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.textColor }]}
        placeholder="Email"
        placeholderTextColor={theme.placeholderTextColor}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <ThemedButton title="Reset Password" onPress={resetPasswordHandler} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  label: {
    width: '100%',
    marginBottom: 5,
  },
});
