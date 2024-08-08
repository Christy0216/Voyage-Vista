import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import { db } from '../firebase/firebaseSetUp';
import { doc, getDoc } from 'firebase/firestore';
import PostItem from '../components/PostItem';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { auth } from '../firebase/firebaseSetUp';
import { getUser } from '../firebase/firebaseUserHelper';

const FavoritesScreen = () => {
    const [favorites, setFavorites] = useState([]);
    const navigation = useNavigation();
    const { theme } = useTheme();
    const userId = auth.currentUser.uid; // Use the currently logged-in user's ID

    useEffect(() => {
        const fetchFavorites = async () => {
            const userDocRef = await getUser(userId);

            if (userDocRef) {
                const favoritePostIds = userDocRef.favorites || [];
                console.log('Favorite post IDs:', favoritePostIds);
                const posts = await Promise.all(favoritePostIds.map(async (postId) => {
                    const postRef = doc(db, 'posts', postId);
                    const postSnap = await getDoc(postRef);
                    return postSnap.exists() ? { id: postSnap.id, ...postSnap.data() } : null;
                }));

                // Filter out any null entries if a post was not found
                setFavorites(posts.filter(post => post !== null));
            } else {
                console.log('No user document found or no favorites listed');
            }
        };

        fetchFavorites();
    }, []);

    return (
        <View style={{ backgroundColor: theme.backgroundColor, flex: 1 }}>
            <FlatList
                data={favorites}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => navigation.navigate('PostDetailsScreen', { postId: item.id })}>
                        <PostItem post={item} theme={theme} />
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

export default FavoritesScreen;
