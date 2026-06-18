'use strict';

import jwt from 'jsonwebtoken';
import { cloudinary } from './file-uploader.js';
import Client from '../src/client/client.model.js';

const DEFAULT_AVATAR_URL = process.env.DEFAULT_AVATAR_URL
    || 'https://res.cloudinary.com/djuxr89ny/image/upload/HaircutFiveFriends/images/default-avatar_ewzxwx.png';

const cleanUploadedFile = async (req) => {
    if (req.file && req.file.filename) {
        try {
            await cloudinary.uploader.destroy(req.file.filename);
        } catch (err) {
            console.error('Error limpiando imagen tras validación de JWT:', err);
        }
    }
};

export const validateJWT = (req, res, next) => {
    try {
        let token =
            req.header('x-token') ||
            req.header('authorization') ||
            req.query.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No hay token en la petición',
            });
        }

        token = token.replace(/^Bearer\s+/i, '');

        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE,
        });

        console.log('JWT payload:', decoded);

        req.auth = {
            ...decoded,
            userId: decoded.sub,
        };
        req.userId = decoded.sub;
        req.userRole = decoded.role;

        next();
    } catch (error) {
        let message = 'Token inválido';
        if (error.name === 'TokenExpiredError') message = 'Token expirado';

        return res.status(401).json({ success: false, message, error: error.message });
    }
};

export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.userRole || !allowedRoles.includes(req.userRole)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para esta acción',
            });
        }
        next();
    };
};

export const attachClientFromToken = async (req, res, next) => {
    try {
        if (!req.userId) return next();

        let client = await Client.findOne({ userId: req.userId });

        // If not found by userId, try finding by email
        const email = (req.auth?.email || req.auth?.Email || req.auth?.User?.Email || req.auth?.email || '').toLowerCase();
        if (!client && email) {
            client = await Client.findOne({ email });
        }

        if (!client && req.auth?.email) {
            client = await Client.create({
                userId: req.userId,
                name: req.auth.name || req.auth.email.split('@')[0] || 'Cliente',
                email: req.auth.email.toLowerCase(),
                phone: req.auth.phone || '00000000',
                password: Math.random().toString(36).slice(2),
            });
        }

        req.clientFromToken = client || null;
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const requireClientFromToken = (req, res, next) => {
    if (!req.clientFromToken) {
        return res.status(404).json({
            success: false,
            message: 'Cliente no encontrado para el usuario autenticado',
        });
    }
    next();
};

export const ensureClientMatchesToken = async (req, res, next) => {
    try {
        // ADMIN_ROLE can create clients with any email — skip token-match check
        if (req.userRole === 'ADMIN_ROLE') {
            return next();
        }

        const tokenEmail = req.auth?.email || req.auth?.Email || req.auth?.User?.Email || req.auth?.user?.Email;
        const tokenPassword = req.auth?.password || req.auth?.Password || req.auth?.User?.Password || req.auth?.user?.Password;
        const tokenProfile = req.auth?.profilePicture || req.auth?.ProfilePicture || req.auth?.Imagen || req.auth?.User?.Imagen || req.auth?.user?.Imagen;

        const bodyEmail = req.body?.email;
        const bodyPassword = req.body?.password;
        const bodyProfile = req.file?.path || req.body?.profilePicture;

        if (!tokenEmail) {
            await cleanUploadedFile(req);
            return res.status(401).json({
                success: false,
                message: 'El token debe incluir email para crear el cliente',
            });
        }

        if (!bodyEmail || !bodyPassword) {
            await cleanUploadedFile(req);
            return res.status(400).json({
                success: false,
                message: 'El correo y la contraseña son obligatorios en el cuerpo de la petición',
            });
        }

        const emailsMatch = tokenEmail.toLowerCase() === bodyEmail.toLowerCase();
        if (!emailsMatch) {
            await cleanUploadedFile(req);
            return res.status(401).json({
                success: false,
                message: 'El correo del token no coincide con el enviado en la petición',
            });
        }

        const isHash = typeof tokenPassword === 'string' && tokenPassword.startsWith('$');
        if (tokenPassword && !isHash && bodyPassword !== tokenPassword) {
            await cleanUploadedFile(req);
            return res.status(401).json({
                success: false,
                message: 'La contraseña del token no coincide con la enviada en la petición',
            });
        }

        const tokenProfileResolved = tokenProfile && !tokenProfile.startsWith('http')
            ? `${process.env.CLOUDINARY_BASE_URL || 'https://res.cloudinary.com/djuxr89ny/image/upload/'}${tokenProfile}`
            : tokenProfile;

        const tokenHasCustomProfile = tokenProfileResolved && tokenProfileResolved !== DEFAULT_AVATAR_URL;
        if (tokenHasCustomProfile) {
            if (!bodyProfile || bodyProfile !== tokenProfileResolved) {
                await cleanUploadedFile(req);
                return res.status(401).json({
                    success: false,
                    message: 'La imagen de perfil del token no coincide con la enviada en la petición',
                });
            }
        }

        next();
    } catch (error) {
        await cleanUploadedFile(req);
        return res.status(500).json({ success: false, message: error.message });
    }
};
