"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getBrandDashboardStats, BrandDashboardStats } from "@/lib/api/analytics";
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Activity,
  Loader2,
} from "lucide-react";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

export default function BrandDashboard() {
  const [stats, setStats] = useState<BrandDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await getBrandDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const { overview, platform_distribution, status_distribution, monthly_campaigns, monthly_engagement } = stats;

  // Prepare data for charts
  const platformData = Object.entries(platform_distribution).map(([name, value]) => ({
    name,
    value,
  }));

  const statusData = Object.entries(status_distribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const monthlyCampaignsData = Object.entries(monthly_campaigns)
    .sort()
    .map(([month, count]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-US", { month: "short" }),
      campaigns: count,
    }));

  const monthlyEngagementData = Object.entries(monthly_engagement)
    .sort()
    .map(([month, engagement]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-US", { month: "short" }),
      engagement: Math.round(engagement),
    }));

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{overview.total_campaigns}</p>
              <p className="mt-1 text-xs text-gray-500">
                {overview.active_campaigns} active
              </p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                ${overview.total_budget.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-gray-500">All campaigns</p>
            </div>
            <div className="rounded-lg bg-green-100 p-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Engagement</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {overview.total_engagement.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Avg: {overview.avg_engagement.toFixed(0)}
              </p>
            </div>
            <div className="rounded-lg bg-purple-100 p-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Contracts</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{overview.active_contracts}</p>
              <p className="mt-1 text-xs text-gray-500">
                {overview.total_contracts} total
              </p>
            </div>
            <div className="rounded-lg bg-orange-100 p-3">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-600">Proposals</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{overview.total_proposals}</p>
          <p className="text-xs text-gray-500">{overview.accepted_proposals} accepted</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-600">Deliverables</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{overview.total_deliverables}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-600">Metrics</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{overview.total_metrics}</p>
          <p className="text-xs text-gray-500">{overview.metrics_with_updates} with updates</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-600">Campaign Status</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{overview.active_campaigns}</p>
          <p className="text-xs text-gray-500">{overview.completed_campaigns} completed</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Campaign Status Distribution */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Campaign Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Distribution */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Platform Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={platformData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Campaigns */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Campaigns Created (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyCampaignsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="campaigns"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Campaigns"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Engagement */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Engagement Trend (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyEngagementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="engagement"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Engagement"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

