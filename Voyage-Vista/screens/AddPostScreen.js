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

const AddPostScreen = ({ navigation }) => {
  const [story, setStory] = useState('');
  const [addressType, setAddressType] = useState('city');

  const handleSubmit = () => {
    // Handle the submit action
    console.log('Post submitted:', { story, addressType });
    // Navigation or other actions
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Submit Button */}
        <View style={styles.submitButtonContainer}>
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>

        {/* My Story TextInput */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>My Story</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={4}
            value={story}
            onChangeText={setStory}
          />
        </View>

        {/* Photo Area */}
        <View style={styles.photoArea}>
          <Text style={styles.label}>Photo Area</Text>
          {/* Empty view for photo area */}
          <View style={styles.photoPlaceholder}></View>
        </View>

        {/* Address Dropdown */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Address</Text>
          <Picker
            selectedValue={addressType}
            onValueChange={(itemValue) => setAddressType(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="City" value="city" />
            <Picker.Item label="County" value="county" />
            <Picker.Item label="Street Address" value="streetAddress" />
          </Picker>
          <Text style={styles.fakeAddress}>
            {addressType === 'city' && '123 Fake City, Country'}
            {addressType === 'county' && '456 Fake County, Country'}
            {addressType === 'streetAddress' && '789 Fake Street, Fake City, Country'}
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  submitButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  submitButtonText: {
    color: '#007bff',
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
    backgroundColor: '#fff',
  },
  fakeAddress: {
    marginTop: 8,
    fontSize: 14,
    color: '#555',
  },
});

export default AddPostScreen;
