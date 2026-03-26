import React, { useState } from "react";
import CreatorMatchCard, { CreatorMatchCardProps } from "./CreatorMatchCard";

interface CreatorMatchGridProps {
  creators: CreatorMatchCardProps[];
}

const PAGE_SIZE = 4;

const CreatorMatchGrid: React.FC<CreatorMatchGridProps> = ({ creators }) => {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(creators.length / PAGE_SIZE);

  const startIdx = page * PAGE_SIZE;
  const endIdx = startIdx + PAGE_SIZE;
  const currentCreators = creators.slice(startIdx, endIdx);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
        {currentCreators.map((creator) => (
          <CreatorMatchCard key={creator.id} {...creator} />
        ))}
      </div>
      <div className="flex justify-center gap-4 mt-8">
        <button
          className="px-4 py-2 rounded bg-gray-100 text-gray-700 disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          disabled={page === 0}
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">Page {page + 1} of {totalPages}</span>
        <button
          className="px-4 py-2 rounded bg-gray-100 text-gray-700 disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
          disabled={page >= totalPages - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CreatorMatchGrid; 