import { apiRequest } from "./http";

export const getUniversityDashboard = () => apiRequest("/dashboard/summary");
export const getAcademicDashboard = () => apiRequest("/dashboard/academic-summary");
export const getOrganizationDashboard = () => apiRequest("/dashboard/org-summary");
export const getLecturerDashboard = () => apiRequest("/dashboard/dosen-summary");
