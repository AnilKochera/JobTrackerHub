export type ApplicationStatus = 'applied' | 'interviewing' | 'offered' | 'rejected' | 'accepted';

export interface JobApplication {
  id: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  dateApplied: string;
  nextFollowUp?: string;
  salary?: string;
  location: string;
  notes: string;
  contactPerson?: string;
  contactEmail?: string;
}