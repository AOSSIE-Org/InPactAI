import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  BarChart3, 
  Users, 
  FileText, 
  Settings, 
  Link,
  TrendingUp,
  Calendar,
  Search,
  Database
} from 'lucide-react';

export interface EmptyStateProps {
  type?: 'analytics' | 'content' | 'contracts' | 'audience' | 'exports' | 'alerts' | 'search' | 'generic';
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIllustration?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'generic',
  title,
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
  size = 'md',
  showIllustration = true
}) => {
  const getEmptyStateConfig = () => {
    switch (type) {
      case 'analytics':
        return {
          icon: <BarChart3 className="h-12 w-12 text-blue-500" />,
          defaultTitle: 'No Analytics Data',
          defaultMessage: 'Connect your social media accounts and link content to start tracking performance metrics.',
          iconBg: 'bg-blue-100',
          actionLabel: 'Connect Accounts',
          actionIcon: <Plus className="h-4 w-4" />,
          secondaryActionLabel: 'Learn More'
        };
      case 'content':
        return {
          icon: <Link className="h-12 w-12 text-green-500" />,
          defaultTitle: 'No Content Linked',
          defaultMessage: 'Link your social media content to contracts to start tracking performance and ROI.',
          iconBg: 'bg-green-100',
          actionLabel: 'Link Content',
          actionIcon: <Plus className="h-4 w-4" />,
          secondaryActionLabel: 'View Guide'
        };
      case 'contracts':
        return {
          icon: <FileText className="h-12 w-12 text-purple-500" />,
          defaultTitle: 'No Contracts Yet',
          defaultMessage: 'Create your first sponsorship contract to start collaborating with brands and creators.',
          iconBg: 'bg-purple-100',
          actionLabel: 'Create Contract',
          actionIcon: <Plus className="h-4 w-4" />,
          secondaryActionLabel: 'Browse Templates'
        };
      case 'audience':
        return {
          icon: <Users className="h-12 w-12 text-orange-500" />,
          defaultTitle: 'No Audience Data',
          defaultMessage: 'Connect your social accounts and link content to view detailed audience demographics and insights.',
          iconBg: 'bg-orange-100',
          actionLabel: 'Connect Accounts',
          actionIcon: <Settings className="h-4 w-4" />,
          secondaryActionLabel: 'Link Content'
        };
      case 'exports':
        return {
          icon: <Database className="h-12 w-12 text-indigo-500" />,
          defaultTitle: 'No Exports Yet',
          defaultMessage: 'Export your analytics data to create custom reports and share insights with stakeholders.',
          iconBg: 'bg-indigo-100',
          actionLabel: 'Create Export',
          actionIcon: <Plus className="h-4 w-4" />,
          secondaryActionLabel: 'View Samples'
        };
      case 'alerts':
        return {
          icon: <TrendingUp className="h-12 w-12 text-red-500" />,
          defaultTitle: 'No Alerts Configured',
          defaultMessage: 'Set up performance alerts to get notified when your campaigns need attention or are performing well.',
          iconBg: 'bg-red-100',
          actionLabel: 'Create Alert',
          actionIcon: <Plus className="h-4 w-4" />,
          secondaryActionLabel: 'Learn About Alerts'
        };
      case 'search':
        return {
          icon: <Search className="h-12 w-12 text-gray-500" />,
          defaultTitle: 'No Results Found',
          defaultMessage: 'Try adjusting your search criteria or filters to find what you\'re looking for.',
          iconBg: 'bg-gray-100',
          actionLabel: 'Clear Filters',
          actionIcon: null,
          secondaryActionLabel: 'Reset Search'
        };
      default:
        return {
          icon: <Calendar className="h-12 w-12 text-gray-500" />,
          defaultTitle: 'No Data Available',
          defaultMessage: 'There\'s no data to display at the moment. Try refreshing or check back later.',
          iconBg: 'bg-gray-100',
          actionLabel: 'Refresh',
          actionIcon: null,
          secondaryActionLabel: 'Get Help'
        };
    }
  };

  const config = getEmptyStateConfig();
  const displayTitle = title || config.defaultTitle;
  const displayMessage = message || config.defaultMessage;
  const displayActionLabel = actionLabel || config.actionLabel;
  const displaySecondaryActionLabel = secondaryActionLabel || config.secondaryActionLabel;

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-8',
    lg: 'p-12'
  };

  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const containerSizes = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-24 h-24'
  };

  const textSizes = {
    sm: {
      title: 'text-base',
      message: 'text-sm'
    },
    md: {
      title: 'text-xl',
      message: 'text-base'
    },
    lg: {
      title: 'text-2xl',
      message: 'text-lg'
    }
  };

  const Illustration: React.FC = () => {
    if (!showIllustration) return null;

    return (
      <div className="mb-6">
        <div className={`${containerSizes[size]} ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
          {React.cloneElement(config.icon, { 
            className: `${iconSizes[size]} ${config.icon.props.className}` 
          })}
        </div>
        
        {/* Optional decorative elements */}
        <div className="flex justify-center space-x-2 opacity-30">
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    );
  };

  return (
    <Card className={`border-0 shadow-none ${className}`}>
      <CardContent className={`text-center ${sizeClasses[size]}`}>
        <Illustration />
        
        <h3 className={`font-semibold text-gray-900 mb-3 ${textSizes[size].title}`}>
          {displayTitle}
        </h3>
        
        <p className={`text-gray-600 mb-8 max-w-md mx-auto leading-relaxed ${textSizes[size].message}`}>
          {displayMessage}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onAction && (
            <Button
              onClick={onAction}
              className="flex items-center space-x-2"
            >
              {config.actionIcon}
              <span>{displayActionLabel}</span>
            </Button>
          )}
          
          {onSecondaryAction && (
            <Button
              onClick={onSecondaryAction}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <span>{displaySecondaryActionLabel}</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyState;