import React from 'react';
import { format } from 'date-fns';
import { useApplicationStore } from '../../store/applicationStore';
import { Building2, MapPin, Calendar } from 'lucide-react';

export function ApplicationList() {
  const applications = useApplicationStore((state) => state.applications);

  const statusColors = {
    applied: 'bg-blue-100 text-blue-800',
    interviewing: 'bg-yellow-100 text-yellow-800',
    offered: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    accepted: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Applications</h2>
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application.id}
              className="border rounded-lg p-4 hover:border-indigo-500 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{application.position}</h3>
                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <Building2 className="w-4 h-4" />
                    <span>{application.company}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{application.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(application.dateApplied), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${statusColors[application.status]}`}>
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
          {applications.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No applications yet. Start by adding your first job application!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}