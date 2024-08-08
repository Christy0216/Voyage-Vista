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
import { defaultPicture } from "../reusables/objects";
import { FlatList } from "react-native";
import PostItem from "../components/PostItem";
import { handleEditProfilePicture, fetchPostsByUserId, deletePost } from "../firebase/firebasePostHelper";
import { Alert } from "react-native";

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    userId: "",
    username: "",
    birthday: new Date(),
    profilePicture: defaultPicture,
  });
  const [docId, setDocId] = useState("");
  const [editMode, setEditMode] = useState({ username: false, birthday: false });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { theme } = useTheme();
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userData = await getUser(currentUser.uid);
        if (userData) {
          setDocId(userData.id);
          setUser({
            ...userData,
            birthday: userData.birthday ? new Date(userData.birthday) : new Date(),
            profilePicture: userData.profilePicture || defaultPicture,
          });
          fetchUserPosts(currentUser.uid);
        }
      }
    });
    return unsubscribe;
  }, []);

  const fetchUserPosts = async (userId) => {
    const posts = await fetchPostsByUserId(userId);
    setUserPosts(posts);
  };

  const handleDeletePost = async (postId) => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: async () => {
          await deletePost(postId);
          fetchUserPosts(auth.currentUser.uid); // Refresh the list after deletion
          const updatedPosts = userPosts.filter(post => post.id !== postId);
        setUserPosts(updatedPosts);
        }},
      ]
    );
  };

  const handleSaveChanges = async (field) => {
    if (field === "username") {
      await updateUser(docId, { username: user.username });
      setEditMode({ ...editMode, [field]: false });
    } else if (field === "birthday") {
      await updateUser(docId, { birthday: user.birthday.toISOString() });
      setEditMode({ ...editMode, [field]: false });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <TouchableOpacity onPress={handleEditProfilePicture}>
        <Image source={{ uri: user.profilePicture }} style={styles.profilePicture} />
      </TouchableOpacity>

      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: theme.textColor }]}>Username:</Text>
        {editMode.username ? (
          <>
            <TextInput
              style={[styles.input, { color: theme.textColor, borderColor: theme.textColor }]}
              value={user.username}
              onChangeText={(text) => setUser({ ...user, username: text })}
            />
            <Button title="Save" onPress={() => handleSaveChanges("username")} color="darkmagenta" />
          </>
        ) : (
          <>
            <Text style={[styles.value, { color: theme.textColor }]}>{user.username}</Text>
            <Button title="Edit" onPress={() => setEditMode({ ...editMode, username: true })} color="darkmagenta" />
          </>
        )}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: theme.textColor }]}>Birthday:</Text>
        {editMode.birthday ? (
          <>
            <DateTimePicker
              value={user.birthday}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
            <Button title="Save" onPress={() => handleSaveChanges("birthday")} color="darkmagenta" />
          </>
        ) : (
          <>
            <Text style={[styles.value, { color: theme.textColor }]}>{user.birthday.toDateString()}</Text>
            <Button title="Edit" onPress={() => setEditMode({ ...editMode, birthday: true })} color="darkmagenta" />
          </>
        )}
      </View>

      <Button title="View Favorites" onPress={() => navigation.navigate("FavoritesScreen")} color="darkmagenta" />

      <FlatList
        data={userPosts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostItem
            post={item}
            onDelete={() => handleDeletePost(item.id)}
            isDeletable={item.userId === auth.currentUser.uid}
          />
        )}
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
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  value: {
    fontSize: 16,
    marginBottom: 4,
  },
});

export default ProfileScreen;
