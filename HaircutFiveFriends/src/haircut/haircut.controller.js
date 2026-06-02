import Haircut from "./haircut.model.js";

export const createHaircut = async (req, res) => {
      try {
        const fieldData = req.body;
        if (req.file) {
            fieldData.imageRef = req.file.path; // Guardar la ruta de la foto en el campo 'imageRef'
        }

        const field = new Haircut(fieldData);
        await field.save();

        res.status(201).json({
            success: true,
            message: 'Corte creado exitosamente',
            data: field
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el corte',
            error: error.message
        });
    }
}

export const getHaircuts = async (req, res) => {
    try {
        const { limit = 10, page = 1 } = req.query;
        const haircut = await Haircut.find()
            .skip((page - 1) * limit)
            .limit(limit);

            const total = await Haircut.countDocuments();
        res.status(200).json({
            success: true,
            total,
            haircut
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los cortes',
            error: error.message
        });
    }
}

export const getHaircutById = async (req, res) => {
    try {
        const { id } = req.params; 
        const haircut = await Haircut.findById(id);

        if (!haircut) {
            return res.status(404).json({
                success: false,
                message: 'Corte no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            haircut
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el corte',
            error: error.message
        });
    }
}

export const updateHaircut = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        
        if (req.file) {
            data.imageRef = req.file.path; 
        }

        const haircut = await Haircut.findByIdAndUpdate(id, data, { new: true });

        if (!haircut) {
            return res.status(404).json({
                success: false,
                message: 'Corte no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Corte actualizado exitosamente',
            haircut
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el corte',
            error: error.message
        });
    }
}

export const deleteHaircut = async (req, res) => {
    try {
        const { id } = req.params;
        const haircut = await Haircut.findByIdAndDelete(id);

        if (!haircut) {
            return res.status(404).json({
                success: false,
                message: 'Corte no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Corte eliminado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el corte',
            error: error.message
        });
    }
}

export const getHaircutByFaceType = async (req, res) => {
    try {
        const { faceType } = req.params;
        const haircut = await Haircut.find({
            faceTypeRecommended: { 
                $in: [faceType.toUpperCase(), 'ANY'] 
            }
        });

        if (haircut.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron cortes para este tipo de rostro',
                haircut: []
            });
        }

        res.status(200).json({
            success: true,
            total: haircut.length,
            haircut
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los cortes por tipo de rostro',
            error: error.message
        });
    }
}

export const getHaircutByName = async (req, res) => {
    try {
        const { name } = req.params;
        const haircut = await Haircut.find({
            name: { $regex: name, $options: 'i' }
        });

        if (haircut.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron cortes con ese nombre',
                haircut: []
            });
        }

        res.status(200).json({
            success: true,
            total: haircut.length,
            haircut
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar cortes por nombre',
            error: error.message
        });
    }
}