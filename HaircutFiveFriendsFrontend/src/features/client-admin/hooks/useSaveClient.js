import { useClientStore } from "../store/useClientStore";

export const useSaveClient = () => {
  const createClient = useClientStore((state) => state.createClient);
  const updateClient = useClientStore((state) => state.updateClient);

  const saveClient = async (data, clientId = null) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    if (data.faceshape) {
      formData.append("faceshape", data.faceshape);
    }
    formData.append("status", data.status ? "true" : "false");
    if (data.profilePicture) {
      formData.append("profilePicture", data.profilePicture);
    }
    if (!clientId && data.password) {
      formData.append("password", data.password);
    }

    if (clientId) {
      await updateClient(clientId, formData);
    } else {
      await createClient(formData);
    }
  };

  return { saveClient };
};
