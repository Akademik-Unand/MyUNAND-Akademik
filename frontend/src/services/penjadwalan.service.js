import { apiRequest } from "./http";
const base = "/penjadwalan";
export const schedulingSetup = (semester_id, fakultas_id) =>
  apiRequest(`${base}/setup`, { params: { semester_id, fakultas_id } });
export const schedulingPolicy = (body) =>
  apiRequest(`${base}/policies`, { method: "PUT", body });
export const schedulingCreate = (body) =>
  apiRequest(`${base}/scenarios`, { method: "POST", body });
export const schedulingGet = (id) => apiRequest(`${base}/scenarios/${id}`);
export const schedulingEdit = (id, body) =>
  apiRequest(`${base}/scenarios/${id}`, { method: "PUT", body });
export const schedulingAction = (id, action, body) =>
  apiRequest(`${base}/scenarios/${id}/${action}`, { method: "POST", body });
export const schedulingJobs = (id) =>
  apiRequest(`${base}/scenarios/${id}/jobs`);
export const schedulingHistory = (id) =>
  apiRequest(`${base}/scenarios/${id}/history`);
export const schedulingDownload = (id, params) =>
  apiRequest(`${base}/scenarios/${id}/export`, {
    params,
    responseType: "blob",
  });
