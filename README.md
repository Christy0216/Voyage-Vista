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

Note: Fields marked with an asterisk (\*) will be implemented in the next iteration.

- **Users:** Stores user profile information and their interactions with posts.

  - **Fields:**
    - `userId`: Unique identifier for the user.
    - `username`: Username of the user.
    - `email`: Email address of the user.
    - `profilePicture`: URL of the user's profile picture.
    - `birthday`: The Date time of the user's birthday.
    - `posts`\*: Array of post IDs created by the user.
    - `favorites`\*: Array of post IDs favorited by the user.
    - `likes`\*: Array of post IDs liked by the user.
    - `comments`\*: Array of comment IDs made by the user.
  - **CRUD Operations:**
    - **Create:** on signup
    - **Read:** profile view
    - **Update:** edit profile, manage arrays (add/remove post IDs, favorite post IDs, liked post IDs, comment IDs)
    - **Delete:** delete profile

- **Posts:** Collection of travel posts created by users.
  - **Fields:**
    - `userId`: Identifier of the user who created the post.
    - `destination`\*: Destination mentioned in the post.
    - `addressType`: Whether it is city or precise address.
    - `pictureUrl`\*: URL of the picture related to the post.
    - `createdAt`: Time when the post was created.
    - `coordinates`\*: Geographical coordinates of the destination.
    - `favoritesCount`\*: Number of times the post has been favorited.
    - `likesCount`\*: Number of times the post has been liked.
    - `favoritedBy`\*: Array of user IDs who have favorited the post.
    - `likedBy`\*: Array of user IDs who have liked the post.
  - **CRUD Operations:**
    - **Create:** post creation
    - **Read:** view posts
    - **Update:** update post details, increment likes and favorites
    - **Delete:** delete post
  - **Subcollections:**
    - **Photos:\*** Stores photos related to the post.
      - **Fields:**
        - `photoId`: Unique identifier for the photo.
        - `pictureUrl`: URL of the photo.
        - `timestamp`: Time when the photo was added.
      - **CRUD Operations:**
        - **Create:** add photo
        - **Read:** view photos
        - **Delete:** delete photo
    - **Comments:\*** Stores comments related to the post.
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

- **Shirui Chen:** Set up the initial project structure and navigation using React Navigation. Complete Screen designs and coding.
- **Kai Zong:** Implemented the authentication and conncetion flow with Firebase, and CRUD operations in applications.

## Screenshots

![Main Screen](./path/to/screenshot.png)  
_Caption: Main screen showing the list of users' posts._

## Version Control and Collaboration

All team members have cloned the repository, created their own branches for features, and merged their changes into the main branch after review. Regular commits and pulls ensure that everyone has the latest updates.

### Note on Contributions

If there are any contributions not directly reflected in GitHub commits (e.g., planning and design discussions), they are noted here along with the responsible team members.

## Next Steps

For the next iteration, we aim to enhance the CRUD operations for the Photos collection and improve the user interface based on initial user feedback from our testing sessions.
