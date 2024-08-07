import { db } from './firebaseSetUp';
import { collection, doc, addDoc, getDoc, updateDoc, deleteDoc, getDocs, query, writeBatch, arrayUnion, arrayRemove, limit, onSnapshot, where } from "firebase/firestore";

// Helper function to delete documents in a subcollection in batches
const deleteSubcollectionInBatches = async (userId, subcollectionName, batchSize = 500) => {
  const subcollectionRef = collection(db, 'users', userId, subcollectionName);
  
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

// Delete all subcollections of a user document
export const deleteUserSubcollections = async (userId) => {
  try {
    await deleteSubcollectionInBatches(userId, 'posts');
    await deleteSubcollectionInBatches(userId, 'favorites');
    await deleteSubcollectionInBatches(userId, 'likes');
    await deleteSubcollectionInBatches(userId, 'comments');
    console.log('All subcollections deleted successfully for user:', userId);
  } catch (error) {
    console.log('Error deleting subcollections: ', error);
  }
};

// Delete a user profile and their subcollections
export const deleteUser = async (userId) => {
  try {
    // Delete all subcollections first
    await deleteUserSubcollections(userId);

    // Delete the user document
    await deleteDoc(doc(db, 'users', userId));
    console.log('User deleted successfully');
  } catch (error) {
    console.log('Error deleting user: ', error);
  }
};

// Create a new user
export const createUser = async (userData) => {
  try {
    const userRef = await addDoc(collection(db, 'users'), userData);
    console.log('User created successfully with ID:', userRef.id);
    return userRef.id;
  } catch (error) {
    console.log('Error creating user: ', error);
  }
};

// Read a user profile
export const getUser = async (userId) => {
  try {
    const q = query(collection(db, 'users'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() };
    } else {
      console.log('No such user!');
      return null;
    }
  } catch (error) {
    console.log('Error getting user: ', error);
    return null;
  }
};

// Update a user profile
export const updateUser = async (docId, updatedFields) => {
  try {
    await updateDoc(doc(db, 'users', docId), updatedFields);
    console.log('User updated successfully');
  } catch (error) {
    console.log('Error updating user: ', error);
  }
};

// Add a post reference to a user
export const addUserPost = async (userId, postId) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      posts: arrayUnion(postId)
    });
    console.log('Post added to user successfully');
  } catch (error) {
    console.log('Error adding post to user: ', error);
  }
};

// Remove a post reference from a user
export const removeUserPost = async (userId, postId) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      posts: arrayRemove(postId)
    });
    console.log('Post removed from user successfully');
  } catch (error) {
    console.log('Error removing post from user: ', error);
  }
};

// Add a favorite post to a user
export const addUserFavorite = async (userId, postId) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      favorites: arrayUnion(postId)
    });
    console.log('Favorite post added to user successfully');
  } catch (error) {
    console.log('Error adding favorite post to user: ', error);
  }
};

// Remove a favorite post from a user
export const removeUserFavorite = async (userId, postId) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      favorites: arrayRemove(postId)
    });
    console.log('Favorite post removed from user successfully');
  } catch (error) {
    console.log('Error removing favorite post from user: ', error);
  }
};

// Add a liked post to a user
export const addUserLike = async (userId, postId) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      likes: arrayUnion(postId)
    });
    console.log('Liked post added to user successfully');
  } catch (error) {
    console.log('Error adding liked post to user: ', error);
  }
};

// Remove a liked post from a user
export const removeUserLike = async (userId, postId) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      likes: arrayRemove(postId)
    });
    console.log('Liked post removed from user successfully');
  } catch (error) {
    console.log('Error removing liked post from user: ', error);
  }
};

// Add a comment reference to a user
export const addUserComment = async (userId, commentId) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      comments: arrayUnion(commentId)
    });
    console.log('Comment added to user successfully');
  } catch (error) {
    console.log('Error adding comment to user: ', error);
  }
};

// Remove a comment reference from a user
export const removeUserComment = async (userId, commentId) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      comments: arrayRemove(commentId)
    });
    console.log('Comment removed from user successfully');
  } catch (error) {
    console.log('Error removing comment from user: ', error);
  }
};
