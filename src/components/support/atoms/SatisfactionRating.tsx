import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SatisfactionRatingProps {
  rating: number;
  maxRating?: number;
  showNumber?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  readonly?: boolean;
  onChange?: (rating: number) => void;
}

const sizeConfig = {
  sm: { star: 12, text: 'text-xs' },
  md: { star: 16, text: 'text-sm' },
  lg: { star: 20, text: 'text-base' },
};

export function SatisfactionRating({ 
  rating, 
  maxRating = 5, 
  showNumber = true, 
  size = 'md',
  className,
  readonly = true,
  onChange
}: SatisfactionRatingProps) {
  const config = sizeConfig[size];
  
  const handleStarClick = (starRating: number) => {
    if (!readonly && onChange) {
      onChange(starRating);
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= rating;
          
          return (
            <Star
              key={index}
              size={config.star}
              className={cn(
                'transition-colors',
                isFilled 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300',
                !readonly && 'cursor-pointer hover:text-yellow-400'
              )}
              onClick={() => handleStarClick(starValue)}
            />
          );
        })}
      </div>
      {showNumber && (
        <span className={cn(
          'font-medium text-gray-700',
          config.text
        )}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}