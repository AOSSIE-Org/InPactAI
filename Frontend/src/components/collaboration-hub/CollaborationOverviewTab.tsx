import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { Edit, BarChart3, Users } from "lucide-react";

export default function CollaborationOverviewTab({
  collaboration,
  isEditingUpdate,
  editedUpdate,
  handleEditUpdate,
  handleSaveUpdate,
  handleCancelEdit,
  setEditedUpdate
}: {
  collaboration: any;
  isEditingUpdate: boolean;
  editedUpdate: string;
  handleEditUpdate: () => void;
  handleSaveUpdate: () => void;
  handleCancelEdit: () => void;
  setEditedUpdate: (v: string) => void;
}) {
  return (
    <>
      {/* Collaboration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Collaboration Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Project Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="font-medium">{collaboration.startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium">{collaboration.dueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Content Type:</span>
                  <span className="font-medium">{collaboration.collaborator.contentType}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Progress</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Deliverables:</span>
                  <span className="font-medium">{collaboration.deliverables.completed}/{collaboration.deliverables.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Messages:</span>
                  <span className="font-medium">{collaboration.messages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Activity:</span>
                  <span className="font-medium">{collaboration.lastActivity}</span>
                </div>
              </div>
            </div>
          </div>
          <Separator />
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">Latest Update</h4>
              {!isEditingUpdate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditUpdate}
                  className="h-6 px-2 text-xs"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>
            {isEditingUpdate ? (
              <div className="space-y-2">
                <Textarea
                  value={editedUpdate}
                  onChange={e => setEditedUpdate(e.target.value)}
                  className="min-h-[80px]"
                  placeholder="Enter the latest update..."
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveUpdate} className="text-xs">Save</Button>
                  <Button variant="outline" size="sm" onClick={handleCancelEdit} className="text-xs">Cancel</Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{collaboration.latestUpdate}</p>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Progress Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Progress Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Timeline Progress</span>
              <span className="font-medium">65%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-3 bg-blue-500 rounded-full" style={{ width: "65%" }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Deliverables Progress</span>
              <span className="font-medium">{Math.round((collaboration.deliverables.completed / collaboration.deliverables.total) * 100)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-3 bg-green-500 rounded-full" style={{ width: `${(collaboration.deliverables.completed / collaboration.deliverables.total) * 100}%` }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
} 