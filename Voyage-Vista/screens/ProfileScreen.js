import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  FlatList,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../context/ThemeContext";
import { auth } from "../firebase/firebaseSetUp";
import { getUser, updateUser } from "../firebase/firebaseUserHelper";
import { defaultPicture } from "../reusables/objects";
import PostItem from "../components/PostItem";
import { deletePost } from "../firebase/firebasePostHelper";
import { db } from "../firebase/firebaseSetUp";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Platform } from "react-native";

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    userId: "",
    username: "",
    birthday: new Date(),
    profilePicture: defaultPicture,
  });
  const [editMode, setEditMode] = useState({
    username: false,
    birthday: false,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { theme } = useTheme();
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        getUser(user.uid).then((userData) => {
          if (userData) {
            setUser({
              userId: user.uid,
              username: userData.username,
              birthday: new Date(userData.birthday),
              profilePicture: userData.profilePicture || defaultPicture,
            });
            fetchUserPosts(user.uid);
          }
        });
      }
    });
  }, []);

  const fetchUserPosts = (userId) => {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, where("uid", "==", userId));

    onSnapshot(
      q,
      (snapshot) => {
        const posts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUserPosts(posts);
      },
      (error) => {
        console.error("Failed to fetch posts:", error); // Error handling
      }
    );
  };

  const handleDeletePost = async (postId) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          await deletePost(postId);
          const updatedPosts = userPosts.filter((post) => post.id !== postId);
          setUserPosts(updatedPosts);
        },
      },
    ]);
  };

  const handleSaveChanges = async (field) => {
    if (field === "username") {
      await updateUser(user.userId, { username: user.username });
      setEditMode({ ...editMode, [field]: false });
    } else if (field === "birthday") {
      await updateUser(user.userId, { birthday: user.birthday.toISOString() });
      setEditMode({ ...editMode, [field]: false });
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || user.birthday;
    setShowDatePicker(Platform.OS === "ios");
    setUser({ ...user, birthday: currentDate });
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <TouchableOpacity onPress={() => console.log("Edit profile picture")}>
        <Image
          source={{ uri: user.profilePicture }}
          style={styles.profilePicture}
        />
      </TouchableOpacity>

      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: theme.textColor }]}>
          Username:
        </Text>
        {editMode.username ? (
          <TextInput
            style={[
              styles.input,
              { color: theme.textColor, borderColor: theme.textColor },
            ]}
            value={user.username}
            onChangeText={(text) => setUser({ ...user, username: text })}
          />
        ) : (
          <Text style={[styles.value, { color: theme.textColor }]}>
            {user.username}
          </Text>
        )}
        <Button
          title={editMode.username ? "Save" : "Edit"}
          onPress={() => {
            setEditMode({ ...editMode, username: !editMode.username });
          }}
          color="darkmagenta"
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: theme.textColor }]}>
          Birthday:
        </Text>
        <TouchableOpacity onPress={() => setShowDatePicker(!showDatePicker)}>
          <Text style={[styles.value, { color: theme.textColor }]}>
            {user.birthday.toDateString()}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={user.birthday}
            mode="date"
            display="inline"
            onChange={handleDateChange}
            onTouchCancel={() => setShowDatePicker(false)}
          />
        )}
        {editMode.birthday && (
          <Button
            title="Save"
            onPress={() => {
              handleSaveChanges("birthday");
              setShowDatePicker(false);
            }}
            color="darkmagenta"
          />
        )}
      </View>

      <Button
        title="View Favorites"
        onPress={() => navigation.navigate("FavoritesScreen")}
        color="darkmagenta"
      />

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
