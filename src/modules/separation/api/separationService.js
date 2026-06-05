import api from "../../../api/axios";

export const getAssetClearanceStatus = async (resignationId) => {
  const response = await api.get(`/separation/requests/${resignationId}/asset_clearance_status/`);
  return response.data;
};

export const generateFFSettlement = async (resignationId, payload = {}) => {
  const response = await api.post(`/separation/requests/${resignationId}/generate_ff_settlement/`, payload);
  return response.data;
};

export const approveFFSettlement = async (settlementId) => {
  const response = await api.post(`/separation/settlements/${settlementId}/approve/`);
  return response.data;
};

export const patchSettlementDeductions = async (settlementId, deductions) => {
  // If we needed to manually add deductions via PATCH
  const response = await api.patch(`/separation/settlements/${settlementId}/`, { deductions });
  return response.data;
};

export const getFFHistory = async (params) => {
  const response = await api.get(`/separation/settlements/history/`, { params });
  return response.data;
};

export const exportFFHistoryCSV = async (params) => {
  const response = await api.get(`/separation/settlements/history/`, {
    params: { ...params, export: "csv" },
    responseType: "blob",
  });
  return response;
};
