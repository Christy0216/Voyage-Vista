import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { fetchPostsInRegion } from '../firebase/firebasePostHelper';

export const Map = ({ location }) => {
    const [userLocation, setUserLocation] = useState(null);
    const [visiblePosts, setVisiblePosts] = useState([]);
    const mapRef = useRef(null);
    const navigation = useNavigation();

    const centerMapOnUser = async () => {
        try {
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

            setUserLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude
            });

            if (mapRef.current) {
                mapRef.current.animateToRegion(newRegion, 1000);
            }
        } catch (error) {
            console.error('Error getting user location:', error);
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
        // Automatically center the map on the user's location when the component mounts
        centerMapOnUser();
    }, []);

    useEffect(() => {
        // Update the map region when the location prop changes
        if (location && mapRef.current) {
            const newRegion = {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            };
            mapRef.current.animateToRegion(newRegion, 1000);
        }
    }, [location]);

    return (
        <View style={{ flex: 1 }}>
            <MapView
                ref={mapRef}
                style={{ flex: 1 }}
                initialRegion={{
                    latitude: location ? location.latitude : 37.78825,
                    longitude: location ? location.longitude : -122.4324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                onRegionChangeComplete={onRegionChangeComplete}
            >
                {userLocation && <Marker coordinate={userLocation} />}
                {visiblePosts.map((post, index) => (
                    <Marker
                        key={index}
                        coordinate={{
                            latitude: post.location.latitude,
                            longitude: post.location.longitude,
                        }}
                        title={post.story}
                        pinColor="orange"
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
