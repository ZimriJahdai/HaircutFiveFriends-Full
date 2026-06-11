'use strict';

import jwt from 'jsonwebtoken';

const normalizeToken = (token) => (token ? token.replace(/^Bearer\s+/i, '') : '');

export const verifyJWTToken = (token) => {
    if (!token) return null;
    const normalized = normalizeToken(token);
    return jwt.verify(normalized, process.env.JWT_SECRET, {
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE,
    });
};

export const getUserIdFromToken = (token) => {
    if (!token) return '';
    try {
        const decoded = verifyJWTToken(token);
        return decoded?.sub || '';
    } catch (error) {
        return '';
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

        const decoded = verifyJWTToken(token);

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

