import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
  ScrollView,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useTheme } from "../context/ThemeContext";
import * as ImagePicker from "expo-image-picker";
import { auth } from "../firebase/firebaseSetUp";
import { createPost, addPostComment } from "../firebase/firebasePostHelper";

const AddPostScreen = ({ navigation }) => {
  const [story, setStory] = useState("");
  const [destination, setDestination] = useState("");
  const [addressType, setAddressType] = useState("city");
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState({ lat: 0, lon: 0 });
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const { theme } = useTheme();

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: "City", value: "city" },
    { label: "County", value: "county" },
    { label: "Street Address", value: "streetAddress" },
  ]);

  useEffect(() => {
    const getPermissions = async () => {
      const mediaLibraryStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      if (
        mediaLibraryStatus.status !== "granted" ||
        cameraStatus.status !== "granted"
      ) {
        alert(
          "Permissions for camera and photo library are required to proceed."
        );
      }
    };
    getPermissions();
  }, []);

  const handleSelectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.cancelled && result.assets) {
      setImages((prev) => [...prev, ...result.assets.map((img) => img.uri)]);
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      console.log("Photo capture result:", result); // Log the entire result to inspect its structure
      if (!result.cancelled && result.assets) {
        console.log("Photo taken:", result.assets[0].uri); // Confirm URI is logged correctly
        setImages((prev) => [...prev, result.assets[0].uri]); // Update state with the new image URI
      } else {
        console.log("Photo capture cancelled or failed:", result);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
    }
  };

  const handleSubmit = async () => {
    const post = {
      uid: auth.currentUser.uid,
      story,
      destination,
      addressType,
      address,
      coordinates,
      images,
      comment,
    };

    try {
      const docRefId = await createPost(auth.currentUser.uid, post);
      console.log("Post created with ID:", docRefId);
      if (comment) {
        await addPostComment(docRefId, {
          content: comment,
          userId: auth.currentUser.uid,
          timestamp: new Date(),
        });
        console.log("Comment added to post successfully");
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error adding post:", error);
    }
  };

  const themedStyles = styles(theme);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={themedStyles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={themedStyles.imageContainer}
        >
          {images.map((uri, index) => (
            <Image key={index} source={{ uri }} style={themedStyles.image} />
          ))}
        </ScrollView>
        <TouchableOpacity
          onPress={handleSelectImage}
          style={themedStyles.button}
        >
          <Text style={themedStyles.buttonText}>Select Image</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={takePhoto} style={themedStyles.button}>
          <Text style={themedStyles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
        <TextInput
          style={themedStyles.input}
          value={destination}
          onChangeText={setDestination}
          placeholder="Destination"
        />
        <TextInput
          style={themedStyles.input}
          value={story}
          onChangeText={setStory}
          placeholder="Story"
          multiline
        />
        <DropDownPicker
          open={open}
          value={addressType}
          items={items}
          setOpen={setOpen}
          setValue={setAddressType}
          setItems={setItems}
          style={themedStyles.picker}
          dropDownContainerStyle={themedStyles.dropdownStyle}
        />
        <TextInput
          style={themedStyles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="Address"
        />
        <TextInput
          style={themedStyles.input}
          value={`${coordinates.lat}`}
          onChangeText={(lat) =>
            setCoordinates({ ...coordinates, lat: parseFloat(lat) })
          }
          placeholder="Latitude"
          keyboardType="numeric"
        />
        <TextInput
          style={themedStyles.input}
          value={`${coordinates.lon}`}
          onChangeText={(lon) =>
            setCoordinates({ ...coordinates, lon: parseFloat(lon) })
          }
          placeholder="Longitude"
          keyboardType="numeric"
        />
        <TextInput
          style={themedStyles.input}
          value={comment}
          onChangeText={setComment}
          placeholder="Comment"
          multiline
        />
        <TouchableOpacity onPress={handleSubmit} style={themedStyles.button}>
          <Text style={themedStyles.buttonText}>Submit Post</Text>
        </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.backgroundColor,
    },
    imageContainer: {
      flexDirection: "row",
      marginBottom: 10,
    },
    image: {
      width: 100,
      height: 100,
      borderRadius: 10,
      marginRight: 10,
    },
    input: {
      borderWidth: 1,
      borderColor: "gray",
      padding: 10,
      marginBottom: 10,
      borderRadius: 5,
      backgroundColor: theme.inputBackgroundColor,
    },
    picker: {
      borderWidth: 1,
      borderColor: "gray",
      padding: 10,
      borderRadius: 5,
      marginBottom: 10,
      backgroundColor: theme.inputBackgroundColor,
    },
    dropdownStyle: {
      backgroundColor: theme.backgroundColor,
    },
    button: {
      backgroundColor: theme.buttonColor,
      padding: 10,
      borderRadius: 5,
      alignItems: "center",
      marginBottom: 10,
    },
    buttonText: {
      color: theme.buttonTextColor,
    },
  });

export default AddPostScreen;
