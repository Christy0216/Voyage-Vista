import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button } from 'react-native';

const CitySelectionModal = ({ visible, onClose, onSelectCity }) => {
  const [city, setCity] = useState('');

  const handleSelectCity = () => {
    onSelectCity(city);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View>
        <TextInput
          placeholder="Enter city name"
          value={city}
          onChangeText={setCity}
        />
        <Button title="Select City" onPress={handleSelectCity} />
        <Button title="Close" onPress={onClose} />
      </View>
    </Modal>
  );
};

export default CitySelectionModal;
