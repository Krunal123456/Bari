import { useEffect, useState } from 'react';
import { Post } from '@/lib/types';
import { postService } from '@/services/postService';

export function usePostsListener(type: 'home' | 'dashboard' = 'home') {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const listenerFn = type === 'home' 
      ? postService.listenToActivePublicPosts
      : postService.listenToUserNotifications;

    const unsubscribe = listenerFn(
      (fetchedPosts) => {
        setPosts(fetchedPosts);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [type]);

  return { posts, loading, error };
}
