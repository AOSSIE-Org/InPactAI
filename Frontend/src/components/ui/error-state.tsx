import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  AlertTriangle, 
  Wifi, 
  RefreshCw, 
  Settings, 
  ExternalLink,
  AlertCircle,
  XCircle
} from 'lucide-react';

export interface ErrorStateProps {
  type?: 'network' | 'api' | 'auth' | 'permission' | 'not-found' | 'rate-limit' | 'generic';
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  showRetry?: boolean;
  onRetry?: () => void;
  retryLoading?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ErrorState: React.FC<ErrorStateProps> = ({
  type = 'generic',
  title,
  message,
  actionLabel,
  onAction,
  showRetry = true,
  onRetry,
  retryLoading = false,
  className = '',
  size = 'md'
}) => {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: <Wifi className="h-8 w-8 text-red-500" />,
          defaultTitle: 'Connection Error',
          defaultMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
          iconBg: 'bg-red-100',
          actionLabel: 'Check Connection',
          actionIcon: <ExternalLink className="h-4 w-4" />
        };
      case 'api':
        return {
          icon: <AlertTriangle className="h-8 w-8 text-orange-500" />,
          defaultTitle: 'Service Error',
          defaultMessage: 'We encountered an issue while processing your request. Please try again in a moment.',
          iconBg: 'bg-orange-100',
          actionLabel: 'Contact Support',
          actionIcon: <ExternalLink className="h-4 w-4" />
        };
      case 'auth':
        return {
          icon: <XCircle className="h-8 w-8 text-red-500" />,
          defaultTitle: 'Authentication Required',
          defaultMessage: 'Your session has expired. Please sign in again to continue.',
          iconBg: 'bg-red-100',
          actionLabel: 'Sign In',
          actionIcon: <ExternalLink className="h-4 w-4" />
        };
      case 'permission':
        return {
          icon: <AlertCircle className="h-8 w-8 text-yellow-500" />,
          defaultTitle: 'Access Denied',
          defaultMessage: 'You don\'t have permission to access this resource. Please contact your administrator.',
          iconBg: 'bg-yellow-100',
          actionLabel: 'Go Back',
          actionIcon: null
        };
      case 'not-found':
        return {
          icon: <AlertCircle className="h-8 w-8 text-gray-500" />,
          defaultTitle: 'Not Found',
          defaultMessage: 'The requested resource could not be found.',
          iconBg: 'bg-gray-100',
          actionLabel: 'Go Home',
          actionIcon: null
        };
      case 'rate-limit':
        return {
          icon: <AlertTriangle className="h-8 w-8 text-orange-500" />,
          defaultTitle: 'Rate Limit Exceeded',
          defaultMessage: 'Too many requests. Please wait a moment before trying again.',
          iconBg: 'bg-orange-100',
          actionLabel: 'Learn More',
          actionIcon: <ExternalLink className="h-4 w-4" />
        };
      default:
        return {
          icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
          defaultTitle: 'Something went wrong',
          defaultMessage: 'An unexpected error occurred. Please try again.',
          iconBg: 'bg-red-100',
          actionLabel: 'Get Help',
          actionIcon: <ExternalLink className="h-4 w-4" />
        };
    }
  };

  const config = getErrorConfig();
  const displayTitle = title || config.defaultTitle;
  const displayMessage = message || config.defaultMessage;
  const displayActionLabel = actionLabel || config.actionLabel;

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-10 w-10'
  };

  const textSizes = {
    sm: {
      title: 'text-base',
      message: 'text-sm'
    },
    md: {
      title: 'text-lg',
      message: 'text-sm'
    },
    lg: {
      title: 'text-xl',
      message: 'text-base'
    }
  };

  return (
    <Card className={`border-0 shadow-none ${className}`}>
      <CardContent className={`text-center ${sizeClasses[size]}`}>
        <div className={`w-16 h-16 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
          {React.cloneElement(config.icon, { 
            className: `${iconSizes[size]} ${config.icon.props.className}` 
          })}
        </div>
        
        <h3 className={`font-semibold text-gray-900 mb-2 ${textSizes[size].title}`}>
          {displayTitle}
        </h3>
        
        <p className={`text-gray-600 mb-6 max-w-md mx-auto ${textSizes[size].message}`}>
          {displayMessage}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showRetry && onRetry && (
            <Button
              onClick={onRetry}
              disabled={retryLoading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${retryLoading ? 'animate-spin' : ''}`} />
              <span>{retryLoading ? 'Retrying...' : 'Try Again'}</span>
            </Button>
          )}
          
          {onAction && (
            <Button
              onClick={onAction}
              className="flex items-center space-x-2"
            >
              <span>{displayActionLabel}</span>
              {config.actionIcon}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorState;