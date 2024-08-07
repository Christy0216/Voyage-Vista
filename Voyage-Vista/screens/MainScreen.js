import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { db } from '../firebase/firebaseSetUp';
import { collection, getDocs } from 'firebase/firestore';
import PostItem from '../components/PostItem';
import { useTheme } from '../context/ThemeContext';

const MainScreen = () => {
    const [posts, setPosts] = useState([]);
    const { theme } = useTheme();

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
        <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <PostItem post={item} />}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});

export default MainScreen;
