import axios from "../../../api/axios";

export const getResignationRequests = () => axios.get("/separation/requests/");
export const getResignationRequest = (id) => axios.get(`/separation/requests/${id}/`);
export const submitResignation = (data) => axios.post("/separation/requests/", data);
export const updateResignationJSON = (id, payload) => axios.patch(`/separation/requests/${id}/`, payload);
export const approveResignation = (id, data) => axios.patch(`/separation/requests/${id}/approve/`, data);

export const getFinalSettlements = () => axios.get("/separation/settlements/");
export const getFinalSettlement = (id) => axios.get(`/separation/settlements/${id}/`);
export const createFinalSettlement = (data) => axios.post("/separation/settlements/", data);
export const updateFinalSettlement = (id, data) => axios.patch(`/separation/settlements/${id}/`, data);
