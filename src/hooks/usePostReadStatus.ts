import { useEffect, useState, useCallback } from 'react';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface PostReadStatus {
  [postId: string]: boolean; // true = read, false = unread
}

export function usePostReadStatus() {
  const { user } = useAuth();
  const [readStatus, setReadStatus] = useState<PostReadStatus>({});
  const [loading, setLoading] = useState(true);

  // Load read status from Firestore
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'userPostReadStatus', user.uid);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setReadStatus(docSnap.data()?.readStatus || {});
      } else {
        setReadStatus({});
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Mark post as read
  const markAsRead = useCallback(async (postId: string) => {
    if (!user) return;

    try {
      const docRef = doc(db, 'userPostReadStatus', user.uid);
      const docSnap = await getDoc(docRef);
      
      const currentReadStatus = docSnap.exists() ? docSnap.data()?.readStatus || {} : {};
      
      await setDoc(docRef, {
        readStatus: {
          ...currentReadStatus,
          [postId]: true,
        },
        updatedAt: new Date(),
      });

      setReadStatus(prev => ({
        ...prev,
        [postId]: true,
      }));
    } catch (error) {
      console.error('Error marking post as read:', error);
    }
  }, [user]);

  // Mark post as unread
  const markAsUnread = useCallback(async (postId: string) => {
    if (!user) return;

    try {
      const docRef = doc(db, 'userPostReadStatus', user.uid);
      const docSnap = await getDoc(docRef);
      
      const currentReadStatus = docSnap.exists() ? docSnap.data()?.readStatus || {} : {};
      
      await setDoc(docRef, {
        readStatus: {
          ...currentReadStatus,
          [postId]: false,
        },
        updatedAt: new Date(),
      });

      setReadStatus(prev => ({
        ...prev,
        [postId]: false,
      }));
    } catch (error) {
      console.error('Error marking post as unread:', error);
    }
  }, [user]);

  // Get count of unread notifications
  const unreadCount = Object.values(readStatus).filter(status => !status).length;

  return {
    readStatus,
    loading,
    markAsRead,
    markAsUnread,
    unreadCount,
    isRead: (postId: string) => readStatus[postId] === true,
  };
}
