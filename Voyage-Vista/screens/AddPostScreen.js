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
import * as Location from "expo-location";
import { auth } from "../firebase/firebaseSetUp";
import { createPost, updatePost } from "../firebase/firebasePostHelper";
import { MAP_API_KEY } from "@env";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/firebaseSetUp";

const AddPostScreen = ({ navigation }) => {
  const [story, setStory] = useState("");
  const [destination, setDestination] = useState("");
  const [addressType, setAddressType] = useState("street_address");
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const { theme } = useTheme();

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: "street address", value: "street_address" },
    { label: "route", value: "route" },
    { label: "political district", value: "political" },
  ]);
  const [response, requestPermission] = Location.useForegroundPermissions();
  async function VerifyPermissions() {
    if (response.granted) {
      return true;
    }
    const permissionResponse = await requestPermission();
    return permissionResponse.granted;
  }

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
      if (!result.cancelled && result.assets) {
        setImages((prev) => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
    }
  };

  const handleGetLocation = async () => {
    try {
      const permission = await VerifyPermissions();
      if (!permission) {
        Alert.alert("permission not granted");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      const latlng = `${loc.coords.latitude},${loc.coords.longitude}`;

      const address = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&result_type=${addressType}&key=${MAP_API_KEY}`
      );
      const addressJson = await address.json();
      
      setAddress(addressJson.results[0].formatted_address);
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  const updateAddress = async () => {
    const latlng = `${location.latitude},${location.longitude}`;
    try {
      console.log("addressType", addressType);
      console.log("latlng", latlng);
      console.log("MAP_API_KEY", MAP_API_KEY);
      const addressStr = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&result_type=${addressType}&key=${MAP_API_KEY}`
      )
        .then((response) => response.json())
        .then((data) => {
          return data.results[0].formatted_address;
        });
      setAddress(addressStr);
    } catch (error) {
      console.log("error fetching address:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      // Create a post object without images first
      const post = {
        uid: auth.currentUser.uid,
        story,
        destination,
        addressType,
        location,
        address,
        images: [], // This will be updated with the actual URLs after images are uploaded
      };
  
      // Add the post to Firestore to get the postId
      const docRefId = await createPost(auth.currentUser.uid, post);
      console.log("Post created with ID:", docRefId);
  
      // Now upload images to Firebase Storage using the postId
      const uploadedImageUrls = await Promise.all(
        images.map(async (imageUri, index) => {
          const imageRef = ref(
            storage,
            `posts/${docRefId}/${Date.now()}_${index}`
          );
          const response = await fetch(imageUri);
          const blob = await response.blob();
  
          await uploadBytes(imageRef, blob);
          return await getDownloadURL(imageRef);
        })
      );
  
      // Update the post document with the image URLs
      await updatePost(docRefId, { images: uploadedImageUrls });
      console.log("Post images uploaded and post updated with image URLs.");
  
      // Reset state after submission
      setStory("");
      setDestination("");
      setLocation(null);
      setAddressType("street_address");
      setImages([]);
      setAddress("");
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
          style={[themedStyles.input, themedStyles.storyInput]}
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
          onChangeValue={() => {
            if (location) {
              updateAddress();
            }
          }}
          style={themedStyles.picker}
          dropDownContainerStyle={themedStyles.dropdownStyle}
          listMode="SCROLLVIEW"
        />
        <Text style={themedStyles.addressText}>{address}</Text>
        {location && (
          <View style={themedStyles.mapContainer}>
            <Image
              source={{
                uri: `https://maps.googleapis.com/maps/api/staticmap?center=${location.latitude},${location.longitude}&zoom=15&size=600x300&markers=color:red%7Clabel:A%7C${location.latitude},${location.longitude}&key=${MAP_API_KEY}`,
              }}
              style={themedStyles.map}
            />
          </View>
        )}
        <TouchableOpacity
          onPress={handleGetLocation}
          style={themedStyles.button}
        >
          <Text style={themedStyles.buttonText}>Get My Location</Text>
        </TouchableOpacity>
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
    storyInput: {
      height: 150, // Adjust the height as needed
      textAlignVertical: "top", // Ensures the text starts at the top of the input
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
    addressText: {
      marginVertical: 10,
      fontSize: 16,
      color: theme.textColor,
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
    mapContainer: {
      marginBottom: 10,
    },
    map: {
      width: "100%",
      height: 200,
      borderRadius: 10,
    },
  });

export default AddPostScreen;