import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";

export default function CollaborationProjectStats({ collaboration }: { collaboration: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">65%</div>
            <div className="text-xs text-gray-600">Timeline</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {Math.round((collaboration.deliverables.completed / collaboration.deliverables.total) * 100)}%
            </div>
            <div className="text-xs text-gray-600">Deliverables</div>
          </div>
        </div>
        <Separator />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Days Remaining:</span>
            <span className="font-medium">3 days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Files Shared:</span>
            <span className="font-medium">5</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 