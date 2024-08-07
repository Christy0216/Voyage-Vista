import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { getPostWithUserDetails } from '../firebase/firebasePostHelper';  // Update the import path as needed
import { ThemeContext } from '../context/ThemeContext'; // Import the theme context

const PostDetailsScreen = ({ route }) => {
  const { postId } = route.params;
  const [postDetails, setPostDetails] = useState(null);
  const { theme } = useContext(ThemeContext); // Use the theme from the context

  useEffect(() => {
    const fetchDetails = async () => {
      const details = await getPostWithUserDetails(postId);
      if (details) {
        setPostDetails(details.post);
      }
    };
    fetchDetails();
  }, [postId]);

  if (!postDetails) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Image source={{ uri: postDetails.userProfilePicture }} style={styles.userImage} />
      <Text style={[styles.userName, { color: theme.textColor }]}>{postDetails.userName}</Text>
      <Text style={[styles.title, { color: theme.textColor }]}>{postDetails.title}</Text>
      <Text style={[styles.text, { color: theme.textColor }]}>{postDetails.text}</Text>
      <Text style={[styles.text, { color: theme.textColor }]}>Likes: {postDetails.likesCount}</Text>
      <Text style={[styles.text, { color: theme.textColor }]}>Comments: {postDetails.commentsCount}</Text>
      <Text style={[styles.text, { color: theme.textColor }]}>Favorites: {postDetails.favoritesCount}</Text>
      {postDetails.photos.map((photo, index) => (
        <Image key={index} source={{ uri: photo.url }} style={styles.postImage} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10
  },
  userImage: {
    width: 100,
    height: 100,
    borderRadius: 50
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  text: {
    fontSize: 16,
    marginVertical: 8
  },
  postImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginVertical: 10
  }
});

export default PostDetailsScreen;
