import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { DayLog } from '../types';

interface StatsOverviewProps {
  todayLog: DayLog;
  recentLogs: Record<string, DayLog>;
  dailyGoal: number;
}

const COLORS = ['#10b981', '#e5e7eb']; // Primary, Gray

export const StatsOverview: React.FC<StatsOverviewProps> = ({ todayLog, dailyGoal }) => {
  const remaining = Math.max(0, dailyGoal - todayLog.totalCalories);
  
  const pieData = [
    { name: 'Consumed', value: todayLog.totalCalories },
    { name: 'Remaining', value: remaining },
  ];

  // Calculate Macros
  const macros = todayLog.entries.reduce(
    (acc, entry) => ({
      protein: acc.protein + entry.info.protein,
      carbs: acc.carbs + entry.info.carbs,
      fat: acc.fat + entry.info.fat,
    }),
    { protein: 0, carbs: 0, fat: 0 }
  );

  const macroData = [
    { name: 'Protein', value: macros.protein, fill: '#3b82f6' },
    { name: 'Carbs', value: macros.carbs, fill: '#f59e0b' },
    { name: 'Fat', value: macros.fat, fill: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Calorie Ring */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
        <h2 className="text-gray-500 font-medium text-sm mb-2 uppercase tracking-wide">Calories Today</h2>
        <div className="relative w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? (todayLog.totalCalories > dailyGoal ? '#ef4444' : COLORS[0]) : COLORS[1]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-gray-900">{todayLog.totalCalories}</span>
            <span className="text-xs text-gray-400">/ {dailyGoal} kcal</span>
          </div>
        </div>
      </div>

      {/* Macro Breakdown */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-gray-500 font-medium text-sm mb-4 uppercase tracking-wide">Macro Breakdown (g)</h2>
        <div className="h-40 w-full">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={macroData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
               <XAxis type="number" hide />
               <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={60} style={{ fontSize: '12px', fontWeight: 500 }} />
               <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
               />
               <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                 {macroData.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={entry.fill} />
                 ))}
               </Bar>
             </BarChart>
           </ResponsiveContainer>
        </div>
        <div className="flex justify-between mt-4 text-xs text-gray-500 px-2">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Protein: {Math.round(macros.protein)}g</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Carbs: {Math.round(macros.carbs)}g</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Fat: {Math.round(macros.fat)}g</div>
        </div>
      </div>
    </div>
  );
};
