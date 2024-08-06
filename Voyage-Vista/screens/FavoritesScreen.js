import React, { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { db } from '../firebase/firebaseSetUp';
import { doc, getDoc } from 'firebase/firestore';
import PostItem from '../components/PostItem';  // Ensure this path is correct
import { useNavigation } from '@react-navigation/native';

const FavoritesScreen = () => {
    const [favorites, setFavorites] = useState([]);
    const navigation = useNavigation();
    const userId = 'your_user_id_here';  // Dynamically set this based on logged-in user

    useEffect(() => {
        const fetchFavorites = async () => {
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists() && userDoc.data().favorites) {
                const favoritePostIds = userDoc.data().favorites;
                const posts = [];

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
                renderItem={({ item }) => <PostItem post={item} />}
            />
        </View>
    );
};

export default FavoritesScreen;
