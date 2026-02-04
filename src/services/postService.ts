
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
    Timestamp,
    writeBatch,
    onSnapshot,
    Query,
    QueryConstraint
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
            const errMsg = (error as any)?.code || (error as any)?.message || String(error);
            if (/permission|PERMISSION_DENIED/i.test(errMsg)) {
                throw new Error("Permission denied: you must be an authenticated admin to create posts.");
            }
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
            const errMsg = (error as any)?.code || (error as any)?.message || String(error);
            if (/permission|PERMISSION_DENIED/i.test(errMsg)) {
                throw new Error("Permission denied: you must be an authenticated admin to upload files.");
            }
            throw error;
        }
    },

    // Get active public posts for home page - with real-time listener
    listenToActivePublicPosts(
        callback: (posts: Post[]) => void,
        onError?: (error: Error) => void
    ) {
        try {
            // SIMPLIFIED QUERY: Removed multiple orderBy clauses to avoid needing a composite index.
            // We only filter by status and visibility here. Sorting is done client-side.
            const constraints: QueryConstraint[] = [
                where("status", "==", "published"),
                where("visibility", "in", ["public", "private"])
            ];

            const q = query(collection(db, COLLECTION_NAME), ...constraints);

            const unsubscribe = onSnapshot(
                q,
                (querySnapshot) => {
                    const now = new Date();
                    let posts = querySnapshot.docs
                        .map(doc => ({ id: doc.id, ...doc.data() } as Post))
                        .filter(post => {
                            // Filter scheduled and expired posts
                            const scheduledTime = post.scheduledAt?.toDate?.() || null;
                            const expiryTime = post.expiresAt?.toDate?.() || null;

                            if (scheduledTime && scheduledTime > now) return false;
                            if (expiryTime && expiryTime < now) return false;

                            // Don't show admin-only posts
                            if (post.visibility === "admin") return false;

                            return true;
                        });

                    // CLIENT-SIDE SORTING: Pinned > Priority > Date
                    posts.sort((a, b) => {
                        // 1. Pinned active posts first
                        if (a.isPinned !== b.isPinned) {
                            return a.isPinned ? -1 : 1;
                        }

                        // 2. Priority: emergency > high > normal
                        const priorityOrder = { emergency: 0, high: 1, normal: 2 };
                        const pA = priorityOrder[a.priority] ?? 2;
                        const pB = priorityOrder[b.priority] ?? 2;
                        if (pA !== pB) {
                            return pA - pB;
                        }

                        // 3. Date descending (newest first)
                        const dateA = a.createdAt?.seconds ?? 0;
                        const dateB = b.createdAt?.seconds ?? 0;
                        return dateB - dateA;
                    });

                    callback(posts);
                },
                (error) => {
                    console.error("Error listening to active posts:", error);
                    // If we still get an index error (unlikely with this simple query), log it clearly
                    if (error.code === 'failed-precondition') {
                        console.error("Firestore Index Required. Please check console link.");
                    }
                    if (onError) onError(error as Error);
                }
            );

            return unsubscribe;
        } catch (error) {
            console.error("Error setting up listener:", error);
            callback([]);
            return () => { };
        }
    },

    // Get posts visible to logged-in users (for dashboard)
    listenToUserNotifications(
        callback: (posts: Post[]) => void,
        onError?: (error: Error) => void
    ) {
        try {
            const constraints: QueryConstraint[] = [
                where("status", "==", "published"),
                where("visibility", "in", ["public", "private"]),
                orderBy("priority", "desc"),
                orderBy("createdAt", "desc")
            ];

            const q = query(collection(db, COLLECTION_NAME), ...constraints);

            const unsubscribe = onSnapshot(
                q,
                (querySnapshot) => {
                    const now = new Date();
                    const posts = querySnapshot.docs
                        .map(doc => ({ id: doc.id, ...doc.data() } as Post))
                        .filter(post => {
                            // Filter scheduled and expired posts
                            const scheduledTime = post.scheduledAt?.toDate?.() || null;
                            const expiryTime = post.expiresAt?.toDate?.() || null;

                            if (scheduledTime && scheduledTime > now) return false;
                            if (expiryTime && expiryTime < now) return false;

                            // Don't show admin-only posts
                            if (post.visibility === "admin") return false;

                            return true;
                        });

                    callback(posts);
                },
                (error) => {
                    console.error("Error listening to notifications:", error);
                    if (onError) onError(error as Error);
                }
            );

            return unsubscribe;
        } catch (error) {
            console.error("Error setting up listener:", error);
            callback([]);
            return () => { };
        }
    },

    // Send push notification to all users when post is published
    async sendNotificationToUsers(postId: string, post: Post) {
        try {
            // Get all user notification tokens
            const tokensSnapshot = await getDocs(collection(db, "userNotificationTokens"));
            const tokens: string[] = [];

            tokensSnapshot.forEach((docSnapshot) => {
                const token = docSnapshot.data().token;
                if (token) {
                    tokens.push(token);
                }
            });

            if (tokens.length === 0) {
                console.warn("No user tokens found for notifications");
                return;
            }

            // Call the backend API to send notifications
            // This would be handled by a Cloud Function in production
            const response = await fetch("/api/send-notification", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    tokens,
                    title: post.title,
                    body: post.content.substring(0, 100) + "...",
                    data: {
                        postId,
                        type: post.type,
                        priority: post.priority,
                    },
                }),
            });

            if (!response.ok) {
                console.error("Failed to send notifications");
            }
        } catch (error) {
            console.error("Error sending notifications:", error);
            // Don't throw - notifications failing shouldn't break post creation
        }
    }
};
