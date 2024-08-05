import {db} from './firebaseSetUp';
import {collection, addDoc, deleteDoc, updateDoc, doc, getDocs, getDoc} from 'firebase/firestore';

export async function addPost (userId, post){
    try {
        await addDoc(collection(db, userId), post);
        return true;
    } catch (e) {
        console.log("Error adding document: ", e);
        return false;
    }
}

export async function deletePost (collectionName, docId){
    try {
        await deleteDoc(doc(db, collectionName, docId));
        return true;
    } catch (e) {
        console.log("Error deleting document: ", e);
        return false;
    }
}

export async function updatePost (collectionName, docId, post){
    try {
        await updateDoc(doc(db, collectionName, docId), post);
        return true;
    } catch (e) {
        console.log("Error updating document: ", e);
        return false;
    }
}

export async function getPosts (collectionName, userId){

}