import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PostItem = ({ post }) => {
    const navigation = useNavigation();

    return (
        <TouchableOpacity onPress={() => navigation.navigate('PostDetailsScreen', { postId: post.id })}>
            <View>
                <Image source={{ uri: post.profilePicture }} style={{ width: 100, height: 100 }} />
                <Text>{post.title}</Text>
                <View>
                    {post.photos && post.photos.slice(0, 4).map((photo, index) => (
                        <Image key={index} source={{ uri: photo.url }} style={{ width: 100, height: 100 }} />
                    ))}
                </View>
                <Text>Favorites: {post.favoritesCount}</Text>
                <Text>Likes: {post.likesCount}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default PostItem;
