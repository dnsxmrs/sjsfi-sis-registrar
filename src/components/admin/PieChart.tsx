'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

const GradePieChart: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Static data for registration types (total amounts)
  const data: ChartData[] = [
    { name: 'New', value: 45 },
    { name: 'Old/Returning', value: 35 },
    { name: 'Transferee', value: 20 },
  ];

  // Predefined colors matching the palette in home/page.tsx
  const colors = ['#3B82F6', '#10B981', '#F59E0B']; // Blue, Emerald, Amber

  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index]}
                  className="transition-all duration-300 cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mb-2 flex justify-center gap-2 sm:gap-4 lg:gap-10 w-full flex-wrap">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex flex-col items-center min-w-0">
            <span
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: colors[index] }}
            >
              {entry.value}
            </span>
            <span className="text-sm sm:text-base text-black mt-1">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GradePieChart;
