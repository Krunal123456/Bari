import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import {
  AdminPost,
  MatrimonyProfile,
  DirectoryEntry,
  CMSContent,
  ActivityLog,
  DashboardStats,
  PostFilters,
  MatrimonyFilters,
  DirectoryFilters,
} from "@/lib/admin-types";

// ============ POSTS & NOTIFICATIONS ============

export async function createPost(post: Omit<AdminPost, "id" | "createdAt" | "updatedAt">) {
  try {
    const newPost = {
      ...post,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, "posts"), newPost);
    return { id: docRef.id, ...newPost };
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}

export async function updatePost(id: string, updates: Partial<AdminPost>) {
  try {
    const postRef = doc(db, "posts", id);
    await updateDoc(postRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
}

export async function deletePost(id: string) {
  try {
    const postRef = doc(db, "posts", id);
    await updateDoc(postRef, {
      status: "Archived",
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}

export async function getPosts(filters?: PostFilters, pageSize = 20) {
  try {
    const constraints: QueryConstraint[] = [orderBy("publishedDate", "desc"), limit(pageSize)];

    if (filters?.type) constraints.push(where("type", "==", filters.type));
    if (filters?.status) constraints.push(where("status", "==", filters.status));
    if (filters?.priority) constraints.push(where("priority", "==", filters.priority));

    const q = query(collection(db, "posts"), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AdminPost[];
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
}

export async function getPost(id: string) {
  try {
    const docRef = doc(db, "posts", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as AdminPost;
    }
    return null;
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error;
  }
}

// ============ MATRIMONY APPROVALS ============

export async function getMatrimonyProfiles(
  filters?: MatrimonyFilters,
  pageSize = 20
) {
  try {
    const constraints: QueryConstraint[] = [
      orderBy("createdAt", "desc"),
      limit(pageSize),
    ];

    if (filters?.status) constraints.push(where("status", "==", filters.status));
    if (filters?.gender) constraints.push(where("gender", "==", filters.gender));
    if (filters?.location) constraints.push(where("location", "==", filters.location));

    const q = query(collection(db, "matrimony_profiles"), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MatrimonyProfile[];
  } catch (error) {
    console.error("Error fetching matrimony profiles:", error);
    throw error;
  }
}

export async function getMatrimonyProfile(id: string) {
  try {
    const docRef = doc(db, "matrimony_profiles", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as MatrimonyProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching matrimony profile:", error);
    throw error;
  }
}

export async function approveMatrimonyProfile(
  id: string,
  adminId: string,
  adminName: string
) {
  try {
    const profileRef = doc(db, "matrimony_profiles", id);
    await updateDoc(profileRef, {
      status: "approved",
      approvedBy: adminId,
      approvalDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Log activity
    await logActivity(adminId, adminName, "approved_matrimony_profile", "matrimony_profiles", id);
  } catch (error) {
    console.error("Error approving profile:", error);
    throw error;
  }
}

export async function rejectMatrimonyProfile(
  id: string,
  reason: string,
  adminId: string,
  adminName: string
) {
  try {
    const profileRef = doc(db, "matrimony_profiles", id);
    await updateDoc(profileRef, {
      status: "rejected",
      rejectionReason: reason,
      updatedAt: new Date().toISOString(),
    });

    // Log activity
    await logActivity(
      adminId,
      adminName,
      "rejected_matrimony_profile",
      "matrimony_profiles",
      id,
      { reason }
    );
  } catch (error) {
    console.error("Error rejecting profile:", error);
    throw error;
  }
}

export async function requestChanges(
  id: string,
  changes: string,
  adminId: string,
  adminName: string
) {
  try {
    const profileRef = doc(db, "matrimony_profiles", id);
    await updateDoc(profileRef, {
      status: "changes_requested",
      changeRequests: changes,
      updatedAt: new Date().toISOString(),
    });

    // Log activity
    await logActivity(
      adminId,
      adminName,
      "requested_changes_matrimony",
      "matrimony_profiles",
      id,
      { changes }
    );
  } catch (error) {
    console.error("Error requesting changes:", error);
    throw error;
  }
}

// ============ USER DIRECTORY ============

export async function getDirectoryEntries(
  filters?: DirectoryFilters,
  pageSize = 20
) {
  try {
    const constraints: QueryConstraint[] = [
      where("isDeleted", "==", false),
      orderBy("name"),
      limit(pageSize),
    ];

    if (filters?.profession)
      constraints.push(where("profession", "==", filters.profession));
    if (filters?.location) constraints.push(where("location", "==", filters.location));
    if (filters?.isApproved !== undefined)
      constraints.push(where("isApproved", "==", filters.isApproved));

    const q = query(collection(db, "directory"), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as DirectoryEntry[];
  } catch (error) {
    console.error("Error fetching directory entries:", error);
    throw error;
  }
}

export async function approveDirectoryEntry(id: string, adminId: string, adminName: string) {
  try {
    const entryRef = doc(db, "directory", id);
    await updateDoc(entryRef, {
      isApproved: true,
      updatedAt: new Date().toISOString(),
    });

    await logActivity(adminId, adminName, "approved_directory_entry", "directory", id);
  } catch (error) {
    console.error("Error approving directory entry:", error);
    throw error;
  }
}

export async function deleteDirectoryEntry(id: string, adminId: string, adminName: string) {
  try {
    const entryRef = doc(db, "directory", id);
    await updateDoc(entryRef, {
      isDeleted: true,
      updatedAt: new Date().toISOString(),
    });

    await logActivity(adminId, adminName, "deleted_directory_entry", "directory", id);
  } catch (error) {
    console.error("Error deleting directory entry:", error);
    throw error;
  }
}

// ============ CMS CONTENT ============

export async function getCMSContent(type?: string) {
  try {
    const constraints: QueryConstraint[] = [orderBy("updatedAt", "desc")];
    if (type) constraints.push(where("type", "==", type));

    const q = query(collection(db, "cms_content"), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CMSContent[];
  } catch (error) {
    console.error("Error fetching CMS content:", error);
    throw error;
  }
}

export async function updateCMSContent(
  id: string,
  updates: Partial<CMSContent>,
  adminId: string,
  adminName: string
) {
  try {
    const contentRef = doc(db, "cms_content", id);

    // Increment version
    const currentDoc = await getDoc(contentRef);
    const currentVersion = (currentDoc.data()?.version || 0) as number;

    await updateDoc(contentRef, {
      ...updates,
      version: currentVersion + 1,
      updatedAt: new Date().toISOString(),
      updatedByName: adminName,
    });

    await logActivity(adminId, adminName, "updated_cms_content", "cms_content", id);
  } catch (error) {
    console.error("Error updating CMS content:", error);
    throw error;
  }
}

// ============ ACTIVITY LOGGING ============

export async function logActivity(
  adminId: string,
  adminName: string,
  action: string,
  entityType: string,
  entityId: string,
  changes?: Record<string, unknown>
) {
  try {
    const log: Omit<ActivityLog, "id"> = {
      adminId,
      adminName,
      action,
      entityType,
      entityId,
      changes,
      timestamp: new Date().toISOString(),
    };

    await addDoc(collection(db, "admin_logs"), log);
  } catch (error) {
    console.error("Error logging activity:", error);
    // Don't throw - logging failures shouldn't break main operations
  }
}

export async function getActivityLogs(limit_count = 50) {
  try {
    const q = query(
      collection(db, "admin_logs"),
      orderBy("timestamp", "desc"),
      limit(limit_count)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ActivityLog[];
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    throw error;
  }
}

// ============ DASHBOARD STATS ============

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get total users
    const usersQuery = query(collection(db, "users"));
    const usersSnapshot = await getDocs(usersQuery);
    const totalUsers = usersSnapshot.size;

    // Get matrimony stats
    const matrimonyQuery = query(
      collection(db, "matrimony_profiles"),
      where("status", "==", "approved")
    );
    const matrimonySnapshot = await getDocs(matrimonyQuery);
    const approvedMatrimonyProfiles = matrimonySnapshot.size;

    const pendingQuery = query(
      collection(db, "matrimony_profiles"),
      where("status", "==", "pending")
    );
    const pendingSnapshot = await getDocs(pendingQuery);
    const pendingApprovals = pendingSnapshot.size;

    // Get active posts
    const postsQuery = query(
      collection(db, "posts"),
      where("status", "==", "Published")
    );
    const postsSnapshot = await getDocs(postsQuery);
    const activePosts = postsSnapshot.size;

    // Get directory entries
    const directoryQuery = query(
      collection(db, "directory"),
      where("isDeleted", "==", false)
    );
    const directorySnapshot = await getDocs(directoryQuery);
    const directoryEntries = directorySnapshot.size;

    return {
      totalUsers,
      approvedMatrimonyProfiles,
      pendingApprovals,
      activePosts,
      directoryEntries,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
}

// ============ FILE UPLOADS ============

export async function uploadFile(file: File, path: string) {
  try {
    const fileRef = ref(storage, `admin/${path}/${Date.now()}-${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return url;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

export async function deleteFile(url: string) {
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

// ============ BULK EXPORTS ============

export async function exportMatrimonyProfiles(filters?: MatrimonyFilters) {
  try {
    const profiles = await getMatrimonyProfiles(filters, 1000);
    return profiles;
  } catch (error) {
    console.error("Error exporting matrimony profiles:", error);
    throw error;
  }
}

export async function exportDirectoryEntries(filters?: DirectoryFilters) {
  try {
    const entries = await getDirectoryEntries(filters, 1000);
    return entries;
  } catch (error) {
    console.error("Error exporting directory entries:", error);
    throw error;
  }
}
