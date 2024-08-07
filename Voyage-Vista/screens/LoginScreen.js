import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseSetUp";
import { useTheme } from '../context/ThemeContext';

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { theme } = useTheme();

  const signupHandler = () => {
    navigation.replace("Signup");
  };

  const loginHandler = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in:", userCredential.user);
      // navigation.replace("Home");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        Alert.alert("Login Error", "No user found with this email.");
      } else if (error.code === "auth/wrong-password") {
        Alert.alert("Login Error", "Incorrect password.");
      } else {
        Alert.alert("Login Error", error.message);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.label, { color: theme.textColor }]}>Email</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.textColor }]}
        placeholder="Enter your email"
        placeholderTextColor={theme.placeholderTextColor}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Text style={[styles.label, { color: theme.textColor }]}>Password</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.textColor }]}
        placeholder="Enter your password"
        placeholderTextColor={theme.placeholderTextColor}
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={loginHandler} color={theme.buttonColor} />
      <View style={styles.space} />

      <Button title="Signup" onPress={signupHandler} color={theme.buttonColor} />

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
  space: {
    height: 10,
  }
});
