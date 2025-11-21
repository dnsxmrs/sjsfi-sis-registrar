'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { getStudentsByGradeLevel } from '@/app/_actions/getStudentsByGradeLevel';

interface ChartData {
  name: string;
  value: number;
}

// Generate distinct colors dynamically based on the number of items
const generateDistinctColors = (count: number): string[] => {
  const colors: string[] = [];
  const goldenRatioConjugate = 0.618033988749895;
  let hue = Math.random(); // Start with random hue for variety

  for (let i = 0; i < count; i++) {
    hue += goldenRatioConjugate;
    hue %= 1;

    // Use HSL to ensure distinct, vibrant colors
    // Keep saturation high (65-85%) and lightness moderate (45-60%) for visibility
    const saturation = 65 + (i % 3) * 10; // Vary between 65-85%
    const lightness = 45 + (i % 4) * 5; // Vary between 45-60%

    colors.push(hslToHex(hue * 360, saturation, lightness));
  }

  return colors;
};

// Convert HSL to Hex color
const hslToHex = (h: number, s: number, l: number): string => {
  const hDecimal = h / 360;
  const sDecimal = s / 100;
  const lDecimal = l / 100;

  let r, g, b;

  if (sDecimal === 0) {
    r = g = b = lDecimal;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = lDecimal < 0.5
      ? lDecimal * (1 + sDecimal)
      : lDecimal + sDecimal - lDecimal * sDecimal;
    const p = 2 * lDecimal - q;

    r = hue2rgb(p, q, hDecimal + 1 / 3);
    g = hue2rgb(p, q, hDecimal);
    b = hue2rgb(p, q, hDecimal - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const renderActiveShape = (props: unknown) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props as {
    cx: number;
    cy: number;
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
    fill: string;
  };

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

const GradePieChart: React.FC = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getStudentsByGradeLevel();

        if (result.success) {
          setData(result.data);
          // Generate colors based on the actual number of data items
          setColors(generateDistinctColors(result.data.length));
        } else {
          setError(result.error || 'Failed to fetch data');
        }
      } catch (err) {
        setError('An error occurred while fetching data');
        console.error('Error fetching student data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
          <div className="w-full max-w-[320px] h-[320px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-inner animate-pulse">
            <div className="text-gray-500 font-medium">Loading chart...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
          <div className="w-full max-w-[320px] h-[320px] flex items-center justify-center bg-red-50 rounded-2xl shadow-inner border border-red-200">
            <div className="text-red-600 font-medium text-center px-4">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
          <div className="w-full max-w-[320px] h-[320px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-inner">
            <div className="text-gray-500 font-medium">No student data available</div>
          </div>
        </div>
      </div>
    );
  }

  const totalStudents = data.reduce((sum, entry) => sum + entry.value, 0);

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="14"
        fontWeight="bold"
        className="drop-shadow-lg"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-12">
        {/* Chart Section */}
        <div className="flex flex-col items-center">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg p-6 transition-shadow hover:shadow-xl">
            <ResponsiveContainer width={320} height={320}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  activeIndex={activeIndex !== null ? activeIndex : undefined}
                  activeShape={renderActiveShape}
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
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend Section */}
        <div className="flex flex-col justify-center gap-3 max-w-xs w-full">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
            Grade Levels
          </h4>
          <div className="space-y-2">
            {data.map((entry, index) => (
              <div
                key={entry.name}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 cursor-pointer ${activeIndex === index
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md scale-105'
                    : 'bg-white hover:bg-gray-50 shadow-sm'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="inline-block w-4 h-4 rounded-full shadow-sm transition-transform duration-300"
                    style={{
                      backgroundColor: colors[index],
                      transform: activeIndex === index ? 'scale(1.2)' : 'scale(1)'
                    }}
                  />
                  <span className="font-semibold text-gray-800 text-sm">
                    {entry.name}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-base font-bold text-gray-900">
                    {entry.value}
                  </span>
                  <span className="text-xs text-gray-500">
                    {((entry.value / totalStudents) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradePieChart;
