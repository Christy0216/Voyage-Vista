import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { updatePost, getPostWithUserDetails, incrementLikesCount, decrementLikesCount, incrementFavoritesCount, decrementFavoritesCount } from '../firebase/firebasePostHelper';  // Update the import path as needed
import { useTheme } from '../context/ThemeContext'; // Import the theme context
import { defaultPicture } from '../reusables/objects'; // Import the default picture
import { getUser, addUserFavorite, addUserLike, removeUserFavorite, removeUserLike } from '../firebase/firebaseUserHelper';
import { auth, db } from '../firebase/firebaseSetUp'; // Import Firebase auth and db
import { updateDoc, arrayUnion, arrayRemove, doc } from 'firebase/firestore';

const PostDetailsScreen = ({ route }) => {
  const { postId } = route.params;
  const [postDetails, setPostDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme(); // Use the theme from the context
  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [userDoc, setUserDoc] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      const details = await getPostWithUserDetails(postId);
      if (details) {
        setPostDetails(details.post);
        const uid = auth.currentUser.uid;
        const user = await getUser(uid);
        setUserDoc(user);
        setLiked(details.post.likedBy.includes(uid));
        setFavorited(details.post.favoritedBy.includes(uid));
      }
      setLoading(false);
    };
    fetchDetails();
  }, [postId]);

  const toggleLike = async () => {
    const newLikedState = !liked;
    setLiked(newLikedState);
    setPostDetails(prevDetails => ({
      ...prevDetails,
      likesCount: newLikedState ? prevDetails.likesCount + 1 : prevDetails.likesCount - 1,
      likedBy: newLikedState ? [...prevDetails.likedBy, auth.currentUser.uid] : prevDetails.likedBy.filter(uid => uid !== auth.currentUser.uid)
    }));

    if (newLikedState) {
      await addUserLike(userDoc.id, postId);
      await incrementLikesCount(postId);
      await updateDoc(doc(db, 'posts', postId), { likedBy: arrayUnion(auth.currentUser.uid) });
    } else {
      await removeUserLike(userDoc.id, postId);
      await decrementLikesCount(postId);
      await updateDoc(doc(db, 'posts', postId), { likedBy: arrayRemove(auth.currentUser.uid) });
    }
  };

  const toggleFavorite = async () => {
    const newFavoritedState = !favorited;
    setFavorited(newFavoritedState);
    setPostDetails(prevDetails => ({
      ...prevDetails,
      favoritesCount: newFavoritedState ? prevDetails.favoritesCount + 1 : prevDetails.favoritesCount - 1,
      favoritedBy: newFavoritedState ? [...prevDetails.favoritedBy, auth.currentUser.uid] : prevDetails.favoritedBy.filter(uid => uid !== auth.currentUser.uid)
    }));

    if (newFavoritedState) {
      await addUserFavorite(userDoc.id, postId);
      await incrementFavoritesCount(postId);
      await updateDoc(doc(db, 'posts', postId), { favoritedBy: arrayUnion(auth.currentUser.uid) });
    } else {
      await removeUserFavorite(userDoc.id, postId);
      await decrementFavoritesCount(postId);
      await updateDoc(doc(db, 'posts', postId), { favoritedBy: arrayRemove(auth.currentUser.uid) });
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundColor }]}>
        <ActivityIndicator size="large" color={theme.textColor} />
        <Text style={{ color: theme.textColor }}>Loading...</Text>
      </View>
    );
  }

  if (!postDetails) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundColor }]}>
        <Text style={{ color: theme.textColor }}>Post not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.userContainer}>
        <Text style={[styles.userName, { color: theme.textColor }]}>{postDetails.userName}</Text>
        <Image source={{ uri: postDetails.userProfilePicture || defaultPicture }} style={styles.userImage} />
      </View>
      {postDetails.story && <Text style={[styles.story, { color: theme.textColor }]}>{postDetails.story}</Text>}
      <Text style={[styles.text, { color: theme.textColor }]}>Address Type: {postDetails.addressType}</Text>
      <Text style={[styles.text, { color: theme.textColor }]}>Likes: {postDetails.likesCount || 0}</Text>
      <Text style={[styles.text, { color: theme.textColor }]}>Comments: {postDetails.commentsCount || 0}</Text>
      <Text style={[styles.text, { color: theme.textColor }]}>Favorites: {postDetails.favoritesCount || 0}</Text>
      {postDetails.photos && postDetails.photos.length > 0 && postDetails.photos.map((photo, index) => (
        <Image key={index} source={{ uri: photo.url }} style={styles.postImage} />
      ))}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={toggleLike} style={[styles.button, liked && styles.buttonActive]}>
          <Text style={[styles.buttonText, liked && styles.buttonTextActive]}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFavorite} style={[styles.button, favorited && styles.buttonActive]}>
          <Text style={[styles.buttonText, favorited && styles.buttonTextActive]}>Favorite</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  story: {
    fontSize: 16,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginVertical: 8,
  },
  postImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginVertical: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  buttonActive: {
    backgroundColor: 'darkmagenta',
  },
  buttonText: {
    fontSize: 16,
  },
  buttonTextActive: {
    color: '#fff',
  },
});

export default PostDetailsScreen;
