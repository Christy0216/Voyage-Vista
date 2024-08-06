import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity } from 'react-native';
import { db } from '../firebase/firebaseSetUp';
import { doc, getDoc, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const FavoritesScreen = () => {
    const [favorites, setFavorites] = useState([]);
    const navigation = useNavigation();
    const userId = 'your_user_id_here'; // This should be dynamically set based on the logged-in user

    useEffect(() => {
        const fetchFavorites = async () => {
            // Fetch the user's document to get the array of favorite post IDs
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists() && userDoc.data().favorites) {
                const favoritePostIds = userDoc.data().favorites;
                const posts = [];

                // Fetch each post by ID
                for (const postId of favoritePostIds) {
                    const postRef = doc(db, 'posts', postId);
                    const postDoc = await getDoc(postRef);
                    if (postDoc.exists()) {
                        posts.push({ id: postDoc.id, ...postDoc.data() });
                    }
                }

                setFavorites(posts);
            } else {
                console.log('No favorites found or user does not exist');
            }
        };

        fetchFavorites();
    }, []);

    return (
        <View>
            <FlatList
                data={favorites}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => navigation.navigate('PostDetailsScreen', { postId: item.id })}>
                        <View>
                            <Text>{item.title}</Text>
                            <View>
                                {item.photos && item.photos.slice(0, 4).map((photo, index) => (
                                    <Image key={index} source={{ uri: photo.url }} style={{ width: 100, height: 100 }} />
                                ))}
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

export default FavoritesScreen;
