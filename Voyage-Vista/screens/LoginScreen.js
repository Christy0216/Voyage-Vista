import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseSetUp";
import { useTheme } from "../context/ThemeContext";
import ThemedButton from "../components/ThemedButton";

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
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User logged in:", userCredential.user);
      // navigation.replace("Home"); // Redirect to home or other relevant screen after login
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        Alert.alert("Login Error", "No user found with this email.");
      } else if (error.code === "auth/wrong-password") {
        Alert.alert("Login Error", "Incorrect password.");
      } else if (error.code === "auth/weak-password") {
        Alert.alert(
          "Login Error",
          "Password is too weak. Please use a stronger password."
        );
      } else {
        Alert.alert("Login Error", error.message);
      }
    }
  };

  const forgotPasswordHandler = () => {
    navigation.navigate("ForgotPassword"); // Navigate to a screen to handle password reset
  };

  return (
    <ImageBackground
      source={require("../reusables/login-background.png")} // Add a background image
      style={styles.backgroundImage}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: theme.backgroundColor + "AA" },
        ]}
      >
        <Text style={[styles.header, { color: theme.textColor }]}>
          Welcome Back to Voyage Vista!
        </Text>
        <Text style={[styles.subHeader, { color: theme.textColor }]}>
          Log in to continue exploring the world with fellow travelers.
        </Text>

        <Text style={[styles.label, { color: theme.textColor }]}>Email</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBackground,
              color: theme.textColor,
              borderColor: theme.textColor,
            },
          ]}
          placeholder="Enter your email"
          placeholderTextColor={theme.placeholderTextColor}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={[styles.label, { color: theme.textColor }]}>Password</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBackground,
              color: theme.textColor,
              borderColor: theme.textColor,
            },
          ]}
          placeholder="Enter your password"
          placeholderTextColor={theme.placeholderTextColor}
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />

        <ThemedButton title="Login" onPress={loginHandler} />

        <ThemedButton
          title="Forgot Password?"
          onPress={forgotPasswordHandler}
        />

        <ThemedButton title="Sign Up" onPress={signupHandler} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  label: {
    width: "100%",
    marginBottom: 5,
    fontWeight: "bold",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  link: {
    marginVertical: 10,
    fontSize: 14,
    textAlign: "center",
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
});
