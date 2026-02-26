import api from "./axios";

export const getAllUsers = () => {
  return api.get("/accounts/superadmin/users/");
};

export const createUser = (data) => {
  return api.post("/accounts/superadmin/create-user/", data);
};

export const updateUserRole = (userId, role) => {
  return api.patch(
    `/accounts/superadmin/update-role/${userId}/`,
    { role }
  );
};
