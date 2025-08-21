import { SupportAgent } from '@/lib/api/types';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { StatusBadge } from './StatusBadge';
import { SatisfactionRating } from './SatisfactionRating';
import { 
  User, 
  Clock, 
  CheckCircle, 
  MessageSquare, 
  Award,
  Globe,
  Calendar
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils/cn';

interface AgentCardProps {
  agent: SupportAgent;
  onClick?: () => void;
  onStatusChange?: (status: string) => void;
  className?: string;
  delay?: number;
  showActions?: boolean;
}

export function AgentCard({ 
  agent, 
  onClick, 
  onStatusChange, 
  className,
  delay = 0,
  showActions = true
}: AgentCardProps) {
  const workloadPercentage = (agent.currentWorkload / agent.maxWorkload) * 100;
  const isNearCapacity = workloadPercentage >= 80;
  const isAtCapacity = workloadPercentage >= 100;

  return (
    <AnimatedCard delay={delay} className={className}>
      <div className="p-6 cursor-pointer hover:shadow-sm transition-shadow" onClick={onClick}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {agent.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{agent.name}</h3>
              <p className="text-sm text-gray-600">{agent.email}</p>
            </div>
          </div>
          <StatusBadge status={agent.status} type="agent" />
        </div>

        {/* Workload Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Workload</span>
            <span className="text-sm text-gray-600">
              {agent.currentWorkload}/{agent.maxWorkload}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={cn(
                'h-2 rounded-full transition-all',
                isAtCapacity 
                  ? 'bg-red-500' 
                  : isNearCapacity 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
              )}
              style={{ width: `${Math.min(workloadPercentage, 100)}%` }}
            />
          </div>
          {isAtCapacity && (
            <p className="text-xs text-red-600 mt-1">At full capacity</p>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle size={16} className="text-green-600" />
            </div>
            <p className="text-sm font-bold text-gray-900">{agent.totalTicketsResolved}</p>
            <p className="text-xs text-gray-600">Resolved</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Clock size={16} className="text-blue-600" />
            </div>
            <p className="text-sm font-bold text-gray-900">{agent.averageResolutionTime}h</p>
            <p className="text-xs text-gray-600">Avg Time</p>
          </div>
        </div>

        {/* Satisfaction Rating */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Satisfaction</span>
            <SatisfactionRating 
              rating={agent.customerSatisfactionRating} 
              size="sm"
              showNumber={true}
            />
          </div>
        </div>

        {/* Skills */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
          <div className="flex flex-wrap gap-1">
            {agent.skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
              >
                {skill}
              </span>
            ))}
            {agent.skills.length > 3 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{agent.skills.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Globe size={12} />
            <span>{agent.timezone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={12} />
            <span>Last active: {formatDistanceToNow(new Date(agent.lastActiveAt), { addSuffix: true })}</span>
          </div>
          {agent.languagesSpoken && agent.languagesSpoken.length > 0 && (
            <div className="flex items-center gap-2">
              <MessageSquare size={12} />
              <span>{agent.languagesSpoken.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Certifications */}
        {agent.certifications && agent.certifications.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Award size={12} className="text-yellow-500" />
              <span className="text-xs font-medium text-gray-700">Certifications</span>
            </div>
            <div className="space-y-1">
              {agent.certifications.slice(0, 2).map((cert, index) => (
                <p key={index} className="text-xs text-gray-600">{cert}</p>
              ))}
              {agent.certifications.length > 2 && (
                <p className="text-xs text-gray-500">
                  +{agent.certifications.length - 2} more
                </p>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {showActions && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick?.();
                }}
                className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 rounded font-medium transition-colors"
              >
                View Details
              </button>
              {agent.status === 'available' && agent.currentWorkload < agent.maxWorkload && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle assign ticket action
                  }}
                  className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1 rounded font-medium transition-colors"
                >
                  Assign Ticket
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </AnimatedCard>
  );
}