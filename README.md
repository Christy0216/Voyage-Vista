# Voyage Vista - Travel Companion App

## Project Overview

Voyage Vista is a React Native app designed to enhance the travel experience by allowing users to explore destinations, capture and share memorable moments, and manage travel itineraries efficiently.

## App Functionality

- **Map Integration:** Interactive maps with location markers for user-visited and suggested travel spots.
- **Camera Functionality:** Users can take pictures at destinations and upload them to the app.
- **CRUD Operations:** Users can create, read, update, and delete information related to their travel experiences.

## Data Model and Firestore Collections

### Collections:

### Collections:

- **Users:** Stores user profile information and their interactions with posts.
  - **Fields:** 
    - `userId`: Unique identifier for the user.
    - `username`: Username of the user.
    - `email`: Email address of the user.
    - `profilePicture`: URL of the user's profile picture.
  - **CRUD Operations:** 
    - **Create:** on signup
    - **Read:** profile view
    - **Update:** edit profile
    - **Delete:** delete profile
  - **Subcollections:**
    - **Posts:** Stores references to travel posts created by the user.
      - **Fields:** `postId`: Unique identifier for the post.
      - **CRUD Operations:** 
        - **Create:** add post reference
        - **Read:** view user's posts
        - **Delete:** remove post reference
    - **Favorites:** Stores references to posts that the user has favorited.
      - **Fields:** `postId`: Unique identifier for the favorited post.
      - **CRUD Operations:** 
        - **Create:** add post to favorites
        - **Read:** view user's favorite posts
        - **Delete:** remove post from favorites
    - **Likes:** Stores references to posts that the user has liked.
      - **Fields:** `postId`: Unique identifier for the liked post.
      - **CRUD Operations:** 
        - **Create:** add post to likes
        - **Read:** view user's liked posts
        - **Delete:** remove post from likes
    - **Comments:** Stores references to comments made by the user.
      - **Fields:** `commentId`: Unique identifier for the comment.
      - **CRUD Operations:** 
        - **Create:** add comment reference
        - **Read:** view user's comments
        - **Delete:** remove comment reference

- **Posts:** Collection of travel posts created by users.
  - **Fields:** 
    - `postId`: Unique identifier for the post.
    - `userId`: Identifier of the user who created the post.
    - `destination`: Destination mentioned in the post.
    - `pictureUrl`: URL of the picture related to the post.
    - `timestamp`: Time when the post was created.
    - `coordinates`: Geographical coordinates of the destination.
    - `favoritesCount`: Number of times the post has been favorited.
    - `likesCount`: Number of times the post has been liked.
    - `favoritedBy`: Array of userIds who have favorited the post.
    - `likedBy`: Array of userIds who have liked the post.
  - **CRUD Operations:** 
    - **Create:** post creation
    - **Read:** view posts
    - **Update:** update post details, increment likes and favorites
    - **Delete:** delete post
  - **Subcollections:**
    - **Photos:** Stores photos related to the post.
      - **Fields:** 
        - `photoId`: Unique identifier for the photo.
        - `pictureUrl`: URL of the photo.
        - `timestamp`: Time when the photo was added.
      - **CRUD Operations:** 
        - **Create:** add photo
        - **Read:** view photos
        - **Delete:** delete photo
    - **Comments:** Stores comments related to the post.
      - **Fields:** 
        - `commentId`: Unique identifier for the comment.
        - `userId`: Identifier of the user who made the comment.
        - `content`: The text of the comment.
        - `timestamp`: Time when the comment was made.
      - **CRUD Operations:** 
        - **Create:** add comment
        - **Read:** view comments
        - **Update:** edit comment
        - **Delete:** delete comment


## Contributions

### Team Members:

- Shirui Chen
- Kai Zong

### Contributions Summary:

- **Shirui Chen:** Set up the initial project structure and navigation using React Navigation.
- **Kai Zong:** Implemented the authentication flow with Firebase.

## Screenshots

![Main Screen](./path/to/screenshot.png)  
_Caption: Main screen showing the list of users' posts._

## Version Control and Collaboration

All team members have cloned the repository, created their own branches for features, and merged their changes into the main branch after review. Regular commits and pulls ensure that everyone has the latest updates.

### Note on Contributions

If there are any contributions not directly reflected in GitHub commits (e.g., planning and design discussions), they are noted here along with the responsible team members.

## Next Steps

For the next iteration, we aim to enhance the CRUD operations for the Photos collection and improve the user interface based on initial user feedback from our testing sessions.
