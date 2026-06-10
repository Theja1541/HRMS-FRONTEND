import api from "../../../api/axios";

export const getAssetClearanceStatus = async (resignationId) => {
  const response = await api.get(`/separation/requests/${resignationId}/asset_clearance_status/`);
  return response.data;
};

export const generateFFSettlement = async (resignationRequestId) => {
  try {
    const response = await api.post(`/separation/settlements/generate/`, {
      resignation_request_id: resignationRequestId,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.detail) {
      throw new Error(error.response.data.detail);
    }
    throw error;
  }
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
