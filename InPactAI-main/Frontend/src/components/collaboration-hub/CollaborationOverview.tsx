import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { BarChart3, Users, Edit } from "lucide-react";
import { Textarea } from "../ui/textarea";

const CollaborationOverview = ({
  collaboration,
  isEditingUpdate,
  editedUpdate,
  handleEditUpdate,
  handleSaveUpdate,
  handleCancelEdit,
  setEditedUpdate,
  getStatusColor,
  getDeliverableStatusColor,
}) => (
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
                onChange={(e) => setEditedUpdate(e.target.value)}
                className="min-h-[80px]"
                placeholder="Enter the latest update..."
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveUpdate}
                  className="text-xs"
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
              {collaboration.latestUpdate}
            </p>
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
            <div 
              className="h-3 bg-green-500 rounded-full" 
              style={{ width: `${(collaboration.deliverables.completed / collaboration.deliverables.total) * 100}%` }} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
    {/* AI Project Overview & Recommendations */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          AI Project Overview & Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Project Health Analysis</h4>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              This collaboration is progressing well with 65% timeline completion. 
              The content creation phase is active and on track. 
              Communication frequency is optimal for this stage of the project.
            </p>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Current Timeline Recommendations</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-700">
                <strong>Content Creation Phase:</strong> Consider scheduling a review meeting 
                within the next 2 days to ensure alignment on video direction and style.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-700">
                <strong>Quality Check:</strong> Request a preview of the thumbnail design 
                to provide early feedback and avoid last-minute revisions.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-700">
                <strong>Risk Mitigation:</strong> Prepare backup content ideas in case 
                the current direction needs adjustment.
              </p>
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Communication Tips</h4>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <strong>Pro Tip:</strong> Use specific feedback when reviewing content. 
              Instead of "make it better," try "increase the energy in the first 30 seconds" 
              or "add more close-up shots of the product features."
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </>
);

export default CollaborationOverview; 