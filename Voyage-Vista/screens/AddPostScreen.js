import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
  FlatList,
  Alert,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import * as Geocoding from "expo-location";
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
  const mapRef = useRef(null);

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
    centerMapOnUser();
  }, []);

  const centerMapOnUser = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission to access location was denied");
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    const newRegion = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };

    setCoordinates({
      lat: loc.coords.latitude,
      lon: loc.coords.longitude,
    });

    const reverseGeocode = await Geocoding.reverseGeocodeAsync({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });

    if (reverseGeocode.length > 0) {
      setAddress(reverseGeocode[0].formattedAddress);
    }

    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 1000);
    }
  };

  const handleAddressChange = async (text) => {
    setAddress(text);

    try {
      const geocode = await Geocoding.geocodeAsync(text);
      if (geocode.length > 0) {
        const { latitude, longitude } = geocode[0];
        setCoordinates({ lat: latitude, lon: longitude });

        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };

        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 1000);
        }
      } else {
        Alert.alert("Address not found", "Please enter a valid address.");
      }
    } catch (error) {
      console.error("Error fetching geocode:", error);
    }
  };

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setCoordinates({ lat: latitude, lon: longitude });

    Geocoding.reverseGeocodeAsync({ latitude, longitude }).then((res) => {
      if (res.length > 0) {
        setAddress(res[0].formattedAddress);
      }
    });
  };

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
      if (comment) {
        await addPostComment(docRefId, {
          content: comment,
          userId: auth.currentUser.uid,
          timestamp: new Date(),
        });
      }
      setStory("");
      setDestination("");
      setAddressType("city");
      setAddress("");
      setCoordinates({ lat: 0, lon: 0 });
      setComment("");
      setImages([]);
      navigation.goBack();
    } catch (error) {
      console.error("Error adding post:", error);
    }
  };

  const renderContent = () => (
    <View style={themedStyles.contentContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={images}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={themedStyles.image} />
        )}
        style={themedStyles.imageContainer}
      />
      <TouchableOpacity onPress={handleSelectImage} style={themedStyles.button}>
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
        placeholderTextColor={theme.placeholderTextColor}
      />
      <TextInput
        style={themedStyles.input}
        value={story}
        onChangeText={setStory}
        placeholder="Story"
        placeholderTextColor={theme.placeholderTextColor}
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
        textStyle={{ color: theme.textColor }}
        placeholderStyle={{ color: theme.placeholderTextColor }}
      />
      <TextInput
        style={themedStyles.input}
        value={address}
        onChangeText={handleAddressChange}
        placeholder="Address"
        placeholderTextColor={theme.placeholderTextColor}
      />
      <TextInput
        style={themedStyles.input}
        value={`${coordinates.lat}`}
        onChangeText={(lat) =>
          setCoordinates({ ...coordinates, lat: parseFloat(lat) })
        }
        placeholder="Latitude"
        placeholderTextColor={theme.placeholderTextColor}
        keyboardType="numeric"
      />
      <TextInput
        style={themedStyles.input}
        value={`${coordinates.lon}`}
        onChangeText={(lon) =>
          setCoordinates({ ...coordinates, lon: parseFloat(lon) })
        }
        placeholder="Longitude"
        placeholderTextColor={theme.placeholderTextColor}
        keyboardType="numeric"
      />

      <MapView
        ref={mapRef}
        style={themedStyles.map}
        initialRegion={{
          latitude: coordinates.lat || 37.78825,
          longitude: coordinates.lon || -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handleMapPress}
      >
        {coordinates.lat && coordinates.lon ? (
          <Marker
            coordinate={{
              latitude: coordinates.lat,
              longitude: coordinates.lon,
            }}
            draggable
            onDragEnd={handleMapPress}
          />
        ) : null}
      </MapView>

      <TextInput
        style={themedStyles.input}
        value={comment}
        onChangeText={setComment}
        placeholder="Comment"
        placeholderTextColor={theme.placeholderTextColor}
        multiline
      />
      <TouchableOpacity onPress={handleSubmit} style={themedStyles.button}>
        <Text style={themedStyles.buttonText}>Submit Post</Text>
      </TouchableOpacity>
    </View>
  );

  const themedStyles = styles(theme);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <FlatList
        data={[]}
        keyExtractor={() => "key"}
        ListHeaderComponent={renderContent}
        style={themedStyles.container}
      />
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
    contentContainer: {
      paddingBottom: 20,
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
      color: theme.textColor,
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
    map: {
      height: 300,
      marginVertical: 10,
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
