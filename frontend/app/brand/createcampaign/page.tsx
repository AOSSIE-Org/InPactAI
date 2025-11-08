"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import SlidingMenu from "@/components/SlidingMenu";
import { Eye, PlusCircle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BrandCreateCampaign() {
  const router = useRouter();

  return (
    <AuthGuard requiredRole="Brand">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <SlidingMenu role="brand" />

        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-3">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-gray-900">
              Campaign Management
            </h1>
            <p className="text-lg text-gray-600">
              Create new campaigns or manage your existing ones
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* View All Campaigns Card */}
            <div
              onClick={() => router.push("/brand/campaigns")}
              className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 text-white">
                <Eye className="mb-4 h-12 w-12" />
                <h2 className="mb-2 text-2xl font-bold">View All Campaigns</h2>
                <p className="text-blue-100">
                  Browse, search, and manage your existing campaigns
                </p>
              </div>
              <div className="p-8">
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2 text-blue-500">✓</span>
                    <span>View all your campaigns in one place</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-blue-500">✓</span>
                    <span>Search and filter by status, date, or name</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-blue-500">✓</span>
                    <span>See campaign performance and details</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-blue-500">✓</span>
                    <span>Track applications and collaborations</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <button className="w-full rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-600">
                    Go to Campaigns
                  </button>
                </div>
              </div>
            </div>

            {/* Create New Campaign Card */}
            <div
              onClick={() => router.push("/brand/campaigns/create")}
              className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-8 text-white">
                <PlusCircle className="mb-4 h-12 w-12" />
                <h2 className="mb-2 text-2xl font-bold">Create New Campaign</h2>
                <p className="text-purple-100">
                  Launch a new influencer marketing campaign
                </p>
              </div>
              <div className="p-8">
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2 text-purple-500">✓</span>
                    <span>Set campaign goals and objectives</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-purple-500">✓</span>
                    <span>Define target audience and platforms</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-purple-500">✓</span>
                    <span>Specify budget and deliverables</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-purple-500">✓</span>
                    <span>Find the perfect creators for your brand</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <button className="w-full rounded-lg bg-purple-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-600">
                    Start Creating
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">
                  Total Campaigns
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
              </div>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">
                  Active Campaigns
                </p>
                <p className="mt-2 text-3xl font-bold text-green-600">-</p>
              </div>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">
                  Applications
                </p>
                <p className="mt-2 text-3xl font-bold text-blue-600">-</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
