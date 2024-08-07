import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseSetUp";
import { useTheme } from '../context/ThemeContext';
import { createUser } from '../firebase/firebaseUserHelper';

export default function Signup({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [birthday, setBirthday] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { theme } = useTheme();

  const loginHandler = () => {
    navigation.replace("Login");
  };

  const signupHandler = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim() || !userName.trim()) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Password too short");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Create user data
      const userData = {
        userId: userId,
        username: userName,
        email: email,
        profilePicture: '', // Add logic for profile picture if necessary
        posts: [],
        favorites: [],
        likes: [],
        comments: [],
        birthday: birthday.toISOString() // Add birthday to userData
      };

      // Create user in Firestore
      await createUser(userData);
      console.log("User created:", userCredential.user);
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        Alert.alert("Email already in use", "Please use a different email address.");
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("Invalid Email", "Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        Alert.alert("Weak Password", "Password should be at least 6 characters long.");
      } else {
        Alert.alert("Signup Error", error.message);
      }
    }
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || birthday;
    setShowDatePicker(Platform.OS === 'ios');
    setBirthday(currentDate);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.label, { color: theme.textColor }]}>Username</Text>
      <TextInput
        placeholder="Enter your username"
        value={userName}
        onChangeText={setUserName}
        autoCapitalize="none"
        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.textColor }]}
        placeholderTextColor={theme.placeholderTextColor}
      />
      <Text style={[styles.label, { color: theme.textColor }]}>Birthday</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.input, { backgroundColor: theme.inputBackground, justifyContent: 'center' }]}>
        <Text style={{ color: theme.textColor }}>{birthday.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={birthday}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}
      <Text style={[styles.label, { color: theme.textColor }]}>Email</Text>
      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.textColor }]}
        placeholderTextColor={theme.placeholderTextColor}
      />
      <Text style={[styles.label, { color: theme.textColor }]}>Password</Text>
      <TextInput
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
        autoCompleteType="off"
        textContentType="newPassword"
        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.textColor }]}
        placeholderTextColor={theme.placeholderTextColor}
      />
      <Text style={[styles.label, { color: theme.textColor }]}>Confirm Password</Text>
      <TextInput
        placeholder="Confirm Password"
        secureTextEntry={true}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        autoCompleteType="off"
        textContentType="newPassword"
        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.textColor }]}
        placeholderTextColor={theme.placeholderTextColor}
      />
      <View style={styles.buttonContainer}>
        <Button title="Register" onPress={signupHandler} color="darkmagenta" />
      </View>
      <View style={styles.space} />
      <View style={styles.buttonContainer}>
        <Button title="Already Registered? Login" onPress={loginHandler} color="darkmagenta" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  buttonContainer: {
    marginVertical: 8,
  },
  space: {
    height: 20,
  },
});
