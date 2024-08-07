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
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../context/ThemeContext';
import { auth, db } from '../firebase/firebaseSetUp';
import { addDoc, collection } from 'firebase/firestore';

const AddPostScreen = ({ navigation }) => {
  const [story, setStory] = useState('');
  const [addressType, setAddressType] = useState('city');
  const { theme } = useTheme();

  const handleSubmit = async () => {
    if (!auth.currentUser) {
      console.log('No user logged in');
      return;
    }

    const post = {
      uid: auth.currentUser.uid,
      story,
      addressType,
      photos: [],
      createdAt: new Date()
    };

    try {
      const docRef = await addDoc(collection(db, 'posts'), post);
      console.log('Post created with ID:', docRef.id);
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
          <Text style={themedStyles.label}>My Story</Text>
          <TextInput
            style={themedStyles.textInput}
            multiline
            numberOfLines={4}
            value={story}
            onChangeText={setStory}
          />
        </View>

        <View style={themedStyles.photoArea}>
          <Text style={themedStyles.label}>Photo Area</Text>
          <View style={themedStyles.photoPlaceholder}></View>
        </View>

        <View style={themedStyles.inputContainer}>
          <Text style={themedStyles.label}>Address</Text>
          <Picker
            selectedValue={addressType}
            onValueChange={(itemValue) => setAddressType(itemValue)}
            style={themedStyles.picker}
            itemStyle={{
              color: theme.textColor
            }}
          >
            <Picker.Item label="City" value="city" />
            <Picker.Item label="County" value="county" />
            <Picker.Item label="Street Address" value="streetAddress" />
          </Picker>
          <Text style={themedStyles.fakeAddress}>
            {addressType === 'city' && '123 Fake City, Country'}
            {addressType === 'county' && '456 Fake County, Country'}
            {addressType === 'streetAddress' && '789 Fake Street, Fake City, Country'}
          </Text>
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
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#fff',
  },
  photoArea: {
    marginVertical: 16,
  },
  photoPlaceholder: {
    height: 200,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: theme.backgroundColor,
  },
  fakeAddress: {
    marginTop: 8,
    fontSize: 14,
    color: theme.textColor,
  },
});

export default AddPostScreen;
