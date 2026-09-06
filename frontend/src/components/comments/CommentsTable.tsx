import { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Shield, Trash2, Eye, MoreHorizontal, RefreshCw } from 'lucide-react';
import { Comment } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CommentDetailsModal } from './CommentDetailsModal';
import { cn } from '@/lib/utils';

interface CommentsTableProps {
  comments: Comment[];
  isLoading: boolean;
  onBlock: (id: string) => void;
  onUnblock: (id: string) => void;
  onDelete: (id: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const CommentsTable = ({
  comments,
  isLoading,
  onBlock,
  onUnblock,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
}: CommentsTableProps) => {
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    onDelete(id);
    setDeleteConfirmId(null);
    setSelectedComment(null);
  };

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center py-20">
  //       <RefreshCw className="w-8 h-8 text-primary animate-spin" />
  //     </div>
  //   );
  // }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium">No comments found</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-24">ID</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead className="w-32">User</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-36">Time</TableHead>
              <TableHead className="w-32">Blocked By</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comments.map((comment, index) => (
              <TableRow
                key={comment.id}
                className={cn(
                  'transition-colors animate-fade-in',
                  comment.status === 'blocked' && 'bg-destructive/5'
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {comment.id.slice(0, 12)}...
                </TableCell>
                <TableCell>
                  <p className={cn(
                    'max-w-xs truncate',
                    comment.status === 'blocked' && 'text-muted-foreground line-through'
                  )}>
                    {comment.text}
                  </p>
                </TableCell>
                <TableCell className="font-medium">{comment.userName}</TableCell>
                <TableCell>
                  <Badge
                    variant={comment.status === 'blocked' ? 'destructive' : 'default'}
                    className={comment.status === 'normal' ? 'bg-success/10 text-success border-success/20' : ''}
                  >
                    {comment.status === 'blocked' ? 'Blocked' : 'Normal'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
                </TableCell>
                <TableCell className="text-sm">
                  {comment.blockedBy || '—'}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedComment(comment)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {comment.status === 'normal' ? (
                        <DropdownMenuItem
                          onClick={() => onBlock(comment.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Block
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => onUnblock(comment.id)}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Unblock
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => setDeleteConfirmId(comment.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <CommentDetailsModal
        comment={selectedComment}
        isOpen={!!selectedComment}
        onClose={() => setSelectedComment(null)}
        onBlock={(id) => {
          onBlock(id);
          setSelectedComment(null);
        }}
        onDelete={(id) => setDeleteConfirmId(id)}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
