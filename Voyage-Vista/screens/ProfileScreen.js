import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../context/ThemeContext";

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    username: "John Doe",
    birthday: new Date(1990, 0, 1),
    profilePicture: "https://via.placeholder.com/100",
  });
  const [editMode, setEditMode] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { theme } = useTheme();

  const handleEditProfilePicture = () => {
    // This will be replaced with actual image picker integration
    console.log("Edit profile picture");
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || user.birthday;
    setShowDatePicker(false);
    setUser({ ...user, birthday: currentDate });
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  return (
    <View style={{ backgroundColor: theme.backgroundColor, flex: 1 }}>
      <TouchableOpacity onPress={handleEditProfilePicture}>
        <Image
          source={{ uri: user.profilePicture }}
          style={{ width: 100, height: 100 }}
        />
      </TouchableOpacity>
      {editMode ? (
        <View>
          <Text style={{ color: theme.textColor }}>Username:</Text>
          <TextInput
            style={{ color: theme.textColor, borderColor: theme.textColor }}
            value={user.username}
            onChangeText={(text) => setUser({ ...user, username: text })}
          />
          <Button
            title="Save"
            onPress={toggleEditMode}
            color={theme.textColor}
          />
        </View>
      ) : (
        <View>
          <Text style={{ color: theme.textColor }}>
            Username: {user.username}
          </Text>
          <Button
            title="Edit"
            onPress={toggleEditMode}
            color={theme.textColor}
          />
        </View>
      )}
      <Text style={{ color: theme.textColor }}>
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
        color={theme.textColor}
      />

      <Button
        title="View Favorites"
        onPress={() => navigation.navigate("FavoritesScreen")}
        color={theme.textColor}
      />
    </View>
  );
};

export default ProfileScreen;
