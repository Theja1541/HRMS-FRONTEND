import api from "./axios";

/** List tickets. Super Admin: all (optional params: company_id, status, priority). Company: own only. */
export const getSupportTickets = (params = {}) => {
  return api.get("/support/tickets/", { params });
};

/** Create a ticket (Admin/HR only). Body: { title, description, priority }. */
export const createSupportTicket = (data) => {
  return api.post("/support/tickets/create/", data);
};

/** Get single ticket. */
export const getSupportTicket = (ticketId) => {
  return api.get(`/support/tickets/${ticketId}/`);
};

/** Update ticket status/priority (Super Admin only). */
export const updateSupportTicket = (ticketId, data) => {
  return api.patch(`/support/tickets/${ticketId}/`, data);
};
