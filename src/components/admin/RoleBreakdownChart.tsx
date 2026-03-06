'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface RoleBreakdownChartProps {
  data: {
    name: string;
    value: number;
    fill: string;
  }[];
}

export default function RoleBreakdownChart({ data }: RoleBreakdownChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="w-full h-48 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number, name: string) => [value, name]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
        <span className="text-xl font-bold text-gray-900 leading-tight">
          {total}
        </span>
        <span className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">
          Users
        </span>
      </div>
    </div>
  );
}
