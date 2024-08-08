import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useTheme } from '../context/ThemeContext';
import { auth } from '../firebase/firebaseSetUp';
import { createPost, addPostComment } from '../firebase/firebasePostHelper';

const AddPostScreen = ({ navigation }) => {
  const [story, setStory] = useState('');
  const [destination, setDestination] = useState('');
  const [addressType, setAddressType] = useState('city');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: 0, lon: 0 });
  const [comment, setComment] = useState('');
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'City', value: 'city' },
    { label: 'County', value: 'county' },
    { label: 'Street Address', value: 'streetAddress' },
  ]);

  const handleSubmit = async () => {
    const post = {
      uid: auth.currentUser.uid,
      story,
      destination,
      addressType,
      address,
      coordinates,
    };

    try {
      const docRefId = await createPost(auth.currentUser.uid, post);
      console.log('Post created with ID:', docRefId);
      if (comment) {
        await addPostComment(docRefId, { content: comment, userId: auth.currentUser.uid, timestamp: new Date() });
        console.log('Comment added to post successfully');
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };

  const themedStyles = styles(theme);  // Apply the theme-based styles dynamically

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={themedStyles.container}>
        <View style={themedStyles.submitButtonContainer}>
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={themedStyles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>

        <View style={themedStyles.inputContainer}>
          <Text style={themedStyles.label}>Destination</Text>
          <TextInput
            style={themedStyles.textInput}
            value={destination}
            onChangeText={setDestination}
          />
        </View>

        <View style={themedStyles.inputContainer}>
          <Text style={themedStyles.label}>My Story</Text>
          <TextInput
            style={themedStyles.textInput}
            multiline
            numberOfLines={4}
            value={story}
            onChangeText={setStory}
          />
        </View>

        <View style={themedStyles.inputContainer}>
          <Text style={themedStyles.label}>Address</Text>
          <TextInput
            style={themedStyles.textInput}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter address"
          />
        </View>

        <View style={{ ...themedStyles.inputContainer, zIndex: 1000 }}>
          <Text style={themedStyles.label}>Address Type</Text>
          <DropDownPicker
            open={open}
            value={addressType}
            items={items}
            setOpen={setOpen}
            setValue={setAddressType}
            setItems={setItems}
            style={themedStyles.picker}
            dropDownContainerStyle={{
              backgroundColor: theme.backgroundColor,
            }}
            textStyle={{
              color: theme.textColor,
            }}
            zIndex={3000}
            zIndexInverse={1000}
          />
        </View>

        <View style={themedStyles.inputContainer}>
          <Text style={themedStyles.label}>Coordinates</Text>
          <TextInput
            style={themedStyles.textInput}
            value={String(coordinates.lat)}
            onChangeText={(lat) => setCoordinates({ ...coordinates, lat: parseFloat(lat) })}
            placeholder="Latitude"
            keyboardType="numeric"
          />
          <TextInput
            style={themedStyles.textInput}
            value={String(coordinates.lon)}
            onChangeText={(lon) => setCoordinates({ ...coordinates, lon: parseFloat(lon) })}
            placeholder="Longitude"
            keyboardType="numeric"
          />
        </View>

        <View style={themedStyles.inputContainer}>
          <Text style={themedStyles.label}>Comment</Text>
          <TextInput
            style={themedStyles.textInput}
            multiline
            numberOfLines={2}
            value={comment}
            onChangeText={setComment}
            placeholder="Add a comment"
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.backgroundColor,
  },
  submitButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  submitButtonText: {
    color: theme.textColor,
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: theme.textColor,
  },
  textInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#fff',
  },
  picker: {
    backgroundColor: theme.backgroundColor,
    borderColor: theme.textColor,
  },
});

export default AddPostScreen;
