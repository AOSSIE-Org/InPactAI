import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Edit, FileText, Download, ExternalLink } from "lucide-react";

export default function CollaborationQuickActions({ handleViewContract }: { handleViewContract: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline" className="w-full justify-start" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit Collaboration
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start" 
          size="sm"
          onClick={handleViewContract}
        >
          <FileText className="h-4 w-4 mr-2" />
          View Contract
        </Button>
        <Button variant="outline" className="w-full justify-start" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Details
        </Button>
        <Button variant="outline" className="w-full justify-start" size="sm">
          <ExternalLink className="h-4 w-4 mr-2" />
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
} 