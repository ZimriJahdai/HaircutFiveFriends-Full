import { useHaircutStore } from "../store/useHaircutStore";

export const useSaveHaircut = () => {
    const createHaircut = useHaircutStore((state) => state.createHaircut);
    const updateHaircut = useHaircutStore((state) => state.updateHaircut);

    const saveHaircut = async (data, haircutId = null) => {
        const formData = new FormData();

        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("faceTypeRecommended", data.faceTypeRecommended);
        
        
        if (data.price) {
            formData.append("price", data.price);
        }
        if (data.duration) {
            formData.append("duration", data.duration);
        }

        if (data.imageRef) {
            formData.append("imageRef", data.imageRef);
        }
        
        if (haircutId) {
            await updateHaircut(haircutId, formData);
        } else {
            await createHaircut(formData);
        }
    };

    return { saveHaircut };
};
