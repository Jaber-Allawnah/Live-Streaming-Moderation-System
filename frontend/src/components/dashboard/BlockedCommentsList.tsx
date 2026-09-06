import { formatDistanceToNow } from 'date-fns';
import { Shield, User } from 'lucide-react';
import { Comment } from '@/types';

interface BlockedCommentsListProps {
  comments: Comment[];
}

export const BlockedCommentsList = ({ comments }: BlockedCommentsListProps) => {
  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Shield className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">No blocked comments yet</p>
        <p className="text-sm text-muted-foreground/70">
          Blocked comments will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment, index) => (
        <div
          key={comment.id}
          className="flex items-start gap-3 p-4 rounded-lg bg-destructive/5 border border-destructive/10 animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-destructive/10 flex-shrink-0">
            <User className="w-4 h-4 text-destructive" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{comment.userName}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {comment.text}
            </p>
            {comment && (
              <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Blocked by {comment.blockedBy}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
