import React, { useState } from 'react';
import { View, Text, Button, Image, TouchableOpacity, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const ProfileScreen = ({ navigation }) => {
    const [user, setUser] = useState({
        username: 'John Doe',
        birthday: new Date(1990, 0, 1),
        profilePicture: 'https://via.placeholder.com/100'
    });
    const [editMode, setEditMode] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleEditProfilePicture = () => {
        // This will be replaced with actual image picker integration
        console.log("Edit profile picture");
    };

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || user.birthday;
        setShowDatePicker(false);
        setUser({ ...user, birthday: currentDate });
    };

    const toggleEditMode = () => {
        setEditMode(!editMode);
    };

    return (
        <View>
            <TouchableOpacity onPress={handleEditProfilePicture}>
                <Image source={{ uri: user.profilePicture }} style={{ width: 100, height: 100 }} />
            </TouchableOpacity>
            {editMode ? (
                <View>
                    <Text>Username:</Text>
                    <TextInput
                        value={user.username}
                        onChangeText={text => setUser({ ...user, username: text })}
                    />
                    <Button title="Save" onPress={toggleEditMode} />
                </View>
            ) : (
                <View>
                    <Text>Username: {user.username}</Text>
                    <Button title="Edit" onPress={toggleEditMode} />
                </View>
            )}
            <Text>Birthday: {user.birthday.toDateString()}</Text>
            {showDatePicker && (
                <DateTimePicker
                    value={user.birthday}
                    mode="date"
                    display="inline"
                    onChange={handleDateChange}
                />
            )}
            <Button title="Change Birthday" onPress={() => setShowDatePicker(true)} />

            <Button title="View Favorites" onPress={() => navigation.navigate('FavoritesScreen')} />
            
            {/* Here you would also render user posts and other profile info */}
        </View>
    );
};

export default ProfileScreen;
