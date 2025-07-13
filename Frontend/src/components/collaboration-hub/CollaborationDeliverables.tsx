import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { FileText, Download, Eye, Edit } from "lucide-react";

const CollaborationDeliverables = ({
  mockDeliverables,
  getDeliverableStatusColor,
  handleViewDeliverable,
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Deliverables
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {mockDeliverables.map((deliverable) => (
          <div key={deliverable.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{deliverable.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{deliverable.description}</p>
              </div>
              <Badge className={getDeliverableStatusColor(deliverable.status)}>
                {deliverable.status.replace('-', ' ')}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Due Date:</span>
                <span className="ml-2 font-medium">{deliverable.dueDate}</span>
              </div>
              <div>
                <span className="text-gray-600">Assigned To:</span>
                <span className="ml-2 font-medium">{deliverable.assignedTo}</span>
              </div>
            </div>
            {deliverable.files && deliverable.files.length > 0 && (
              <div className="mt-3">
                <span className="text-sm text-gray-600">Files:</span>
                <div className="flex gap-2 mt-1">
                  {deliverable.files.map((file, index) => (
                    <Button key={index} variant="outline" size="sm" className="text-xs">
                      <Download className="h-3 w-3 mr-1" />
                      {file}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleViewDeliverable(deliverable)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default CollaborationDeliverables; 