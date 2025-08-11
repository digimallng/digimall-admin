'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Reply, Heart, Forward, Trash2, Archive, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';

// Haptic feedback utilities
export class HapticFeedback {
  static isSupported(): boolean {
    return 'vibrate' in navigator;
  }

  static light() {
    if (this.isSupported()) {
      navigator.vibrate(10);
    }
  }

  static medium() {
    if (this.isSupported()) {
      navigator.vibrate(30);
    }
  }

  static heavy() {
    if (this.isSupported()) {
      navigator.vibrate(50);
    }
  }

  static success() {
    if (this.isSupported()) {
      navigator.vibrate([10, 50, 10]);
    }
  }

  static error() {
    if (this.isSupported()) {
      navigator.vibrate([50, 30, 50, 30, 50]);
    }
  }

  static selection() {
    if (this.isSupported()) {
      navigator.vibrate(15);
    }
  }

  static impact() {
    if (this.isSupported()) {
      navigator.vibrate([10, 30, 10]);
    }
  }
}

// Touch gesture hook
export function useSwipeGestures({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  enableHaptics = true
}: {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  enableHaptics?: boolean;
}) {
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setStartPos({ x: touch.clientX, y: touch.clientY });
    setIsDragging(true);
    
    if (enableHaptics) {
      HapticFeedback.selection();
    }
  }, [enableHaptics]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    
    // Optional: Add real-time feedback during swipe
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.x;
    const deltaY = touch.clientY - startPos.y;
    
    // Light haptic feedback when crossing threshold
    if (enableHaptics && (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold)) {
      HapticFeedback.light();
    }
  }, [isDragging, startPos, threshold, enableHaptics]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startPos.x;
    const deltaY = touch.clientY - startPos.y;
    
    setIsDragging(false);

    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          onSwipeRight?.();
          if (enableHaptics) HapticFeedback.success();
        } else {
          onSwipeLeft?.();
          if (enableHaptics) HapticFeedback.success();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          onSwipeDown?.();
          if (enableHaptics) HapticFeedback.success();
        } else {
          onSwipeUp?.();
          if (enableHaptics) HapticFeedback.success();
        }
      }
    }
  }, [isDragging, startPos, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, enableHaptics]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    isDragging
  };
}

// Swipeable message component
interface SwipeableMessageProps {
  children: React.ReactNode;
  onReply?: () => void;
  onDelete?: () => void;
  onForward?: () => void;
  onArchive?: () => void;
  onLike?: () => void;
  onPin?: () => void;
  isOwn?: boolean;
  className?: string;
}

export function SwipeableMessage({
  children,
  onReply,
  onDelete,
  onForward,
  onArchive,
  onLike,
  onPin,
  isOwn = false,
  className
}: SwipeableMessageProps) {
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const [actionTriggered, setActionTriggered] = useState<string | null>(null);

  // Transform values for visual feedback
  const opacity = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);
  const scale = useTransform(x, [-100, 0, 100], [0.95, 1, 0.95]);

  // Action thresholds
  const REPLY_THRESHOLD = isOwn ? -80 : 80;
  const DELETE_THRESHOLD = isOwn ? 80 : -80;
  const ARCHIVE_THRESHOLD = 120;

  const handleDragStart = () => {
    setIsDragging(true);
    HapticFeedback.selection();
  };

  const handleDrag = (event: any, info: PanInfo) => {
    const offset = info.offset.x;
    
    // Provide haptic feedback at thresholds
    if (!actionTriggered) {
      if ((Math.abs(offset) > 80 && Math.abs(offset) < 85)) {
        HapticFeedback.medium();
        setActionTriggered('primary');
      } else if (Math.abs(offset) > 120 && Math.abs(offset) < 125) {
        HapticFeedback.heavy();
        setActionTriggered('secondary');
      }
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    setActionTriggered(null);

    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // Determine action based on swipe distance and direction
    if (Math.abs(offset) > 80 || Math.abs(velocity) > 500) {
      if (isOwn) {
        // Own messages: swipe left to reply, right to delete
        if (offset < REPLY_THRESHOLD && onReply) {
          onReply();
          HapticFeedback.success();
        } else if (offset > DELETE_THRESHOLD && onDelete) {
          onDelete();
          HapticFeedback.error();
        }
      } else {
        // Other messages: swipe right to reply, left to archive
        if (offset > REPLY_THRESHOLD && onReply) {
          onReply();
          HapticFeedback.success();
        } else if (offset < DELETE_THRESHOLD && onArchive) {
          onArchive();
          HapticFeedback.impact();
        }
      }
    }

    // Reset position
    x.set(0);
  };

  // Left action (reply for others, delete for own)
  const leftAction = isOwn ? (
    onDelete && (
      <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-20 bg-red-500 rounded-l-lg">
        <Trash2 className="h-5 w-5 text-white" />
      </div>
    )
  ) : (
    onArchive && (
      <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-20 bg-gray-500 rounded-r-lg">
        <Archive className="h-5 w-5 text-white" />
      </div>
    )
  );

  // Right action (delete for others, reply for own)
  const rightAction = isOwn ? (
    onReply && (
      <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-20 bg-blue-500 rounded-r-lg">
        <Reply className="h-5 w-5 text-white" />
      </div>
    )
  ) : (
    onReply && (
      <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-20 bg-blue-500 rounded-l-lg">
        <Reply className="h-5 w-5 text-white" />
      </div>
    )
  );

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Action backgrounds */}
      {leftAction}
      {rightAction}

      {/* Draggable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 150 }}
        dragElastic={0.2}
        style={{ 
          x, 
          opacity,
          scale
        }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className={cn(
          'relative z-10 bg-inherit',
          isDragging && 'cursor-grabbing'
        )}
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.div>

      {/* Visual indicators */}
      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-1/2 transform -translate-y-1/2 pointer-events-none z-20"
          style={{
            left: isOwn ? '10px' : 'auto',
            right: !isOwn ? '10px' : 'auto',
          }}
        >
          <div className="w-1 h-8 bg-blue-400 rounded-full opacity-60" />
        </motion.div>
      )}
    </div>
  );
}

// Pull-to-refresh component
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const y = useMotionValue(0);
  
  const REFRESH_THRESHOLD = 80;
  const MAX_PULL_DISTANCE = 120;

  const handleDragEnd = async (event: any, info: PanInfo) => {
    if (info.offset.y > REFRESH_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      HapticFeedback.success();
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    y.set(0);
    setPullDistance(0);
  };

  const handleDrag = (event: any, info: PanInfo) => {
    const distance = Math.max(0, Math.min(info.offset.y, MAX_PULL_DISTANCE));
    setPullDistance(distance);
    
    // Haptic feedback at threshold
    if (distance > REFRESH_THRESHOLD && distance < REFRESH_THRESHOLD + 5) {
      HapticFeedback.medium();
    }
  };

  const refreshProgress = Math.min(pullDistance / REFRESH_THRESHOLD, 1);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Pull indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center z-20 bg-gray-50"
        style={{
          height: pullDistance,
          opacity: pullDistance > 20 ? 1 : 0,
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <motion.div
            animate={{ rotate: isRefreshing ? 360 : refreshProgress * 180 }}
            transition={{ duration: isRefreshing ? 1 : 0, repeat: isRefreshing ? Infinity : 0 }}
            className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
          />
          <span className="text-xs text-gray-600">
            {isRefreshing ? 'Refreshing...' : pullDistance > REFRESH_THRESHOLD ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.3}
        style={{ y }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className="relative z-10"
      >
        <div style={{ paddingTop: pullDistance }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

// Long press hook
export function useLongPress(
  onLongPress: () => void,
  delay: number = 500,
  enableHaptics: boolean = true
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  const start = useCallback(() => {
    setIsPressed(true);
    if (enableHaptics) {
      HapticFeedback.selection();
    }
    
    timeoutRef.current = setTimeout(() => {
      onLongPress();
      if (enableHaptics) {
        HapticFeedback.heavy();
      }
    }, delay);
  }, [onLongPress, delay, enableHaptics]);

  const clear = useCallback(() => {
    setIsPressed(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    onTouchStart: start,
    onTouchEnd: clear,
    onTouchCancel: clear,
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    isPressed
  };
}

// Gesture-enabled conversation list item
interface SwipeableConversationProps {
  conversation: any;
  onArchive: () => void;
  onDelete: () => void;
  onPin: () => void;
  onMute: () => void;
  children: React.ReactNode;
  className?: string;
}

export function SwipeableConversation({
  conversation,
  onArchive,
  onDelete,
  onPin,
  onMute,
  children,
  className
}: SwipeableConversationProps) {
  const x = useMotionValue(0);
  const [currentAction, setCurrentAction] = useState<string | null>(null);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const offset = info.offset.x;
    
    if (Math.abs(offset) > 100) {
      if (offset > 0) {
        // Swipe right - archive
        onArchive();
        HapticFeedback.success();
      } else {
        // Swipe left - delete
        onDelete();
        HapticFeedback.error();
      }
    } else if (Math.abs(offset) > 50) {
      if (offset > 0) {
        // Partial swipe right - pin
        onPin();
        HapticFeedback.medium();
      } else {
        // Partial swipe left - mute
        onMute();
        HapticFeedback.medium();
      }
    }

    x.set(0);
    setCurrentAction(null);
  };

  const handleDrag = (event: any, info: PanInfo) => {
    const offset = info.offset.x;
    
    if (Math.abs(offset) > 100) {
      const action = offset > 0 ? 'archive' : 'delete';
      if (currentAction !== action) {
        setCurrentAction(action);
        HapticFeedback.heavy();
      }
    } else if (Math.abs(offset) > 50) {
      const action = offset > 0 ? 'pin' : 'mute';
      if (currentAction !== action) {
        setCurrentAction(action);
        HapticFeedback.medium();
      }
    } else if (currentAction) {
      setCurrentAction(null);
    }
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Action backgrounds */}
      <div className="absolute left-0 top-0 bottom-0 flex">
        <div className="w-16 bg-blue-500 flex items-center justify-center">
          <Pin className="h-5 w-5 text-white" />
        </div>
        <div className="w-16 bg-green-500 flex items-center justify-center">
          <Archive className="h-5 w-5 text-white" />
        </div>
      </div>
      
      <div className="absolute right-0 top-0 bottom-0 flex">
        <div className="w-16 bg-yellow-500 flex items-center justify-center">
          <span className="text-white text-lg">🔇</span>
        </div>
        <div className="w-16 bg-red-500 flex items-center justify-center">
          <Trash2 className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Draggable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -160, right: 160 }}
        dragElastic={0.1}
        style={{ x }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className="relative z-10 bg-white"
      >
        {children}
      </motion.div>
    </div>
  );
}