import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useTheme } from "../context/ThemeContext";


const PostItem = ({ post }) => {
    const navigation = useNavigation();
    const { theme } = useTheme();

    return (
        <TouchableOpacity  onPress={() => navigation.navigate('PostDetailsScreen', { postId: post.id })}>
            <View style={[styles.container, {backgroundColor: theme.postItemBackgroundColor}]}>
                <View style={styles.userContainer}>
                    {post.userProfilePicture && (
                        <Image
                            source={{ uri: post.userProfilePicture }}
                            style={styles.profilePicture}
                        />
                    )}
                    <Text style={{color: theme.textColor}}>{post.userName}</Text>
                </View>
                <Text style={{color: theme.textColor}}>{post.story}</Text>
                <View style={styles.countsContainer}>
                    <Text style={{color: theme.textColor}}>Favorites: {post.favoritesCount || 0}</Text>
                    <Text style={{color: theme.textColor}}>Likes: {post.likesCount || 0}</Text>
                </View>
                {post.images && post.images.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosContainer}>
                        {post.images.slice(0, 4).map((image, index) => (
                            <Image
                                key={index}
                                source={{ uri: image }}  // Using the image URLs stored in post.images
                                style={styles.photo}
                            />
                        ))}
                    </ScrollView>
                )}
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
        width: 100,
        height: 100,
        marginRight: 10,
    },
    photosContainer: {
        flexDirection: "row",
        marginBottom: 10,
    },
});

export default PostItem;
