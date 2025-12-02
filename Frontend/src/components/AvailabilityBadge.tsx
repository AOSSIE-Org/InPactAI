import { CheckCircle, Clock, XCircle } from 'lucide-react';

type AvailabilityStatus = 'available' | 'busy' | 'not_looking';

interface AvailabilityBadgeProps {
  status: AvailabilityStatus;
  message?: string | null;
  size?: 'sm' | 'md' | 'lg';
  showMessage?: boolean;
}

export default function AvailabilityBadge({ 
  status, 
  message, 
  size = 'md',
  showMessage = true 
}: AvailabilityBadgeProps) {
  const getConfig = () => {
    switch (status) {
      case 'available':
        return {
          icon: CheckCircle,
          label: 'Available',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-300',
          dotColor: 'bg-green-500'
        };
      case 'busy':
        return {
          icon: Clock,
          label: 'Busy',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-300',
          dotColor: 'bg-yellow-500'
        };
      case 'not_looking':
        return {
          icon: XCircle,
          label: 'Not Available',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600',
          borderColor: 'border-gray-300',
          dotColor: 'bg-gray-500'
        };
      default:
        return {
          icon: CheckCircle,
          label: 'Available',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-300',
          dotColor: 'bg-green-500'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          badge: 'px-2 py-0.5 text-xs',
          icon: 'h-3 w-3',
          dot: 'h-2 w-2'
        };
      case 'lg':
        return {
          badge: 'px-4 py-2 text-base',
          icon: 'h-5 w-5',
          dot: 'h-3 w-3'
        };
      default: // md
        return {
          badge: 'px-3 py-1 text-sm',
          icon: 'h-4 w-4',
          dot: 'h-2.5 w-2.5'
        };
    }
  };

  const config = getConfig();
  const sizeClasses = getSizeClasses();
  const Icon = config.icon;

  return (
    <div className="inline-flex flex-col gap-1">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses.badge}`}
      >
        <span className={`${config.dotColor} rounded-full ${sizeClasses.dot} animate-pulse`}></span>
        <Icon className={sizeClasses.icon} />
        {config.label}
      </span>
      {showMessage && message && (
        <span className="text-xs text-gray-600 italic px-2">
          "{message}"
        </span>
      )}
    </div>
  );
}
