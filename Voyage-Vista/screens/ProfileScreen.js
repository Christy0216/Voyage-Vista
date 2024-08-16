import React, { useState, useEffect, useCallback } from "react";
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
  Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../context/ThemeContext";
import { auth } from "../firebase/firebaseSetUp";
import { getUser, updateUser } from "../firebase/firebaseUserHelper";
import { defaultPicture } from "../reusables/objects";
import PostItem from "../components/PostItem";
import { deletePost, fetchPostsByUserId } from "../firebase/firebasePostHelper";
import { onAuthStateChanged } from "firebase/auth";
import * as ImagePicker from "expo-image-picker";
// import * as Permissions from "expo-permissions";
import ThemedButton from "../components/ThemedButton";
import {storage} from "../firebase/firebaseSetUp";
import {uploadBytesResumable, getDownloadURL, ref} from "firebase/storage";




const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    userId: "",
    username: "",
    birthday: new Date(),
    profilePicture: defaultPicture,
  });
  const [docId, setDocId] = useState("");
  const [editMode, setEditMode] = useState({
    username: false,
    birthday: false,
  });
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
            birthday: userData.birthday
              ? new Date(userData.birthday)
              : new Date(),
            profilePicture: userData.profilePicture || defaultPicture,
          });
          fetchUserPosts(currentUser.uid);
        }
      }
    });
    return unsubscribe;
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (auth.currentUser) {
        fetchUserPosts(auth.currentUser.uid);
      }
    }, [])
  );

  const fetchUserPosts = async (userId) => {
    try {
      const posts = await fetchPostsByUserId(userId);
      console.log("User posts:", posts);
      setUserPosts(
        posts.map((post) => ({
          ...post,
          photos: (post.images || []).slice(0, 4).map((url) => ({ url })),
        }))
      );
    } catch (error) {
      console.log("Error getting user posts: ", error);
    }
  };

  const handleSaveChanges = async (field) => {
    if (field === "username") {
      await updateUser(docId, { username: user.username });
      setEditMode({ ...editMode, [field]: false });
    } else if (field === "birthday") {
      await updateUser(docId, { birthday: user.birthday.toISOString() });
      setEditMode({ ...editMode, [field]: false });
      setShowDatePicker(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || user.birthday;
    setUser({ ...user, birthday: currentDate });
    setShowDatePicker(event.type === "set" ? false : true);
  };

  const handleProfilePictureChange = async (type) => {
    let result;
    if (type === "camera") {
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
    }

    console.log("Image picker result:", result); // Check what the result looks like

    if (!result.cancelled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      try {
        // Use the retrieveUpLoadImage function to upload the image
        const imageFullPath = await retrieveUpLoadImage(uri);
  
        // Get the download URL of the uploaded image
        const downloadURL = await getDownloadURL(ref(storage, imageFullPath));
  
        // Update the profile picture URL in Firestore
        await updateUser(docId, { profilePicture: downloadURL });
        setUser((prevUser) => ({ ...prevUser, profilePicture: downloadURL }));
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        Alert.alert("Error", "Failed to update profile picture.");
      }
    } else {
      console.log("Operation cancelled or failed, no URI to update.");
    }
  };
  
  // Updated retrieveUpLoadImage function
  async function retrieveUpLoadImage(uri) {
    const response = await fetch(uri);
    try {
      if (!response.ok) {
        throw new Error("HTTP error, status = " + response.status);
      }
      const blob = await response.blob();
      const imageName = `profile_${user.userId}_${Date.now()}`;
      const imageRef = ref(storage, `profile_pictures/${imageName}`);
      const uploadResult = await uploadBytesResumable(imageRef, blob);
      console.log("Full path", uploadResult.metadata.fullPath);
      return uploadResult.metadata.fullPath;
    } catch (e) {
      console.log(e);
      throw e; // Re-throw the error to be caught in handleProfilePictureChange
    }
  }

  // const uploadImage = async (uri, storageRef) => {
  //   const response = await fetch(uri);
  //   const blob = await response.blob();
  //   return storageRef.put(blob);
  // };


  const chooseProfilePicture = () => {
    Alert.alert(
      "Change Profile Picture",
      "Choose the source for your profile picture:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Take Photo",
          onPress: () => handleProfilePictureChange("camera"),
        },
        {
          text: "Choose from Gallery",
          onPress: () => handleProfilePictureChange("gallery"),
        },
      ]
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <TouchableOpacity onPress={chooseProfilePicture}>
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
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.input,
                { color: theme.textColor, borderColor: theme.textColor },
              ]}
              value={user.username}
              onChangeText={(text) => setUser({ ...user, username: text })}
            />
            <ThemedButton
              title="Save"
              onPress={() => handleSaveChanges("username")}
            />
          </View>
        ) : (
          <View style={styles.inputRow}>
            <Text style={[styles.value, { color: theme.textColor }]}>
              {user.username}
            </Text>
            <ThemedButton
              title="Edit"
              onPress={() => setEditMode({ ...editMode, username: true })}
            />
          </View>
        )}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: theme.textColor }]}>
          Birthday:
        </Text>
        {editMode.birthday ? (
          <View style={styles.inputRow}>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Text style={[styles.value, { color: theme.textColor }]}>
                {user.birthday.toDateString()}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={user.birthday}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
            <ThemedButton
              title="Save"
              onPress={() => handleSaveChanges("birthday")}
            />
          </View>
        ) : (
          <View style={styles.inputRow}>
            <Text style={[styles.value, { color: theme.textColor }]}>
              {user.birthday.toDateString()}
            </Text>
            <ThemedButton
              title="Edit"
              onPress={() => {
                setEditMode({ ...editMode, birthday: true });
                setShowDatePicker(true);
              }}
            />
          </View>
        )}
      </View>
      <View style={styles.buttonContainer}>
        <ThemedButton
          title="View Favorites"
          onPress={() => navigation.navigate("FavoritesScreen")}
        />
      </View>
      <FlatList
        data={userPosts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View>
            <PostItem post={item} />
          </View>
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
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  value: {
    fontSize: 16,
  },
  buttonContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
});

export default ProfileScreen;
