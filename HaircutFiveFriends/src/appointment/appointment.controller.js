import Appointment from "./appointment.model.js";
import Barber from "../barber/barber.model.js";
import Client from "../client/client.model.js";

export const createAppointment = async (req, res) => {
    try {
        const isUser = req.userRole === 'USER_ROLE';
        const payload = { ...req.body };

        if (isUser) {
            const client = req.clientFromToken || await Client.findOne({ userId: req.userId });
            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: 'Cliente no encontrado para el usuario autenticado'
                });
            }
            payload.clienteId = client._id;

            const [randomBarber] = await Barber.aggregate([{ $sample: { size: 1 } }, { $project: { _id: 1 } }]);
            payload.barberId = randomBarber ? randomBarber._id : null;
        }

        const appointment = new Appointment(payload);
        await appointment.save();

        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('clienteId', 'name')
            .populate('barberId', 'name')
            .populate('serviceId', 'name price duration');

        res.status(201).json({
            success: true,
            message: 'Cita creada exitosamente',
            data: populatedAppointment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear la cita',
            error: error.message
        });
    }
};

export const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('clienteId', 'name')
            .populate('barberId', 'name')
            .populate('serviceId', 'name price duration')
            .sort({ appointmentDate: 1 });

        res.status(200).json({
            success: true,
            message: 'Citas obtenidas exitosamente',
            total: appointments.length,
            data: appointments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las citas',
            error: error.message
        });
    }
};

export const getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findById(id)
            .populate('clienteId', 'name')
            .populate('barberId', 'name')
            .populate('serviceId', 'name price duration');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Cita no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cita obtenida exitosamente',
            data: appointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la cita',
            error: error.message
        });
    }
};

export const getAppointmentsByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const startDate = new Date(date);
        startDate.setUTCHours(0, 0, 0, 0);
        
        const endDate = new Date(date);
        endDate.setUTCHours(23, 59, 59, 999);

        const appointments = await Appointment.find({
            appointmentDate: {
                $gte: startDate,
                $lte: endDate
            }
        })
            .populate('clienteId', 'name email phone')
            .populate('barberId', 'name phone')
            .populate('serviceId', 'name price duration')
            .sort({ appointmentDate: 1 });

        res.status(200).json({
            success: true,
            message: `Citas del ${date} obtenidas exitosamente`,
            total: appointments.length,
            data: appointments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las citas por fecha',
            error: error.message
        });
    }
};

export const getAppointmentsByBarber = async (req, res) => {
    try {
        const { barberId } = req.params;
        const appointments = await Appointment.find({ barberId })
            .populate('clienteId', 'name email phone')
            .populate('barberId', 'name phone')
            .populate('serviceId', 'name price duration')
            .sort({ appointmentDate: 1 });

        res.status(200).json({
            success: true,
            message: 'Citas del barbero obtenidas exitosamente',
            total: appointments.length,
            data: appointments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las citas del barbero',
            error: error.message
        });
    }
};

export const getMyAppointments = async (req, res) => {
    try {
        const client = req.clientFromToken;
        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado para el usuario autenticado'
            });
        }

        const appointments = await Appointment.find({ clienteId: client._id })
            .populate('clienteId', 'name email phone')
            .populate('barberId', 'name phone')
            .populate('serviceId', 'name price duration')
            .sort({ appointmentDate: -1 });

        res.status(200).json({
            success: true,
            message: 'Citas del cliente obtenidas exitosamente',
            total: appointments.length,
            data: appointments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener tus citas',
            error: error.message
        });
    }
};

export const getAppointmentsByClient = async (req, res) => {
    try {
        const { clientId } = req.params;
        const appointments = await Appointment.find({ clienteId: clientId })
            .populate('clienteId', 'name email phone')
            .populate('barberId', 'name phone')
            .populate('serviceId', 'name price duration')
            .sort({ appointmentDate: -1 });

        res.status(200).json({
            success: true,
            message: 'Citas del cliente obtenidas exitosamente',
            total: appointments.length,
            data: appointments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las citas del cliente',
            error: error.message
        });
    }
};

export const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const allowedFields = ['clienteId', 'barberId', 'serviceId', 'appointmentDate', 'status'];
        const updates = {};

        allowedFields.forEach((field) => {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                updates[field] = req.body[field];
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se enviaron campos para actualizar'
            });
        }

        const updated = await Appointment.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        })
            .populate('clienteId', 'name email phone')
            .populate('barberId', 'name phone')
            .populate('serviceId', 'name price duration');

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Cita no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cita actualizada exitosamente',
            data: updated
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la cita',
            error: error.message
        });
    }
};

export const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        const canceled = await Appointment.findByIdAndUpdate(
            id,
            { status: 'CANCELADA' },
            { new: true, runValidators: true }
        )
            .populate('clienteId', 'name email phone')
            .populate('barberId', 'name phone')
            .populate('serviceId', 'name price duration');

        if (!canceled) {
            return res.status(404).json({
                success: false,
                message: 'Cita no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cita cancelada exitosamente',
            data: canceled
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cancelar la cita',
            error: error.message
        });
    }
};