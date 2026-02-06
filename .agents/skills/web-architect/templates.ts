// .agents/skills/web-architect/templates.ts

export const generateSkeleton = (name: string) => `
import React from 'react';

export const ${name}Skeleton = () => (
  <div className="w-full animate-pulse space-y-4">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-32 bg-gray-100 rounded"></div>
    <div className="grid grid-cols-3 gap-4">
      <div className="h-4 bg-gray-200 rounded col-span-2"></div>
      <div className="h-4 bg-gray-200 rounded col-span-1"></div>
    </div>
  </div>
);
`;