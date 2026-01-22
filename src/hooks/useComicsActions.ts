// hooks/useComicsActions.ts
import { useSession } from 'next-auth/react';
import { useState } from 'react';

interface UseComicsActionsProps {
  comicsId: string;
  initialLikes: string[];
  initialBookmarked: boolean;
}

export const useComicsActions = ({ comicsId, initialLikes = [], initialBookmarked = false }: UseComicsActionsProps) => {
  const { data: session } = useSession();
  const [likes, setLikes] = useState(initialLikes);
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isLiked, setIsLiked] = useState(session?.user?.id ? initialLikes.includes(session.user.id) : false);

  const toggleLike = async () => {
    if (!session) return;

    try {
      const response = await fetch(`/api/comics/${comicsId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);

        // Правильно обновляем массив лайков
        if (data.liked) {
          // Добавляем лайк
          setLikes((prev) => [...prev, session.user.id]);
        } else {
          // Удаляем лайк
          setLikes((prev) => prev.filter((id) => id !== session.user.id));
        }
      } else {
        const error = await response.json();
        console.error('Like error:', error);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const toggleBookmark = async () => {
    if (!session) return;

    try {
      const response = await fetch(`/api/comics/${comicsId}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(data.bookmarked);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const addComment = async (text: string, replyId?: string) => {
    if (!session) return null;

    try {
      const response = await fetch(`/api/comics/${comicsId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, replyId }),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
    return null;
  };

  return {
    likes,
    isLiked,
    isBookmarked,
    toggleLike,
    toggleBookmark,
    addComment,
    canInteract: !!session,
  };
};
