import { useState, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { useComments } from '@/contexts/CommentsContext';
import { CommentFilters } from '@/components/comments/CommentFilters';
import { CommentsTable } from '@/components/comments/CommentsTable';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

type FilterType = 'all' | 'normal' | 'blocked';

const Comments = () => {
  const { comments, isLoading, blockComment, unblockComment, deleteComment, refreshComments } = useComments();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and search comments
  const filteredComments = useMemo(() => {
    return comments.filter((comment) => {
      const matchesSearch =
        comment.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.userName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        activeFilter === 'all' || comment.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [comments, searchQuery, activeFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredComments.length / ITEMS_PER_PAGE);
  const paginatedComments = filteredComments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleBlock = async (id: string) => {
    try {
      const admin = JSON.parse(localStorage.getItem("auth_user") || "{}");

      await fetch("http://localhost:3000/block-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId: id,
          adminId: admin.id,
        }),
      });

      toast.success("Comment blocked", {
        description: "The comment has been blocked successfully",
      });

      refreshComments(); // 🔥 reload from backend
    } catch (error) {
      toast.error("Failed to block comment");
    }
  };

  const handleUnblock = (id: string) => {
    unblockComment(id);
    toast.success('Comment unblocked', {
      description: 'The comment has been restored',
    });
  };

  const handleDelete = (id: string) => {
    deleteComment(id);
    toast.success('Comment deleted', {
      description: 'The comment has been permanently deleted',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Comments</h1>
          <p className="text-muted-foreground">
            Manage and moderate live stream comments
          </p>
        </div>
        <Button
          variant="outline"
          onClick={refreshComments}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <CommentFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      {/* Table */}
      <CommentsTable
        comments={paginatedComments}
        isLoading={isLoading}
        onBlock={handleBlock}
        onUnblock={handleUnblock}
        onDelete={handleDelete}
        currentPage={currentPage}
        totalPages={totalPages || 1}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default Comments;
