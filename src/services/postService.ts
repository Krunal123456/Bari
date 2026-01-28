
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Post, PostStatus } from "@/lib/types";

const COLLECTION_NAME = "posts";

export const postService = {
    // Create a new post
    async createPost(post: Omit<Post, "id" | "createdAt" | "updatedAt">) {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...post,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error creating post:", error);
            throw error;
        }
    },

    // Update an existing post
    async updatePost(id: string, updates: Partial<Post>) {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error updating post:", error);
            throw error;
        }
    },

    // Delete a post
    async deletePost(id: string) {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, id));
        } catch (error) {
            console.error("Error deleting post:", error);
            throw error;
        }
    },

    // Get all posts (for admin)
    async getAllPosts() {
        try {
            const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
        } catch (error) {
            console.error("Error fetching all posts:", error);
            throw error;
        }
    },

    // Get active public posts (for home page)
    async getActivePosts() {
        try {
            // Complex queries require indices, keeping it simple for now
            // We fetch published posts and filter client-side for expiry/schedule if needed for MVP without indices
            const q = query(
                collection(db, COLLECTION_NAME),
                where("status", "==", "published"),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);

            const now = new Date();
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return { id: doc.id, ...data } as Post;
            }).filter(post => {
                // Filter scheduled and expired posts
                const scheduledTime = post.scheduledAt?.toDate ? post.scheduledAt.toDate() : null;
                const expiryTime = post.expiresAt?.toDate ? post.expiresAt.toDate() : null;

                if (scheduledTime && scheduledTime > now) return false;
                if (expiryTime && expiryTime < now) return false;

                return true;
            });
        } catch (error) {
            console.error("Error fetching active posts:", error);
            return []; // Return empty array on error (e.g., missing index)
        }
    },

    // Upload file to storage
    async uploadFile(file: File, path: string = "posts") {
        try {
            const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
        }
    }
};
