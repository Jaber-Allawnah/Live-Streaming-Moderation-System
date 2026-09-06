import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Comment, DashboardStats } from '@/types';
import { fetchCommentStats } from "@/lib/api.ts";
import { useAuth } from './AuthContext';

interface CommentsContextType {
  comments: Comment[];
  stats: DashboardStats;
  isLoading: boolean;
  blockComment: (id: string) => void;
  unblockComment: (id: string) => void;
  deleteComment: (id: string) => void;
  refreshComments: () => void;
}

const CommentsContext = createContext<CommentsContextType | undefined>(undefined);

export const CommentsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalComments: 0,
    blockedComments: 0,
    blockedPercentage: 0,
    latestBlocked: [],
    blockedLast5: 0,
    totalLast5: 0
  });
  const loadStats = async () => {
    try {
      setIsLoading(true);
      const statsData = await fetchCommentStats();
      const res = await fetch("http://localhost:3000/comments");
      const data = await res.json();
      setStats(statsData);
      setComments(data.allComments);
    } catch (error) {
      console.error("Failed to load stats", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();

    const interval = setInterval(() => {
      loadStats();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const blockComment = (id: string) => {
    setComments(prev =>
      prev.map(c =>
        c.id === id
          ? { ...c, status: 'blocked' as const, blockedBy: user?.name, blockedAt: new Date() }
          : c
      )
    );
  };

  const unblockComment = (id: string) => {
    setComments(prev =>
      prev.map(c =>
        c.id === id
          ? { ...c, status: 'normal' as const, blockedBy: undefined, blockedAt: undefined }
          : c
      )
    );
  };

  const deleteComment = (id: string) => {
    setComments(prev => prev.filter(c => c.id !== id));
  };


  return (
      <CommentsContext.Provider
          value={{
            comments, // you can later connect this to backend too
            stats,
            isLoading,
            blockComment,
            unblockComment,
            deleteComment,
            refreshComments: loadStats,
          }}
      >
        {children}
      </CommentsContext.Provider>
  );
};

export const useComments = () => {
  const context = useContext(CommentsContext);
  if (!context) {
    throw new Error('useComments must be used within CommentsProvider');
  }
  return context;
};
