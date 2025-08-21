import { SupportChannel } from '@/lib/api/types';
import { 
  Mail, 
  MessageCircle, 
  Phone, 
  Globe, 
  Share2, 
  Smartphone, 
  Code 
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ChannelIconProps {
  channel: SupportChannel;
  className?: string;
  size?: number;
}

const channelIconMap = {
  [SupportChannel.EMAIL]: Mail,
  [SupportChannel.CHAT]: MessageCircle,
  [SupportChannel.PHONE]: Phone,
  [SupportChannel.WEB_FORM]: Globe,
  [SupportChannel.SOCIAL_MEDIA]: Share2,
  [SupportChannel.IN_APP]: Smartphone,
  [SupportChannel.API]: Code,
};

const channelColorMap = {
  [SupportChannel.EMAIL]: 'text-blue-600',
  [SupportChannel.CHAT]: 'text-green-600',
  [SupportChannel.PHONE]: 'text-purple-600',
  [SupportChannel.WEB_FORM]: 'text-orange-600',
  [SupportChannel.SOCIAL_MEDIA]: 'text-pink-600',
  [SupportChannel.IN_APP]: 'text-indigo-600',
  [SupportChannel.API]: 'text-gray-600',
};

export function ChannelIcon({ channel, className, size = 16 }: ChannelIconProps) {
  const IconComponent = channelIconMap[channel] || MessageCircle;
  const colorClass = channelColorMap[channel] || 'text-gray-600';

  return (
    <IconComponent 
      size={size}
      className={cn(colorClass, className)} 
    />
  );
}