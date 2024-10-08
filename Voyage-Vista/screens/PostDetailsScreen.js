import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useTheme } from "../context/ThemeContext"; // Import the theme context
import { defaultPicture } from "../reusables/objects"; // Import the default picture
import {
  deletePost,
  updatePost,
  getPostWithUserDetails,
  incrementLikesCount,
  decrementLikesCount,
  incrementFavoritesCount,
  decrementFavoritesCount,
  addPostComment,
  removePostComment,
} from "../firebase/firebasePostHelper";
import {
  getUser,
  addUserFavorite,
  addUserLike,
  removeUserFavorite,
  removeUserLike,
} from "../firebase/firebaseUserHelper";
import { auth, db } from "../firebase/firebaseSetUp";
import {
  updateDoc,
  arrayUnion,
  arrayRemove,
  doc,
  collection,
  getDocs,
} from "firebase/firestore";
import ThemedButton from "../components/ThemedButton";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { themes } from "../styles/themes";

const PostDetailsScreen = ({ route, navigation }) => {
  const { postId } = route.params;
  const [postDetails, setPostDetails] = useState(null);
  const postDetailsRef = useRef(postDetails); // Create a ref to store the latest postDetails
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const currentUser = auth.currentUser;
  const [userDoc, setUserDoc] = useState(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [likeButtonText, setLikeButtonText] = useState("Like");
  const [favoriteButtonText, setFavoriteButtonText] = useState("Favorite");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const details = await getPostWithUserDetails(postId);
        if (details) {
          setPostDetails(details.post);
          postDetailsRef.current = details.post; // Update the ref with the latest postDetails
          const uid = auth.currentUser.uid;
          const user = await getUser(uid);
          setUserDoc(user);
          setLiked(details.post.likedBy?.includes(currentUser.uid));
          setLikeButtonText(liked ? "Unlike" : "Like");
          setFavorited(details.post.favoritedBy?.includes(currentUser.uid));
          setFavoriteButtonText(favorited ? "Unfavorite" : "Favorite");
          fetchComments(postId);

          navigation.setOptions({
            headerRight: () =>
              details.post.uid === auth.currentUser.uid ? (
                <TouchableOpacity
                  onPress={handleDelete}
                  style={{ marginRight: 15 }}
                >
                  <FontAwesome name="trash" size={30} color={theme.buttonColor} />
                </TouchableOpacity>
              ) : null,
          });
        }
      } catch (error) {
        console.error("Error fetching post details: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [postId, navigation]);

  const fetchComments = async (postId) => {
    try{
    const commentsRef = collection(db, "posts", postId, "comments");
    const commentsSnapshot = await getDocs(commentsRef);
    const commentsList = commentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setComments(commentsList);}
    catch (error) {
      console.log('Error fetching comments: ', error);
    }
  };

  const handleAddComment = async () => {
    if (comment.trim()) {
      console.log("in comment: ", currentUser)
      const newComment = {
        userId: currentUser.uid,
        content: comment.trim(),
        timestamp: new Date(),
      };
      await addPostComment(postId, newComment);
      fetchComments(postId);
      setComment("");
    }
  };

  const toggleLike = async () => {
    const newLikedState = !liked;
    setLiked(newLikedState);
    setPostDetails((prevDetails) => ({
      ...prevDetails,
      likesCount: newLikedState
        ? prevDetails.likesCount + 1
        : prevDetails.likesCount - 1,
      likedBy: newLikedState
        ? [...prevDetails.likedBy, auth.currentUser.uid]
        : prevDetails.likedBy.filter((uid) => uid !== auth.currentUser.uid),
    }));

    if (newLikedState) {
      await addUserLike(userDoc.id, postId);
      await incrementLikesCount(postId);
      await updateDoc(doc(db, "posts", postId), {
        likedBy: arrayUnion(auth.currentUser.uid),
      });
      setLikeButtonText("Unlike");
    } else {
      await removeUserLike(userDoc.id, postId);
      await decrementLikesCount(postId);
      await updateDoc(doc(db, "posts", postId), {
        likedBy: arrayRemove(auth.currentUser.uid),
      });
      setLikeButtonText("Like");
    }
  };

  const toggleFavorite = async () => {
    const newFavoritedState = !favorited;
    console.log("postDetails in toggleFavorite", postDetails);
    setFavorited(newFavoritedState);
    setPostDetails((prevDetails) => ({
      ...prevDetails,
      favoritesCount: newFavoritedState
        ? prevDetails.favoritesCount + 1
        : prevDetails.favoritesCount - 1,
      favoritedBy: newFavoritedState
        ? [...prevDetails.favoritedBy, auth.currentUser.uid]
        : prevDetails.favoritedBy.filter((uid) => uid !== auth.currentUser.uid),
    }));

    if (newFavoritedState) {
      await addUserFavorite(userDoc.id, postId);
      await incrementFavoritesCount(postId);
      await updateDoc(doc(db, "posts", postId), {
        favoritedBy: arrayUnion(auth.currentUser.uid),
      });
      setFavoriteButtonText("Unfavorite");
    } else {
      await removeUserFavorite(userDoc.id, postId);
      await decrementFavoritesCount(postId);
      await updateDoc(doc(db, "posts", postId), {
        favoritedBy: arrayRemove(auth.currentUser.uid),
      });
      setFavoriteButtonText("Favorite");
    }
  };

  const handleDelete = async () => {
    console.log("postDetails in handleDelete", postDetailsRef.current);
    if (currentUser && postDetailsRef.current.uid === currentUser.uid) {
      Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
        { text: "Cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deletePost(postId);
              navigation.goBack();
            } catch (error) {
              console.error("Error deleting post: ", error);
            }
          },
        },
      ]);
    }
  };

  const handleLongPressComment = (comment) => {
    if (
      currentUser.uid === comment.userId ||
      currentUser.uid === postDetails.uid
    ) {
      Alert.alert(
        "Delete Comment?",
        "Are you sure you want to delete this comment?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            onPress: async () => {
              await removePostComment(postId, comment.id);
              fetchComments(postId);
            },
          },
        ]
      );
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.backgroundColor },
        ]}
      >
        <ActivityIndicator size="large" color={theme.textColor} />
        <Text style={{ color: theme.textColor }}>Loading...</Text>
      </View>
    );
  }

  if (!postDetails) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.backgroundColor },
        ]}
      >
        <Text style={{ color: theme.textColor }}>Post not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} 
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        style={[styles.container, { backgroundColor: theme.backgroundColor }]}
      >
        <View style={styles.userContainer}>
          <Text style={[styles.userName, { color: theme.textColor }]}>
            {postDetails.userName}
          </Text>
          <Image
            source={{ uri: postDetails.userProfilePicture || defaultPicture }}
            style={styles.userImage}
          />
        </View>
        {postDetails.story && (
          <Text style={[styles.story, { color: theme.textColor }]}>
            {postDetails.story}
          </Text>
        )}
        <ScrollView
          horizontal={false}
          contentContainerStyle={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "left",
          }}
        >
          {postDetails.images &&
            postDetails.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.postImage}
              />
            ))}
        </ScrollView>
        <View style={styles.buttonsContainer}>
          <ThemedButton title={favoriteButtonText} onPress={toggleFavorite} />
          <ThemedButton title={likeButtonText} onPress={toggleLike} />
        </View>
        <View style={styles.commentsContainer}>
          <Text style={[styles.label, { color: theme.textColor }]}>
            Comments:
          </Text>
          {comments.map((comment) => (
            <TouchableOpacity
              key={comment.id}
              onLongPress={() => handleLongPressComment(comment)}
              style={styles.comment}
            >
              <Text style={[styles.commentText, { color: theme.textColor }]}>
                {comment.content}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View
        style={[
          styles.commentInputContainer,
          { backgroundColor: theme.backgroundColor },
        ]}
      >
        <TextInput
          style={[
            styles.commentInput,
            { backgroundColor: theme.inputBackground, color: theme.textColor },
          ]}
          value={comment}
          onChangeText={setComment}
          placeholder="Add a comment..."
          placeholderTextColor={theme.placeholderTextColor}
        />
        <ThemedButton title="Add" onPress={handleAddComment} />
      </View>
      <View style={{ padding: 10, backgroundColor: theme.backgroundColor }} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  userContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  userImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  story: {
    fontSize: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginVertical: 8,
  },
  postImage: {
    width: "30%",
    height: 200,
    resizeMode: "cover",
    marginVertical: 10,
    marginRight: 2,
    marginLeft: 2,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  buttonActive: {
    backgroundColor: "darkmagenta",
  },
  buttonText: {
    fontSize: 16,
  },
  buttonTextActive: {
    color: "#fff",
  },
  commentsContainer: {
    marginTop: 20,
    paddingBottom: 100,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
  },
  comment: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  commentText: {
    fontSize: 14,
  },
  commentInputContainer: {
    flexDirection: "row",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  commentInput: {
    flex: 1,
    paddingLeft: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  addButton: {
    padding: 10,
    backgroundColor: "darkmagenta",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default PostDetailsScreen;