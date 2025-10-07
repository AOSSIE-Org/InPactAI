import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import ErrorState from '@/components/ui/error-state';
import EmptyState from '@/components/ui/empty-state';

interface ChartDataPoint {
  date: string;
  reach: number;
  impressions: number;
  engagementRate: number;
  likes: number;
  comments: number;
  shares: number;
}

interface MetricsChartProps {
  data: ChartDataPoint[];
  chartType?: 'line' | 'bar' | 'pie';
  metric?: 'reach' | 'impressions' | 'engagementRate' | 'likes' | 'comments' | 'shares';
  title?: string;
  description?: string;
  loading?: boolean;
  error?: {
    type?: 'network' | 'api' | 'auth' | 'permission' | 'not-found' | 'rate-limit' | 'generic';
    message?: string;
  };
  onRetry?: () => void;
  onConnectAccounts?: () => void;
  retryLoading?: boolean;
}

const MetricsChart: React.FC<MetricsChartProps> = ({
  data,
  chartType = 'line',
  metric = 'reach',
  title = 'Performance Metrics',
  description = 'Track your content performance over time',
  loading = false,
  error,
  onRetry,
  onConnectAccounts,
  retryLoading = false
}) => {
  const colors = {
    reach: '#6366f1',
    impressions: '#8b5cf6',
    engagementRate: '#ec4899',
    likes: '#f59e0b',
    comments: '#3b82f6',
    shares: '#06b6d4'
  };

  const formatValue = (value: number, metricType: string) => {
    if (metricType === 'engagementRate') {
      return `${value.toFixed(1)}%`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${formatValue(entry.value, entry.dataKey)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="date" 
          stroke="#666"
          fontSize={12}
          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis 
          stroke="#666"
          fontSize={12}
          tickFormatter={(value) => formatValue(value, metric)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey={metric}
          stroke={colors[metric]}
          strokeWidth={2}
          dot={{ fill: colors[metric], strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: colors[metric], strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="date" 
          stroke="#666"
          fontSize={12}
          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis 
          stroke="#666"
          fontSize={12}
          tickFormatter={(value) => formatValue(value, metric)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey={metric} fill={colors[metric]} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => {
    const pieData = [
      { name: 'Likes', value: data.reduce((sum, d) => sum + d.likes, 0), color: colors.likes },
      { name: 'Comments', value: data.reduce((sum, d) => sum + d.comments, 0), color: colors.comments },
      { name: 'Shares', value: data.reduce((sum, d) => sum + d.shares, 0), color: colors.shares }
    ];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatValue(Number(value), 'number')} />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      default:
        return renderLineChart();
    }
  };

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorState
            type={error.type || 'generic'}
            title="Unable to Load Chart Data"
            message={error.message}
            onRetry={onRetry}
            retryLoading={retryLoading}
            onAction={error.type === 'auth' ? onConnectAccounts : undefined}
            actionLabel={error.type === 'auth' ? 'Connect Accounts' : undefined}
            size="sm"
          />
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-[300px] bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            type="analytics"
            title="No Chart Data Available"
            message="Connect your social accounts and link content to start tracking metrics over time."
            actionLabel="Connect Accounts"
            onAction={onConnectAccounts}
            size="sm"
            showIllustration={false}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default MetricsChart;