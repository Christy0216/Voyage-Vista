import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

export const Map = () => {
    const [location, setLocation] = useState(null);
    const mapRef = useRef(null);

    const centerMapOnUser = async () => {
        // Request permission to access location
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to access location was denied');
            return;
        }

        // Get the current location of the user
        let loc = await Location.getCurrentPositionAsync({});
        const newRegion = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        };

        setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude
        });

        // Animate map to the new region
        if (mapRef.current) {
            mapRef.current.animateToRegion(newRegion, 1000); // 1000ms animation duration
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <MapView
                ref={mapRef}
                style={{ flex: 1 }}
                initialRegion={{
                    latitude: 37.78825,
                    longitude: -122.4324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                {location && <Marker coordinate={location} />}
            </MapView>
            <TouchableOpacity
                style={styles.locateButton}
                onPress={centerMapOnUser}
            >
                <Ionicons name="locate-outline" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    locateButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
