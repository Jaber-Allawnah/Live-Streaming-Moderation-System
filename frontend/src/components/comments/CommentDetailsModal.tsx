import { format } from 'date-fns';
import { X, Shield, Trash2, User, Clock, AlertTriangle } from 'lucide-react';
import { Comment } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface CommentDetailsModalProps {
  comment: Comment | null;
  isOpen: boolean;
  onClose: () => void;
  onBlock: (id: string) => void;
  onDelete: (id: string) => void;
}

export const CommentDetailsModal = ({
  comment,
  isOpen,
  onClose,
  onBlock,
  onDelete,
}: CommentDetailsModalProps) => {
  if (!comment) return null;

  const isBlocked = comment.status === 'blocked';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              Comment Details
              <Badge
                variant={isBlocked ? 'destructive' : 'default'}
                className={isBlocked ? '' : 'bg-success/10 text-success border-success/20'}
              >
                {isBlocked ? 'Blocked' : 'Normal'}
              </Badge>
            </DialogTitle>
          </div>
          <DialogDescription>
            ID: {comment.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* User Info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{comment.userName}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(comment.timestamp, 'MMM d, yyyy • HH:mm')}
              </p>
            </div>
          </div>

          {/* Comment Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Comment Content
            </label>
            <div className={`p-4 rounded-lg border ${isBlocked ? 'bg-destructive/5 border-destructive/20' : 'bg-muted'}`}>
              <p className="text-sm whitespace-pre-wrap">{comment.text}</p>
            </div>
          </div>

          {/* Blocked Info */}
          {isBlocked && comment.blockedBy && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <div className="text-sm">
                <span className="text-destructive font-medium">Blocked by {comment.blockedBy}</span>
                {comment.blockedAt && (
                  <span className="text-muted-foreground">
                    {' '}on {format(comment.blockedAt, 'MMM d, yyyy • HH:mm')}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {!isBlocked && (
            <Button
              variant="outline"
              onClick={() => onBlock(comment.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Shield className="w-4 h-4 mr-2" />
              Block Comment
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={() => onDelete(comment.id)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
