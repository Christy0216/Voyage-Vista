import { db, auth, storage } from './firebaseSetUp';
import { collection, doc, addDoc, getDoc, updateDoc, deleteDoc, getDocs, query, writeBatch, increment, arrayUnion, arrayRemove, limit, where } from "firebase/firestore";
import { addUserPost, removeUserPost, getUser } from './firebaseUserHelper';
import { ref, listAll, deleteObject } from 'firebase/storage';


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
    // Fetch user details from Firestore
    const userDoc = await getUser(userId);
    if (!userDoc) {
      throw new Error('User not found');
    }

    const postRef = await addDoc(collection(db, 'posts'), {
      ...post,
      favoritesCount: 0,
      likesCount: 0,
      favoritedBy: [],
      likedBy: [],
      createdAt: new Date()
    });

    console.log(userDoc.id)
    await addUserPost(userDoc.id, postRef.id);
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
        if (!postData.uid) {
          console.log('User ID not found in post data.');
          return null;
        }
         // Assuming the post data includes uid
        const userDoc = await getUser(postData.uid);
  
        if (userDoc) {
          // const userData = userDoc.data();
          return {
            post: {
              id: postDoc.id,
              ...postData,
              userName: userDoc.username || 'Unknown', 
              userProfilePicture: userDoc.profilePicture || '',
              photos: postData.photos || []
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

  // Fetch all posts
  export const fetchPostsByUserId = async (userId) => {
    try{
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('uid', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
  catch (error) {
    console.log('Error getting posts: ', error);
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

const deletePostImages = async (postId) => {
  const imagesRef = ref(storage, `posts/${postId}/`);

  try {
    const listResult = await listAll(imagesRef);
    const deletePromises = listResult.items.map((imageRef) => deleteObject(imageRef));
    await Promise.all(deletePromises);
    console.log('Post images deleted successfully from Firebase Storage');
  } catch (error) {
    console.error('Error deleting post images: ', error);
  }
};
// Delete a post
export const deletePost = async (postId) => {
  try {

    // Delete images from Firebase Storage
    await deletePostImages(postId);

    // Delete subcollections first
    await deleteSubcollectionInBatches(postId, 'comments');
    
    // Delete the post document
    await deleteDoc(doc(db, 'posts', postId));

    console.log('Post and all related data deleted successfully');
    userDoc = await getUser(auth.currentUser.uid);
    await removeUserPost(userDoc.id, postId);
    console.log('Post removed from user successfully');
  } catch (error) {
    console.error('Error deleting post: ', error);
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

export const fetchPostsInRegion = async (region) => {
    // First query by latitude
    const postsRef = collection(db, 'posts');
    const qLatitude = query(
        postsRef,
        where('location.latitude', '>=', region.latitude - region.latitudeDelta / 2),
        where('location.latitude', '<=', region.latitude + region.latitudeDelta / 2)
    );

    const snapshotLatitude = await getDocs(qLatitude);
    const postsByLatitude = snapshotLatitude.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    // Then filter by longitude in the application
    const postsInRegion = postsByLatitude.filter(post =>
        post.location.longitude >= (region.longitude - region.longitudeDelta / 2) &&
        post.location.longitude <= (region.longitude + region.longitudeDelta / 2)
    );

    return postsInRegion;
};