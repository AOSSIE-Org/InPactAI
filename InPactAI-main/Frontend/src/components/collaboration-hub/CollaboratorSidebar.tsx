import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { MessageSquare, Mail, Star, TrendingUp, Activity } from "lucide-react";

export default function CollaboratorSidebar({ collaboration }: { collaboration: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Collaborator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={collaboration.collaborator.avatar} alt={collaboration.collaborator.name} />
            <AvatarFallback className="bg-gray-200">
              {collaboration.collaborator.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-gray-900">{collaboration.collaborator.name}</h4>
            <p className="text-sm text-gray-600">{collaboration.collaborator.contentType}</p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Star className="h-4 w-4" />
            <span>4.8/5 rating</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <TrendingUp className="h-4 w-4" />
            <span>500K+ followers</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Activity className="h-4 w-4" />
            <span>95% completion rate</span>
          </div>
        </div>
        <Separator />
        <div className="space-y-2">
          <Button className="w-full" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Send Message
          </Button>
          <Button variant="outline" className="w-full" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 