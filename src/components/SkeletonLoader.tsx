import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Current Weather Skeleton */}
      <div className="h-96 rounded-3xl bg-slate-900/60 border border-slate-800 p-8 flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-800 rounded-lg" />
            <div className="h-4 w-32 bg-slate-800/60 rounded" />
          </div>
          <div className="h-6 w-28 bg-slate-800 rounded" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-3">
            <div className="h-20 w-44 bg-slate-800 rounded-xl" />
            <div className="h-4 w-60 bg-slate-800/60 rounded" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-24 bg-slate-800/40 rounded-2xl border border-slate-800/60" />
            ))}
          </div>
        </div>
      </div>

      {/* Hourly Chart Skeleton */}
      <div className="h-80 rounded-2xl bg-slate-900/50 border border-slate-800 p-6 flex flex-col justify-between">
        <div className="h-6 w-52 bg-slate-800 rounded" />
        <div className="h-40 bg-slate-800/30 rounded-xl" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-16 flex-1 bg-slate-800/40 rounded-xl" />
          ))}
        </div>
      </div>

      {/* 7-Day Forecast Skeleton */}
      <div className="h-72 rounded-2xl bg-slate-900/50 border border-slate-800 p-6 space-y-4">
        <div className="h-6 w-48 bg-slate-800 rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="h-40 bg-slate-800/40 rounded-xl border border-slate-800" />
          ))}
        </div>
      </div>
    </div>
  );
};
