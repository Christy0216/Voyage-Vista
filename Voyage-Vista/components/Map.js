import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // Import for navigation
import { fetchPostsInRegion } from '../firebase/firebasePostHelper';

export const Map = () => {
    const [location, setLocation] = useState(null);
    const [visiblePosts, setVisiblePosts] = useState([]);
    const mapRef = useRef(null);
    const navigation = useNavigation(); // Initialize navigation

    const centerMapOnUser = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to access location was denied');
            return;
        }

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

        if (mapRef.current) {
            mapRef.current.animateToRegion(newRegion, 1000);
        }
    };

    const onRegionChangeComplete = async (region) => {
        try {
            const posts = await fetchPostsInRegion(region);
            setVisiblePosts(posts);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    useEffect(() => {
        // Initialize the visible posts based on the initial region
        if (mapRef.current) {
            mapRef.current.getMapBoundaries().then(bounds => {
                const initialRegion = {
                    latitude: (bounds.northEast.latitude + bounds.southWest.latitude) / 2,
                    longitude: (bounds.northEast.longitude + bounds.southWest.longitude) / 2,
                    latitudeDelta: bounds.northEast.latitude - bounds.southWest.latitude,
                    longitudeDelta: bounds.northEast.longitude - bounds.southWest.longitude,
                };
                onRegionChangeComplete(initialRegion);
            });
        }
    }, []);

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
                onRegionChangeComplete={onRegionChangeComplete}
            >
                {location && <Marker coordinate={location} />}
                {visiblePosts.map((post, index) => (
                    <Marker
                        key={index}
                        coordinate={{
                            latitude: post.location.latitude,
                            longitude: post.location.longitude,
                        }}
                        title={post.story} // Optional title
                        pinColor="orange" // Set the marker color to orange
                    >
                        <Callout
                            onPress={() => navigation.navigate('PostDetailsScreen', { postId: post.id })}
                        >
                            <View style={styles.calloutView}>
                                <Text style={styles.calloutText}>{post.story}</Text>
                                <Text style={styles.linkText}>View Details</Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}
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
    },
    calloutView: {
        flexDirection: 'column',
        alignItems: 'center',
        padding: 5,
    },
    calloutText: {
        fontSize: 14,
        marginBottom: 5,
    },
    linkText: {
        color: 'blue',
        textDecorationLine: 'underline',
        fontSize: 14,
    },
});