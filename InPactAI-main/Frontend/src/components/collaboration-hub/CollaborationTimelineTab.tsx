import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Calendar, FileText, Eye, Badge } from "lucide-react";

export default function CollaborationTimelineTab({
  mockMilestones,
  handleViewContract,
  contractUrl,
  collaboration,
  getMilestoneStatusColor
}: {
  mockMilestones: any[];
  handleViewContract: () => void;
  contractUrl: string;
  collaboration: any;
  getMilestoneStatusColor: (status: string) => string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Project Timeline
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleViewContract}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            View Contract
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {mockMilestones.map((milestone, index) => (
            <div key={milestone.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-4 h-4 rounded-full ${
                  milestone.status === 'completed' ? 'bg-green-500' :
                  milestone.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                }`} />
                {index < mockMilestones.length - 1 && (
                  <div className="w-0.5 h-12 bg-gray-200 mt-2" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{milestone.title}</h4>
                  <Badge className={getMilestoneStatusColor(milestone.status)}>
                    {milestone.status.replace('-', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Due: {milestone.dueDate}</span>
                  {milestone.status === 'in-progress' && (
                    <span className="text-blue-600 font-medium">{milestone.progress}% complete</span>
                  )}
                </div>
                {milestone.status === 'in-progress' && (
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-2 bg-blue-500 rounded-full" 
                      style={{ width: `${milestone.progress}%` }} 
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 