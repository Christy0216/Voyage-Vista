import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseSetUp";
import { useTheme } from "../context/ThemeContext";
import { createUser } from "../firebase/firebaseUserHelper";
import ThemedButton from "../components/ThemedButton";

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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    if (
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !userName.trim()
    ) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
  
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userId = userCredential.user.uid;
  
      const userData = {
        userId: userId,
        username: userName,
        email: email,
        profilePicture: "",
        posts: [],
        favorites: [],
        likes: [],
        birthday: birthday.toISOString(),
      };
  
      await createUser(userData);
      console.log("User created:", userCredential.user);
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        Alert.alert(
          "Email already in use",
          "Please use a different email address."
        );
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("Invalid Email", "Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        Alert.alert(
          "Weak Password",
          "Password should be at least 6 characters long."
        );
      } else {
        Alert.alert("Signup Error", error.message);
      }
    }
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || birthday;
    setShowDatePicker(Platform.OS === "ios");
    setBirthday(currentDate);
  };

  return (
    <ImageBackground
      source={require("../reusables/sign-up-background.png")}
      style={styles.backgroundImage}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: theme.backgroundColor + "AA" },
        ]}
      >
        <Text style={[styles.header, { color: theme.textColor }]}>
          Welcome to Voyage Vista!
        </Text>
        <Text style={[styles.subHeader, { color: theme.textColor }]}>
          Explore the world, connect with fellow travelers, and create
          unforgettable memories. Join us today to embark on your next
          adventure!
        </Text>

        <Text style={[styles.label, { color: theme.textColor }]}>Username</Text>
        <TextInput
          placeholder="Enter your username"
          value={userName}
          onChangeText={setUserName}
          autoCapitalize="none"
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBackground,
              color: theme.textColor,
              borderColor: theme.textColor,
            },
          ]}
          placeholderTextColor={theme.placeholderTextColor}
        />

        <Text style={[styles.label, { color: theme.textColor }]}>Birthday</Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBackground,
              justifyContent: "center",
              borderColor: theme.textColor,
            },
          ]}
        >
          <Text style={{ color: theme.textColor }}>
            {birthday.toDateString()}
          </Text>
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
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBackground,
              color: theme.textColor,
              borderColor: theme.textColor,
            },
          ]}
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
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBackground,
              color: theme.textColor,
              borderColor: theme.textColor,
            },
          ]}
          placeholderTextColor={theme.placeholderTextColor}
        />

        <Text style={[styles.label, { color: theme.textColor }]}>
          Confirm Password
        </Text>
        <TextInput
          placeholder="Confirm Password"
          secureTextEntry={true}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoCompleteType="off"
          textContentType="newPassword"
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBackground,
              color: theme.textColor,
              borderColor: theme.textColor,
            },
          ]}
          placeholderTextColor={theme.placeholderTextColor}
        />

        <View style={styles.buttonContainer}>
          <ThemedButton title="Register" onPress={signupHandler} />
        </View>

        <View style={styles.buttonContainer}>
          <ThemedButton
            title="Already Registered? Login"
            onPress={loginHandler}
          />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  subHeader: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 8,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  buttonContainer: {
    marginVertical: 8,
    alignItems: "center",
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
});
