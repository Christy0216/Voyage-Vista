import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Modal, Text, Image, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { fetchPostsInRegion } from '../firebase/firebasePostHelper';

// Function to convert Firebase timestamp to a Date object
function convertFirebaseTimestamp(timestamp) {
    if (timestamp && timestamp.seconds) {
        return new Date(timestamp.seconds * 1000); // Convert to milliseconds
    }
    return null;
}

// Function to format the Date object
function formatDate(date) {
    if (!date) return 'Invalid Date';
    return date.toLocaleString(); // Customize this if you need a specific format
}

export const Map = ({ location }) => {
    const [userLocation, setUserLocation] = useState(null);
    const [visiblePosts, setVisiblePosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
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
            const adjustedPosts = applyOffsetToCloseMarkers(posts);
            setVisiblePosts(adjustedPosts);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const handleMarkerPress = (post) => {
        setSelectedPost(post);
        setModalVisible(true);
    };

    useEffect(() => {
        centerMapOnUser();
    }, []);

    useEffect(() => {
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

    // Function to apply a slight offset to markers that are very close to each other
    const applyOffsetToCloseMarkers = (posts) => {
        const offset = 0.0002; // Offset value (adjust based on zoom level)
        return posts.map((post, index, array) => {
            const similarLocationPosts = array.filter(
                (p) =>
                    p.location.latitude === post.location.latitude &&
                    p.location.longitude === post.location.longitude
            );

            if (similarLocationPosts.length > 1) {
                const angle = (index / similarLocationPosts.length) * 2 * Math.PI;
                return {
                    ...post,
                    location: {
                        latitude: post.location.latitude + offset * Math.cos(angle),
                        longitude: post.location.longitude + offset * Math.sin(angle),
                    },
                };
            }
            return post;
        });
    };

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
                        onPress={() => handleMarkerPress(post)}
                    />
                ))}
            </MapView>

            {/* Modal for displaying post details */}
            {selectedPost && (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Story: {selectedPost.story}</Text>
                        <Text style={styles.modalText}>Address: {selectedPost.address}</Text>
                        <Text style={styles.modalText}>Destination: {selectedPost.destination}</Text>
                        <Text style={styles.modalText}>
                            Created At: {formatDate(convertFirebaseTimestamp(selectedPost.createdAt))}
                        </Text>
                        <Text style={styles.modalText}>Favorites: {selectedPost.favoritesCount}</Text>
                        <Text style={styles.modalText}>Likes: {selectedPost.likesCount}</Text>
                        
                        {selectedPost.images && selectedPost.images.length > 0 && (
                            <Image
                                source={{ uri: selectedPost.images[0] }}
                                style={styles.image}
                            />
                        )}
                        <Button title="Close" onPress={() => setModalVisible(false)} />
                    </View>
                </Modal>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
    image: {
        width: 180,
        height: 120,
        marginVertical: 5,
        borderRadius: 10,
        resizeMode: 'cover',
        borderWidth: 1,
        borderColor: 'black',
    },
});

export default Map;
