import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useApplicationStore } from '../../store/applicationStore';
import { Briefcase, TrendingUp, Clock, Target } from 'lucide-react';
import { format, subDays, isWithinInterval, startOfDay } from 'date-fns';
import { schemeSet3 } from 'd3-scale-chromatic';

export function Stats() {
  const applications = useApplicationStore((state) => state.applications);

  // Basic stats
  const stats = {
    total: applications.length,
    active: applications.filter((app) => 
      ['applied', 'interviewing'].includes(app.status)).length,
    success: applications.filter((app) => 
      ['offered', 'accepted'].includes(app.status)).length,
    responseRate: applications.filter((app) => 
      app.status !== 'applied').length / applications.length || 0,
  };

  // Status distribution for pie chart
  const statusData = Object.entries(
    applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Application timeline data (last 30 days)
  const timelineData = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), i);
    const appsOnDay = applications.filter(app => 
      format(new Date(app.dateApplied), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    ).length;
    return {
      date: format(date, 'MMM dd'),
      applications: appsOnDay,
    };
  }).reverse();

  // Response time analysis
  const averageResponseTime = applications
    .filter(app => app.status !== 'applied' && app.nextFollowUp)
    .reduce((acc, app) => {
      const responseTime = Math.floor(
        (new Date(app.nextFollowUp!).getTime() - new Date(app.dateApplied).getTime()) 
        / (1000 * 60 * 60 * 24)
      );
      return acc + responseTime;
    }, 0) / applications.filter(app => app.status !== 'applied').length || 0;

  // Location distribution
  const locationData = Object.entries(
    applications.reduce((acc, app) => {
      acc[app.location] = (acc[app.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600">Total Applications</p>
              <h3 className="text-2xl font-bold">{stats.total}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-600">Success Rate</p>
              <h3 className="text-2xl font-bold">
                {Math.round(stats.success / stats.total * 100 || 0)}%
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-600">Avg. Response Time</p>
              <h3 className="text-2xl font-bold">{Math.round(averageResponseTime)} days</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-gray-600">Response Rate</p>
              <h3 className="text-2xl font-bold">
                {Math.round(stats.responseRate * 100)}%
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Application Timeline */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Application Timeline</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke="#4F46E5"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Application Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={schemeSet3[index % schemeSet3.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Location Distribution */}
        <div className="bg-white rounded-lg p-6 shadow-sm col-span-full">
          <h3 className="text-lg font-semibold mb-4">Top Application Locations</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#4F46E5">
                  {locationData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={schemeSet3[index % schemeSet3.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}