import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity } from 'react-native';
import { db } from '../firebase/firebaseSetUp';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

const MainScreen = () => {
  const [posts, setPosts] = useState([]);
  const navigation = useNavigation(); // Get the navigation prop

  useEffect(() => {
    const fetchPosts = async () => {
      const postsCollectionRef = collection(db, 'posts');
      const querySnapshot = await getDocs(postsCollectionRef);
      const postsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsList);
    };

    fetchPosts();
  }, []);

  return (
    <View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('PostDetailsScreen', { postId: item.id })}
          >
            <View>
              <Image source={{ uri: item.profilePicture }} />
              <Text>{item.title}</Text>
              <View>
                {item.photos.slice(0, 4).map((photo, index) => (
                  <Image key={index} source={{ uri: photo.url }} />
                ))}
              </View>
              <Text>Favorites: {item.favoritesCount}</Text>
              <Text>Likes: {item.likesCount}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default MainScreen;
