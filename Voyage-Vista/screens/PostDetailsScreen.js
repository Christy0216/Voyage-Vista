import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

const PostDetailsScreen = ({ route, navigation }) => {
  const { postId } = route.params; // Get the postId passed via navigation

  useEffect(() => {
    // Fetch details based on postId or set it up accordingly
  }, [postId]);

  return (
    <View>
      <Text>Post Details for {postId}</Text>
      {/* Render the post details here */}
    </View>
  );
};

export default PostDetailsScreen;
