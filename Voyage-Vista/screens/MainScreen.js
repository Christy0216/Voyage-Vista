import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Image } from 'react-native';
import { db } from '../firebase/firebaseSetUp';
import { collection, onSnapshot } from 'firebase/firestore';
import PostItem from '../components/PostItem';
import { useTheme } from '../context/ThemeContext';
import { getUser } from '../firebase/firebaseUserHelper';
import { auth } from '../firebase/firebaseSetUp';
import {defaultPicture} from '../reusables/objects';

const MainScreen = () => {
    const [posts, setPosts] = useState([]);
    const [profilePhoto, setProfilePhoto] = useState('');
    const { theme } = useTheme();

    useEffect(() => {
        const fetchProfilePhoto = async () => {
            if (auth.currentUser) {
                const userData = await getUser(auth.currentUser.uid);
                if (userData) {
                    setProfilePhoto(userData.profilePicture || defaultPicture);
                }
            }
        };

        fetchProfilePhoto();

        const postsCollectionRef = collection(db, 'posts');
        const unsubscribe = onSnapshot(postsCollectionRef, (snapshot) => {
            const postsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setPosts(postsList);
        });

        return () => unsubscribe(); // Cleanup listener on unmount
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            {profilePhoto ? (
                <View style={styles.profileContainer}>
                    <Image source={{ uri: profilePhoto }} style={styles.profileImage} />
                </View>
            ) : null}
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
    },
    profileContainer: {
        alignItems: 'center',
        margin: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
});

export default MainScreen;