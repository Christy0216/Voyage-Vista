import React, { useState } from 'react';
import { Modal, View, TextInput, StyleSheet } from 'react-native';
import ThemedButton from '../components/ThemedButton';
import { useTheme } from '../context/ThemeContext'; // Assuming you have a ThemeContext

const CitySelectionModal = ({ visible, onClose, onSelectCity }) => {
  const [city, setCity] = useState('');
  const { theme } = useTheme(); // Assuming your theme context provides colors

  const handleSelectCity = () => {
    onSelectCity(city);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.backgroundColor }]}>
          <TextInput
            placeholder="Enter city name"
            placeholderTextColor={theme.placeholderTextColor}
            value={city}
            onChangeText={setCity}
            style={[styles.textInput, { color: theme.textColor, borderColor: theme.borderColor }]}
          />
          <ThemedButton title="Select City" onPress={handleSelectCity} />
          <ThemedButton title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  textInput: {
    width: '100%',
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 5,
  },
});

export default CitySelectionModal;
