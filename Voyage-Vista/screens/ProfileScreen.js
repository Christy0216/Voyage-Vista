import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../context/ThemeContext";
import { auth } from "../firebase/firebaseSetUp";
import { getUser, updateUser } from "../firebase/firebaseUserHelper";
import { onAuthStateChanged } from "firebase/auth";

const defaultImage = "https://via.placeholder.com/100";

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    userId: "",
    username: "",
    birthday: new Date(),
  });
  const [docId, setDocId] = useState(""); // Store the document ID
  const [editMode, setEditMode] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchUserData = async (userId) => {
      const userData = await getUser(userId);
      if (userData) {
        setDocId(userData.id); // Set the document ID
        setUser({
          ...userData,
          birthday: new Date(userData.birthday), // Convert string to Date object
        });
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        fetchUserData(currentUser.uid);
      }
    });

    return unsubscribe; // Proper cleanup on unmount
  }, []);

  const handleEditProfilePicture = () => {
    // This will be replaced with actual image picker integration
    console.log("Edit profile picture");
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || user.birthday;
    setShowDatePicker(false);
    setUser({ ...user, birthday: currentDate });
  };

  const toggleEditMode = async () => {
    if (editMode) {
      await updateUser(docId, {
        username: user.username,
        birthday: user.birthday.toISOString(),
      });
    }
    setEditMode(!editMode);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <TouchableOpacity onPress={handleEditProfilePicture}>
        <Image
          source={{ uri: user.profilePicture || defaultImage }}
          style={styles.profilePicture}
        />
      </TouchableOpacity>
      {editMode ? (
        <View>
          <Text style={[styles.label, { color: theme.textColor }]}>Username:</Text>
          <TextInput
            style={[styles.input, { color: theme.textColor, borderColor: theme.textColor }]}
            value={user.username}
            onChangeText={(text) => setUser({ ...user, username: text })}
          />
          <Button
            title="Save"
            onPress={toggleEditMode}
            color="darkmagenta"
          />
        </View>
      ) : (
        <View>
          <Text style={[styles.label, { color: theme.textColor }]}>
            Username: {user.username}
          </Text>
          <Button
            title="Edit"
            onPress={toggleEditMode}
            color="darkmagenta"
          />
        </View>
      )}
      <Text style={[styles.label, { color: theme.textColor }]}>
        Birthday: {user.birthday.toDateString()}
      </Text>
      {showDatePicker && (
        <DateTimePicker
          value={user.birthday}
          mode="date"
          display="inline"
          onChange={handleDateChange}
        />
      )}
      <Button
        title="Change Birthday"
        onPress={() => setShowDatePicker(true)}
        color="darkmagenta"
      />

      <Button
        title="View Favorites"
        onPress={() => navigation.navigate("FavoritesScreen")}
        color="darkmagenta"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
});

export default ProfileScreen;
