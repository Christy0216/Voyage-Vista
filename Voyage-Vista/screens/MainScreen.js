// MainScreen.js
import React, { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { db } from '../firebase/firebaseSetUp';
import { collection, getDocs } from 'firebase/firestore';
import PostItem from '../components/PostItem';  // Import the reusable component

const MainScreen = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            const postsCollectionRef = collection(db, 'posts');
            const querySnapshot = await getDocs(postsCollectionRef);
            const postsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setPosts(postsList);
        };

        fetchPosts();
    }, []);

    return (
        <View>
            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <PostItem post={item} />}
            />
        </View>
    );
};

export default MainScreen;
