import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export interface ActiveCollabCardProps {
  id: number;
  collaborator: {
    name: string;
    avatar: string;
    contentType: string;
  };
  collabTitle: string;
  status: string;
  startDate: string;
  dueDate: string;
  messages: number;
  deliverables: { completed: number; total: number };
  lastActivity: string;
  latestUpdate: string;
}

const statusColors: Record<string, string> = {
  "In Progress": "bg-blue-100 text-blue-700",
  "Awaiting Response": "bg-yellow-100 text-yellow-700",
  "Completed": "bg-green-100 text-green-700"
};

function getDaysBetween(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
  const diff = e.getTime() - s.getTime();
  if (diff < 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getDaysLeft(due: string) {
  const now = new Date();
  const d = new Date(due);
  if (isNaN(d.getTime())) return 0;
  const diff = d.getTime() - now.getTime();
  // Allow negative for overdue, but if invalid, return 0
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getTimelineProgress(start: string, due: string) {
  const total = getDaysBetween(start, due);
  if (total === 0) return 0;
  const elapsed = getDaysBetween(start, new Date().toISOString().slice(0, 10));
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

const ActiveCollabCard: React.FC<ActiveCollabCardProps> = ({
  id,
  collaborator,
  collabTitle,
  status,
  startDate,
  dueDate,
  messages,
  deliverables,
  lastActivity,
  latestUpdate
}) => {
  const navigate = useNavigate();
  const deliverableProgress = Math.round((deliverables.completed / deliverables.total) * 100);
  const timelineProgress = getTimelineProgress(startDate, dueDate);
  const daysLeft = getDaysLeft(dueDate);
  const overdue = daysLeft < 0 && status !== "Completed";

  return (
    <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-3 border border-gray-100 w-full max-w-xl mx-auto">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
          <AvatarFallback className="bg-gray-200">{collaborator.name.slice(0,2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-semibold text-lg text-gray-900">{collaborator.name}</div>
          <div className="text-xs text-gray-500">{collaborator.contentType}</div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status] || "bg-gray-100 text-gray-700"}`}>{status}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
        <span className="font-semibold">Collab:</span> {collabTitle}
        <span className="ml-4 font-semibold">Start:</span> {startDate}
        <span className="ml-4 font-semibold">Due:</span> <span className={overdue ? "text-red-600 font-bold" : ""}>{dueDate}</span>
        <span className="ml-4 font-semibold">{overdue ? `Overdue by ${Math.abs(daysLeft)} days` : daysLeft === 0 ? "Due today" : `${daysLeft} days left`}</span>
      </div>
      {/* Timeline Progress Bar */}
      <div className="w-full flex flex-col gap-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Timeline</span>
          <span>{timelineProgress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-2 rounded-full bg-blue-400" style={{ width: `${timelineProgress}%` }} />
        </div>
      </div>
      {/* Deliverables Progress Bar */}
      <div className="w-full flex flex-col gap-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Deliverables</span>
          <span>{deliverables.completed}/{deliverables.total} ({deliverableProgress}%)</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-2 rounded-full bg-green-400" style={{ width: `${deliverableProgress}%` }} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
        <span>Messages: <span className="font-semibold text-gray-900">{messages}</span></span>
        <span>Last activity: <span className="font-semibold text-gray-900">{lastActivity}</span></span>
      </div>
      <div className="text-xs text-gray-700 italic bg-gray-50 rounded px-3 py-2 border border-gray-100">
        <span className="font-semibold text-gray-800">Latest update:</span> {latestUpdate}
      </div>
      <div className="flex gap-2 mt-2">
        <Button 
          className="bg-gray-100 text-gray-900 hover:bg-gray-200 font-semibold rounded-full py-2" 
          variant="secondary"
          onClick={() => navigate(`/dashboard/collaborations/${id}`)}
          aria-label="View collaboration details"
        >
          View Details
        </Button>
        <Button 
          className="bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold rounded-full py-2"
          aria-label="Send message to collaborator"
        >
          Message
        </Button>
        {status !== "Completed" && (
          <Button 
            className="bg-green-100 text-green-700 hover:bg-green-200 font-semibold rounded-full py-2"
            aria-label="Mark collaboration as complete"
          >
            Mark Complete
          </Button>
        )}
      </div>
    </div>
  );
};

export default ActiveCollabCard; 