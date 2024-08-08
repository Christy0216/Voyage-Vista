import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';

const PostItem = ({ post }) => {
    const navigation = useNavigation();

    return (
        <TouchableOpacity onPress={() => navigation.navigate('PostDetailsScreen', { postId: post.id })}>
            <View style={styles.container}>
                <View style={styles.userContainer}>
                    {post.userProfilePicture && (
                        <Image
                            source={{ uri: post.userProfilePicture }}
                            style={styles.profilePicture}
                        />
                    )}
                    <Text style={styles.userName}>{post.userName}</Text>
                </View>
                <Text style={styles.story}>{post.story}</Text>
                <View style={styles.countsContainer}>
                    <Text style={styles.count}>Favorites: {post.favoritesCount || 0}</Text>
                    <Text style={styles.count}>Likes: {post.likesCount || 0}</Text>
                </View>
                <View style={styles.photosContainer}>
                    {post.photos && post.photos.slice(0, 4).map((photo, index) => (
                        <Image
                            key={index}
                            source={{ uri: photo.url }}
                            style={styles.photo}
                        />
                    ))}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: "white",
        marginBottom: 16,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    profilePicture: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 8,
    },
    userName: {
        fontWeight: "bold",
    },
    story: {
        marginBottom: 8,
    },
    countsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    count: {
        fontWeight: "bold",
    },
    photo: {
        width: "100%",
        height: 200,
        marginBottom: 8,
    },
    photosContainer: {
        flexDirection: "row",
        marginTop: 5,
    },
});

export default PostItem;
