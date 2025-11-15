"use client";

import { X, Package, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface Deliverable {
  id: string;
  contract_deliverable_id: string;
  campaign_deliverable_id?: string;
  description: string;
  status: string;
  due_date?: string;
  platform: string;
  content_type?: string;
  quantity: number;
  guidance?: string;
}

interface PlatformDeliverablesModalProps {
  platform: string;
  deliverables: Deliverable[];
  onClose: () => void;
  onDeliverableClick: (deliverableId: string) => void;
}

export default function PlatformDeliverablesModal({
  platform,
  deliverables,
  onClose,
  onDeliverableClick,
}: PlatformDeliverablesModalProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{platform}</h2>
            <p className="mt-1 text-sm text-gray-600">
              {deliverables.length} deliverable{deliverables.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-100 p-2 hover:bg-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Deliverables List */}
        <div className="flex-1 overflow-y-auto p-6">
          {deliverables.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No deliverables found for this platform.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {deliverables.map((deliverable) => (
                <div
                  key={deliverable.id}
                  onClick={() => {
                    onDeliverableClick(deliverable.id);
                    onClose();
                  }}
                  className="cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-purple-500 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(deliverable.status)}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {deliverable.content_type || deliverable.description}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600">
                            {deliverable.description}
                          </p>
                          {deliverable.guidance && (
                            <p className="mt-2 text-xs text-gray-500">
                              {deliverable.guidance}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                        {deliverable.quantity > 1 && (
                          <span>Quantity: {deliverable.quantity}</span>
                        )}
                        {deliverable.due_date && (
                          <span>
                            Due: {new Date(deliverable.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`ml-4 rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(
                        deliverable.status
                      )}`}
                    >
                      {deliverable.status}
                    </span>
                  </div>
                  <div className="mt-3 text-sm text-purple-600">
                    Click to view metrics →
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

