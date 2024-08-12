import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Image } from 'react-native';
import { db } from '../firebase/firebaseSetUp';
import { collection, onSnapshot } from 'firebase/firestore';
import PostItem from '../components/PostItem';
import { useTheme } from '../context/ThemeContext';
import { getUser } from '../firebase/firebaseUserHelper';
import { auth } from '../firebase/firebaseSetUp';
import { defaultPicture } from '../reusables/objects';

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
const unsubscribe = onSnapshot(postsCollectionRef, async (snapshot) => {
    const postsList = await Promise.all(snapshot.docs.map(async doc => {
        const postData = doc.data();
        const userData = await getUser(postData.uid);

        // Directly use images if available
        const photos = postData.images || [];

        return {
            id: doc.id,
            ...postData,
            userName: userData ? userData.name : 'Unknown',
            userProfilePicture: userData ? userData.profilePicture || defaultPicture : defaultPicture,
            photos: photos.map(url => ({ url })), // Map each URL to an object if needed
        };
    }));
    setPosts(postsList);
});

return () => unsubscribe();
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
        alignItems: 'flex-start',
        margin: 20,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
});

export default MainScreen;
