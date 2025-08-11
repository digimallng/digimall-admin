'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, RefreshCw, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScreenReader } from './accessibility';

interface InfiniteScrollProps<T> {
  items: T[];
  loading: boolean;
  hasMore: boolean;
  error?: string | null;
  onLoadMore: () => void;
  onRetry?: () => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  threshold?: number;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  endMessage?: React.ReactNode;
  className?: string;
  itemClassName?: string;
  reverse?: boolean; // For chat messages (newest at bottom)
}

interface VirtualizedInfiniteScrollProps<T> extends InfiniteScrollProps<T> {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

// Basic infinite scroll hook
export function useInfiniteScroll({
  loading,
  hasMore,
  onLoadMore,
  threshold = 100,
  reverse = false,
}: {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  threshold?: number;
  reverse?: boolean;
}) {
  const [isFetching, setIsFetching] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!observerRef.current || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry.isIntersecting && !isFetching) {
          setIsFetching(true);
          onLoadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: `${threshold}px`,
      }
    );

    observer.observe(observerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [loading, hasMore, onLoadMore, threshold, isFetching]);

  // Reset fetching state when loading completes
  useEffect(() => {
    if (!loading) {
      setIsFetching(false);
    }
  }, [loading]);

  return { observerRef };
}

// Intersection observer hook for scroll detection
export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const lastScrollY = useRef(0);
  const scrollTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection('up');
      }

      lastScrollY.current = currentScrollY;
      setIsScrolling(true);

      // Clear existing timer
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }

      // Set new timer to detect scroll end
      scrollTimer.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }
    };
  }, []);

  return { scrollDirection, isScrolling };
}

// Scroll to top button
interface ScrollToTopProps {
  threshold?: number;
  className?: string;
}

export function ScrollToTop({ threshold = 400, className }: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    ScreenReader.announce('Scrolled to top');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className={cn(
            'fixed right-6 bottom-6 z-50 rounded-full bg-blue-600 p-3 text-white shadow-lg',
            'hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none',
            'transition-colors duration-200',
            className
          )}
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// Basic infinite scroll component
export function InfiniteScroll<T>({
  items,
  loading,
  hasMore,
  error,
  onLoadMore,
  onRetry,
  renderItem,
  keyExtractor,
  threshold = 100,
  loadingComponent,
  errorComponent,
  emptyComponent,
  endMessage,
  className,
  itemClassName,
  reverse = false,
}: InfiniteScrollProps<T>) {
  const { observerRef } = useInfiniteScroll({
    loading,
    hasMore,
    onLoadMore,
    threshold,
    reverse,
  });

  const defaultLoadingComponent = (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading...</span>
      </div>
    </div>
  );

  const defaultErrorComponent = (
    <div className="flex flex-col items-center justify-center space-y-3 py-8">
      <AlertCircle className="h-8 w-8 text-red-500" />
      <div className="text-center">
        <p className="font-medium text-gray-900">Failed to load content</p>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  );

  const defaultEmptyComponent = (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <AlertCircle className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-2 text-lg font-medium text-gray-900">No items found</h3>
      <p className="text-gray-500">There are no items to display at the moment.</p>
    </div>
  );

  const defaultEndMessage = (
    <div className="flex items-center justify-center py-8">
      <p className="text-sm text-gray-500">You've reached the end!</p>
    </div>
  );

  // Handle empty state
  if (items.length === 0 && !loading && !error) {
    return <div className={className}>{emptyComponent || defaultEmptyComponent}</div>;
  }

  // Handle error state
  if (error && items.length === 0) {
    return <div className={className}>{errorComponent || defaultErrorComponent}</div>;
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Items */}
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <motion.div
            key={keyExtractor(item)}
            initial={{ opacity: 0, y: reverse ? -20 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reverse ? -20 : 20 }}
            transition={{ duration: 0.2 }}
            className={itemClassName}
          >
            {renderItem(item, index)}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Loading state */}
      {loading && (loadingComponent || defaultLoadingComponent)}

      {/* Error state (when there are existing items) */}
      {error && items.length > 0 && (
        <div className="py-4">{errorComponent || defaultErrorComponent}</div>
      )}

      {/* Load more trigger */}
      {!loading && hasMore && !error && (
        <div ref={observerRef} className="h-4" aria-hidden="true" />
      )}

      {/* End message */}
      {!loading && !hasMore && items.length > 0 && (endMessage || defaultEndMessage)}
    </div>
  );
}

// Virtualized infinite scroll for large lists
export function VirtualizedInfiniteScroll<T>({
  items,
  loading,
  hasMore,
  error,
  onLoadMore,
  onRetry,
  renderItem,
  keyExtractor,
  itemHeight,
  containerHeight,
  overscan = 5,
  className,
  ...props
}: VirtualizedInfiniteScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);

      // Check if we need to load more
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !loading) {
        onLoadMore();
      }
    },
    [hasMore, loading, onLoadMore]
  );

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  // Calculate total height and offset
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  // Get visible items
  const visibleItems = items.slice(startIndex, endIndex + 1);

  return (
    <div className={cn('relative', className)}>
      <div
        ref={containerRef}
        className="overflow-auto"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
            }}
          >
            {visibleItems.map((item, index) => (
              <div
                key={keyExtractor(item)}
                style={{ height: itemHeight }}
                className="flex items-center"
              >
                {renderItem(item, startIndex + index)}
              </div>
            ))}
          </div>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
          </div>
        )}
      </div>
    </div>
  );
}

// Chat-specific infinite scroll (reverse order)
interface ChatInfiniteScrollProps<T> extends Omit<InfiniteScrollProps<T>, 'reverse'> {
  onScrollToBottom?: () => void;
  showScrollToBottom?: boolean;
}

export function ChatInfiniteScroll<T>({
  items,
  loading,
  hasMore,
  error,
  onLoadMore,
  renderItem,
  keyExtractor,
  onScrollToBottom,
  showScrollToBottom = true,
  className,
  ...props
}: ChatInfiniteScrollProps<T>) {
  const [isAtBottom, setIsAtBottom] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const { observerRef } = useInfiniteScroll({
    loading,
    hasMore,
    onLoadMore,
    reverse: true,
  });

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const threshold = 50;

    setIsAtBottom(scrollHeight - scrollTop - clientHeight <= threshold);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
      onScrollToBottom?.();
    }
  }, [onScrollToBottom]);

  // Auto-scroll to bottom when new messages arrive (if already at bottom)
  useEffect(() => {
    if (isAtBottom && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [items.length, isAtBottom]);

  return (
    <div className={cn('relative h-full', className)}>
      <div ref={containerRef} className="h-full overflow-y-auto" onScroll={handleScroll}>
        {/* Load more trigger at top */}
        {hasMore && <div ref={observerRef} className="h-4" />}

        {/* Loading indicator at top */}
        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading older messages...</span>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-2 p-4">
          {items.map((item, index) => (
            <div key={keyExtractor(item)}>{renderItem(item, index)}</div>
          ))}
        </div>
      </div>

      {/* Scroll to bottom button */}
      {showScrollToBottom && !isAtBottom && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToBottom}
          className="absolute right-4 bottom-4 rounded-full bg-blue-600 p-3 text-white shadow-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          aria-label="Scroll to bottom"
        >
          <ChevronUp className="h-4 w-4 rotate-180 transform" />
        </motion.button>
      )}
    </div>
  );
}

// Hook for managing infinite scroll pagination
export function useInfiniteScrollPagination<T>({
  fetchFunction,
  pageSize = 20,
  initialData = [],
}: {
  fetchFunction: (page: number, pageSize: number) => Promise<{ items: T[]; hasMore: boolean }>;
  pageSize?: number;
  initialData?: T[];
}) {
  const [items, setItems] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction(page, pageSize);

      setItems(prev => [...prev, ...result.items]);
      setHasMore(result.hasMore);
      setPage(prev => prev + 1);

      ScreenReader.announce(`Loaded ${result.items.length} more items`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more items';
      setError(errorMessage);
      ScreenReader.announceError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, pageSize, fetchFunction]);

  const reset = useCallback(() => {
    setItems(initialData);
    setPage(1);
    setHasMore(true);
    setError(null);
    setLoading(false);
  }, [initialData]);

  const retry = useCallback(() => {
    setError(null);
    loadMore();
  }, [loadMore]);

  return {
    items,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
    retry,
  };
}
