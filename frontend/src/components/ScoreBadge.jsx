import React from 'react';

export default function ScoreBadge({ score, size = 'md', showOutOf = true }) {
  const numScore = typeof score === 'number' ? score : parseFloat(score) || 0;
  
  let colorStyles = 'bg-slate-100 text-slate-700 border-slate-200';
  if (numScore >= 8.0) {
    colorStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (numScore >= 6.5) {
    colorStyles = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  } else if (numScore >= 4.5) {
    colorStyles = 'bg-amber-50 text-amber-700 border-amber-200';
  } else {
    colorStyles = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 font-medium border rounded-md',
    md: 'text-sm px-3 py-1 font-semibold border rounded-lg',
    lg: 'text-2xl px-5 py-2 font-bold border rounded-xl',
  }[size] || 'text-sm px-3 py-1 font-semibold border rounded-lg';

  return (
    <div className={`inline-flex items-center gap-1.5 shadow-sm ${colorStyles} ${sizeStyles}`}>
      <span>{numScore.toFixed(1)}</span>
      {showOutOf && <span className="opacity-70 text-[0.8em] font-normal">/ 10</span>}
    </div>
  );
}
