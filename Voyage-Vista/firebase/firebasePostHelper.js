import { db } from './firebaseSetUp';
import { collection, doc, addDoc, getDoc, updateDoc, deleteDoc, getDocs, query, writeBatch, increment, arrayUnion, arrayRemove, limit } from "firebase/firestore";
import { addUserPost, removeUserPost } from './firebaseUserHelper';

// Helper function to delete documents in a subcollection in batches
const deleteSubcollectionInBatches = async (postId, subcollectionName, batchSize = 500) => {
  const subcollectionRef = collection(db, 'posts', postId, subcollectionName);
  
  while (true) {
    const subcollectionSnapshot = await getDocs(query(subcollectionRef, limit(batchSize)));
    
    if (subcollectionSnapshot.size === 0) {
      break;
    }

    const batch = writeBatch(db);
    subcollectionSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }
};

// Create a new post
export const createPost = async (userId, post) => {
  try {
    const postRef = await addDoc(collection(db, 'posts'), post);
    await addUserPost(userId, postRef.id);
    console.log('Post created successfully with ID:', postRef.id);
    return postRef.id;
  } catch (error) {
    console.log('Error creating post: ', error);
  }
};

// Fetch a post along with the user details
export const getPostWithUserDetails = async (postId) => {
    try {
      const postDocRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postDocRef);
  
      if (postDoc.exists()) {
        const postData = postDoc.data();
        const userDocRef = doc(db, 'users', postData.userId);  // Assuming the post data includes userId
        const userDoc = await getDoc(userDocRef);
  
        if (userDoc.exists()) {
          const userData = userDoc.data();
          return {
            post: {
              id: postDoc.id,
              ...postData,
              userName: userData.name,  // Assuming the user's name is stored under 'name'
              userProfilePicture: userData.profilePicture  // Assuming the user's profile picture URL is stored under 'profilePicture'
            }
          };
        } else {
          console.log('User not found for the post.');
          return null;
        }
      } else {
        console.log('No such post found!');
        return null;
      }
    } catch (error) {
      console.log('Error getting post with user details: ', error);
      return null;
    }
  };
  
// Update a post
export const updatePost = async (postId, updatedFields) => {
  try {
    await updateDoc(doc(db, 'posts', postId), updatedFields);
    console.log('Post updated successfully');
  } catch (error) {
    console.log('Error updating post: ', error);
  }
};

// Delete a post
export const deletePost = async (userId, postId) => {
  try {
    // Delete subcollections first
    await deleteSubcollectionInBatches(postId, 'photos');
    await deleteSubcollectionInBatches(postId, 'comments');

    // Delete the post document
    await deleteDoc(doc(db, 'posts', postId));

    // Remove the post reference from the user document
    await removeUserPost(userId, postId);
    
    console.log('Post deleted successfully');
  } catch (error) {
    console.log('Error deleting post: ', error);
  }
};

// Add a photo to a post
export const addPostPhoto = async (postId, photo) => {
  try {
    await addDoc(collection(db, 'posts', postId, 'photos'), photo);
    console.log('Photo added to post successfully');
  } catch (error) {
    console.log('Error adding photo to post: ', error);
  }
};

// Remove a photo from a post
export const removePostPhoto = async (postId, photoId) => {
  try {
    await deleteDoc(doc(db, 'posts', postId, 'photos', photoId));
    console.log('Photo removed from post successfully');
  } catch (error) {
    console.log('Error removing photo from post: ', error);
  }
};

// Add a comment to a post
export const addPostComment = async (postId, comment) => {
  try {
    const commentRef = await addDoc(collection(db, 'posts', postId, 'comments'), comment);
    console.log('Comment added to post successfully with ID:', commentRef.id);
    return commentRef.id;
  } catch (error) {
    console.log('Error adding comment to post: ', error);
  }
};

// Remove a comment from a post
export const removePostComment = async (postId, commentId) => {
  try {
    await deleteDoc(doc(db, 'posts', postId, 'comments', commentId));
    console.log('Comment removed from post successfully');
  } catch (error) {
    console.log('Error removing comment from post: ', error);
  }
};

// Increment favorites count
export const incrementFavoritesCount = async (postId) => {
  try {
    await updateDoc(doc(db, 'posts', postId), {
      favoritesCount: increment(1)
    });
    console.log('Favorites count incremented successfully');
  } catch (error) {
    console.log('Error incrementing favorites count: ', error);
  }
};

// Increment likes count
export const incrementLikesCount = async (postId) => {
  try {
    await updateDoc(doc(db, 'posts', postId), {
      likesCount: increment(1)
    });
    console.log('Likes count incremented successfully');
  } catch (error) {
    console.log('Error incrementing likes count: ', error);
  }
};

// Decrement favorites count
export const decrementFavoritesCount = async (postId) => {
  try {
    await updateDoc(doc(db, 'posts', postId), {
      favoritesCount: increment(-1)
    });
    console.log('Favorites count decremented successfully');
  } catch (error) {
    console.log('Error decrementing favorites count: ', error);
  }
};

// Decrement likes count
export const decrementLikesCount = async (postId) => {
  try {
    await updateDoc(doc(db, 'posts', postId), {
      likesCount: increment(-1)
    });
    console.log('Likes count decremented successfully');
  } catch (error) {
    console.log('Error decrementing likes count: ', error);
  }
};
