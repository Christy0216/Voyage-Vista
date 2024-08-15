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
import * as Location from "expo-location";
import { auth } from "../firebase/firebaseSetUp";
import { createPost, addPostComment } from "../firebase/firebasePostHelper";
import { mapsApiKey } from "@env";

const AddPostScreen = ({ navigation }) => {
  const [story, setStory] = useState("");
  const [destination, setDestination] = useState("");
  const [addressType, setAddressType] = useState("street_address");
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const { theme } = useTheme();
  const mapRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: "stree address", value: "street_address" },
    { label: "route", value: "route" },
    { label: "political district", value: "political" },
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

  const handleGetLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      const latlng = `${loc.coords.latitude},${loc.coords.longitude}`;

      const address = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&result_type=${addressType}&key=${mapsApiKey}`);
      const addressJson = await address.json();
      setAddress(addressJson.results[0].formatted_address);
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  const updateAddress = async() => {
    const latlng = `${location.latitude},${location.longitude}`;
    try
    {
      const addressStr = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&result_type=${addressType}&key=${mapsApiKey}`).then((response) => response.json()).then((data) => {return data.results[0].formatted_address}); 
      setAddress(addressStr);
    } catch (error) {
      console.log('error fetching address:', error);
    }
  };

  const handleSubmit = async () => {
    const post = {
      uid: auth.currentUser.uid,
      story,
      destination,
      addressType,
      location,
      address,
      images,
    };

    try {
      const docRefId = await createPost(auth.currentUser.uid, post);

      console.log("Post created with ID:", docRefId);
      setStory("");
      setDestination("");
      setAddressType("city");
      setLocation(null);
      setImages([]);
      setAddress("");
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
                uri: `https://maps.googleapis.com/maps/api/staticmap?center=${location.latitude},${location.longitude}&zoom=15&size=600x300&markers=color:red%7Clabel:A%7C${location.latitude},${location.longitude}&key=${mapsApiKey}`,
              }}
              style={themedStyles.map}
            />
          </View>
        )}
        <TouchableOpacity onPress={handleGetLocation} style={themedStyles.button}>
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
