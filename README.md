# Voyage Vista - Travel Companion App

## Project Overview

Voyage Vista is a React Native app designed to enhance the travel experience by allowing users to explore destinations, capture and share memorable moments, and manage travel itineraries efficiently.

## App Functionality

- **Map Integration:** Interactive maps with location markers for user-visited and suggested travel spots.
- **Camera Functionality:** Users can take pictures at destinations and upload them to the app.
- **CRUD Operations:** Users can create, read, update, and delete information related to their travel experiences.

## Data Model and Firestore Collections

### Collections:

- **Users:** Stores user profile information.
  - **Fields:** `userId`, `username`, `email`, `profilePicture`
  - **CRUD Operations:** Create (on signup), Read (profile view), Update (edit profile)
- **Destinations:** Details about travel destinations.
  - **Fields:** `destinationId`, `name`, `description`, `images`, `coordinates`
  - **CRUD Operations:** Create (add new destination), Read (browse destinations), Delete (remove destination)
- **Photos:** Collection of photos uploaded by users.
  - **Fields:** `photoId`, `userId`, `destinationId`, `url`, `timestamp`
  - **CRUD Operations:** Create (upload photo), Read (view photos), Delete (delete photo)

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
