import axiosInstance from "./axios";

export const getHolidays = async (params) => {
  return await axiosInstance.get("/holidays/", { params });
};

export const getHolidayById = async (id) => {
  return await axiosInstance.get(`/holidays/${id}/`);
};

export const createHoliday = async (data) => {
  return await axiosInstance.post("/holidays/", data);
};

export const updateHoliday = async (id, data) => {
  return await axiosInstance.put(`/holidays/${id}/`, data);
};

export const deleteHoliday = async (id) => {
  return await axiosInstance.delete(`/holidays/${id}/`);
};

export const getUpcomingHolidays = async () => {
  return await axiosInstance.get("/holidays/upcoming/");
};

export const getHolidayCalendarEvents = async () => {
  return await axiosInstance.get("/holidays/calendar/");
};

export const bulkUploadHolidays = async (formData) => {
  return await axiosInstance.post("/holidays/bulk-upload/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
