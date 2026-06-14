import { useBarberStore } from "../store/useBarberStore";

export const useSaveBarber = () => {
  const createBarber = useBarberStore((state) => state.createBarber);
  const updateBarber = useBarberStore((state) => state.updateBarber);

  const saveBarber = async (data, barberId = null) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    if (data.password) {
      formData.append("password", data.password);
    }
    formData.append("phone", data.phone);
    formData.append("status", data.status ? "true" : "false");
    if (data.profilePicture) {
      formData.append("profilePicture", data.profilePicture);
    }

    if (barberId) {
      await updateBarber(barberId, formData);
    } else {
      await createBarber(formData);
    }
  };

  return { saveBarber };
};
