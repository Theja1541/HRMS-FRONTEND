import api from "./axios";

export const getMyNotifications = () =>
  api.get("notifications/my/");

export const markNotificationRead = (notificationId) =>
  api.post(`notifications/read/${notificationId}/`);
