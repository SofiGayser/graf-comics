'use client';
import { useSession } from 'next-auth/react';
import { FC, useEffect, useState } from 'react';
import styles from './CommentsSection.module.scss'; // Добавьте этот импорт

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  likes: number;
  likedBy: string[];
  replies: Comment[];
  _count: {
    replies: number;
  };
}

interface CommentsSectionProps {
  comicsId: string;
  onAddComment: (text: string, replyId?: string) => Promise<any>;
  onClose: () => void;
}

const CommentsSection: FC<CommentsSectionProps> = ({ comicsId, onAddComment, onClose }) => {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchComments();
  }, [comicsId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comics/${comicsId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = await onAddComment(newComment);
    if (comment) {
      setComments((prev) => [comment, ...prev]);
      setNewComment('');
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyText.trim()) return;

    const reply = await onAddComment(replyText, parentId);
    if (reply) {
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === parentId ? { ...comment, replies: [...comment.replies, reply] } : comment,
        ),
      );
      setReplyText('');
      setReplyingTo(null);
    }
  };

  const toggleLikeComment = async (commentId: string) => {
    if (!session) return;

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  likes: data.likesCount,
                  likedBy: data.liked
                    ? [...comment.likedBy, session.user?.id as string]
                    : comment.likedBy.filter((id) => id !== session.user?.id),
                }
              : comment,
          ),
        );
      }
    } catch (error) {
      console.error('Error toggling comment like:', error);
    }
  };

  return (
    <div className={styles.commentsOverlay}>
      <div className={styles.commentsPanel}>
        <div className={styles.commentsHeader}>
          <h2>Комментарии</h2>
          <button onClick={onClose}>×</button>
        </div>

        {session ? (
          <form onSubmit={handleSubmitComment} className={styles.commentForm}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Напишите комментарий..."
              rows={3}
            />
            <button type="submit">Отправить</button>
          </form>
        ) : (
          <p style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>Войдите, чтобы оставить комментарий</p>
        )}

        <div className={styles.commentsList}>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={(id) => setReplyingTo(id)}
              onLike={toggleLikeComment}
              replyingTo={replyingTo}
              replyText={replyText}
              onReplyTextChange={setReplyText}
              onSubmitReply={handleSubmitReply}
              onCancelReply={() => setReplyingTo(null)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Дополнительный компонент для отображения отдельного комментария
const CommentItem: FC<{
  comment: Comment;
  onReply: (id: string) => void;
  onLike: (id: string) => void;
  replyingTo: string | null;
  replyText: string;
  onReplyTextChange: (text: string) => void;
  onSubmitReply: (parentId: string) => void;
  onCancelReply: () => void;
}> = ({ comment, onReply, onLike, replyingTo, replyText, onReplyTextChange, onSubmitReply, onCancelReply }) => {
  const { data: session } = useSession();
  const isLiked = session && comment.likedBy.includes(session.user?.id as string);

  return (
    <div className={styles.comment}>
      <div className={styles.commentHeader}>
        <img src={comment.user.avatar || '/default-avatar.png'} alt={comment.user.name} />
        <span>{comment.user.name}</span>
        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
      </div>
      <p>{comment.text}</p>
      <div className={styles.commentActions}>
        <button onClick={() => onLike(comment.id)} className={isLiked ? styles.liked : ''}>
          ♥ {comment.likes}
        </button>
        <button onClick={() => onReply(comment.id)}>Ответить</button>
      </div>

      {replyingTo === comment.id && (
        <div className={styles.replyForm}>
          <textarea
            value={replyText}
            onChange={(e) => onReplyTextChange(e.target.value)}
            placeholder="Напишите ответ..."
            rows={2}
          />
          <div>
            <button onClick={() => onSubmitReply(comment.id)}>Отправить</button>
            <button onClick={onCancelReply}>Отмена</button>
          </div>
        </div>
      )}

      {comment.replies.length > 0 && (
        <div className={styles.replies}>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onLike={onLike}
              replyingTo={replyingTo}
              replyText={replyText}
              onReplyTextChange={onReplyTextChange}
              onSubmitReply={onSubmitReply}
              onCancelReply={onCancelReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
