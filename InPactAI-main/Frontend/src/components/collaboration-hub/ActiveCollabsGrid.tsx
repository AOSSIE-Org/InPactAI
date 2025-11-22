import React, { useState } from "react";
import { activeCollabsMock } from "./activeCollabsMockData";
import ActiveCollabCard from "./ActiveCollabCard";

const statusOptions = ["All", "In Progress", "Completed"];
const sortOptions = ["Start Date", "Due Date", "Name"];

const ActiveCollabsGrid: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Start Date");

  // Only show In Progress and Completed
  let filtered = activeCollabsMock.filter(c => c.status !== "Awaiting Response");
  if (statusFilter !== "All") {
    filtered = filtered.filter(c => c.status === statusFilter);
  }
  if (sortBy === "Start Date") {
    filtered = [...filtered].sort((a, b) => a.startDate.localeCompare(b.startDate));
  } else if (sortBy === "Due Date") {
    filtered = [...filtered].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  } else if (sortBy === "Name") {
    filtered = [...filtered].sort((a, b) => a.collaborator.name.localeCompare(b.collaborator.name));
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 items-center">
          <label htmlFor="statusFilter" className="font-semibold text-gray-700">Status:</label>
          <select
            id="statusFilter"
            className="border rounded px-2 py-1 text-sm"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            aria-label="Filter collaborations by status"
          >
            {statusOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <label htmlFor="sortBy" className="font-semibold text-gray-700">Sort by:</label>
          <select
            id="sortBy"
            className="border rounded px-2 py-1 text-sm"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            aria-label="Sort collaborations by criteria"
          >
            {sortOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          <div className="text-2xl mb-2">No active collaborations</div>
          <div className="text-sm">Start a new collaboration to see it here!</div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filtered.map(collab => (
            <ActiveCollabCard key={collab.id} {...collab} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveCollabsGrid; 