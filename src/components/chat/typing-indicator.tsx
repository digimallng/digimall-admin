'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  isTyping: boolean;
  userName?: string;
  avatar?: string;
  className?: string;
}

interface TypingDotsProps {
  className?: string;
}

function TypingDots({ className }: TypingDotsProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 bg-gray-400 rounded-full"
          animate={{
            y: [0, -4, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export function TypingIndicator({ 
  isTyping, 
  userName = 'Someone', 
  avatar, 
  className 
}: TypingIndicatorProps) {
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (isTyping) {
      setShowIndicator(true);
    } else {
      // Delay hiding to allow for smooth animation
      const timer = setTimeout(() => setShowIndicator(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isTyping]);

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, y: 10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn('px-6 py-2', className)}
        >
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt={userName}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Typing bubble */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-md"
            >
              <div className="flex items-center gap-2">
                <TypingDots />
                <span className="text-xs text-gray-500 font-medium">
                  {userName} is typing...
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface MultipleTypingIndicatorProps {
  typingUsers: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  className?: string;
}

export function MultipleTypingIndicator({ typingUsers, className }: MultipleTypingIndicatorProps) {
  const count = typingUsers.length;
  
  if (count === 0) return null;

  const getTypingText = () => {
    if (count === 1) {
      return `${typingUsers[0].name} is typing...`;
    } else if (count === 2) {
      return `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`;
    } else {
      return `${typingUsers[0].name} and ${count - 1} others are typing...`;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={cn('px-6 py-2', className)}
      >
        <div className="flex items-center gap-3">
          {/* Avatars stack */}
          <div className="flex -space-x-2">
            {typingUsers.slice(0, 3).map((user, index) => (
              <div
                key={user.id}
                className="relative"
                style={{ zIndex: 10 - index }}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-6 h-6 rounded-full border-2 border-white"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Typing bubble */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-md"
          >
            <div className="flex items-center gap-2">
              <TypingDots />
              <span className="text-xs text-gray-500 font-medium">
                {getTypingText()}
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook for managing typing state
export function useTypingIndicator(
  conversationId: string,
  onTypingUpdate?: (isTyping: boolean) => void
) {
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const startTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      onTypingUpdate?.(true);
    }

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout to stop typing after 3 seconds of inactivity
    const timeout = setTimeout(() => {
      setIsTyping(false);
      onTypingUpdate?.(false);
    }, 3000);

    setTypingTimeout(timeout);
  };

  const stopTyping = () => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
    if (isTyping) {
      setIsTyping(false);
      onTypingUpdate?.(false);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  return {
    isTyping,
    startTyping,
    stopTyping,
  };
}