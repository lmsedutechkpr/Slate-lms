'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface RevenueChartProps {
  data: {
    name: string;
    gross: number;
    platform: number;
  }[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  // If no data, show a placeholder
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] w-full flex flex-col items-center justify-center text-gray-400">
        <p>No revenue data available</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
            dx={-10}
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: '#111827', 
              border: 'none',
              borderRadius: '8px',
              color: '#F9FAFB',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
            itemStyle={{ color: '#F9FAFB' }}
            formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
          />
          <Line 
            type="monotone" 
            dataKey="gross" 
            name="Gross Revenue"
            stroke="#9CA3AF" 
            strokeWidth={2}
            dot={{ r: 4, fill: '#9CA3AF', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#9CA3AF', strokeWidth: 0 }}
          />
          <Line 
            type="monotone" 
            dataKey="platform" 
            name="Platform Share"
            stroke="#000000" 
            strokeWidth={2}
            dot={{ r: 4, fill: '#000000', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#000000', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
