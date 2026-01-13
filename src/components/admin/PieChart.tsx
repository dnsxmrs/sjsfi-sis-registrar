'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getRegistrationTypesCount } from '@/app/_actions/registrarHome';

interface ChartData {
  name: string;
  value: number;
}

const GradePieChart: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    const fetchRegistrationTypes = async () => {
      const result = await getRegistrationTypesCount();
      if (result.success && result.data) {
        // Map the data to the chart format
        const chartData = result.data.map((item: { type: string; count: number }) => {
          // Format the registration type names
          let name = item.type;
          if (item.type === 'NEW') name = 'New';
          else if (item.type === 'OLD') name = 'Old';
          else if (item.type === 'RETURNING') name = 'Returning';
          else if (item.type === 'TRANSFER') name = 'Transferee';

          return {
            name,
            value: item.count
          };
        });
        setData(chartData);
      }
    };

    fetchRegistrationTypes();
  }, []);

  // Predefined colors for different registration types
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']; // Blue, Emerald, Amber, Red, Violet

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
                  fill={colors[index % colors.length]}
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
              style={{ color: colors[index % colors.length] }}
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
