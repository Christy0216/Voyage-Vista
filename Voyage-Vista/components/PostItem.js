import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const PostItem = ({ post }) => {
    const navigation = useNavigation();
    const { theme } = useTheme();

    return (
        <TouchableOpacity onPress={() => navigation.navigate('PostDetailsScreen', { postId: post.id })}>
            <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
                <Image source={{ uri: post.profilePicture }} style={styles.image} />
                <Text style={[styles.title, { color: theme.textColor }]}>{post.title}</Text>
                <View style={styles.photosContainer}>
                    {post.photos && post.photos.slice(0, 4).map((photo, index) => (
                        <Image key={index} source={{ uri: photo.url }} style={styles.photo} />
                    ))}
                </View>
                <Text style={{ color: theme.textColor }}>Favorites: {post.favoritesCount}</Text>
                <Text style={{ color: theme.textColor }}>Likes: {post.likesCount}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 5,
    },
    photosContainer: {
        flexDirection: 'row',
        marginTop: 5,
    },
    photo: {
        width: 50,
        height: 50,
        marginRight: 5,
    }
});

export default PostItem;
