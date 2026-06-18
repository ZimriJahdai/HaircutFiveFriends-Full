'use strict';

import Favorites from './favorites.model.js';
import Product from '../product/product.model.js';
import Service from '../service/service.model.js';
import Haircut from '../haircut/haircut.model.js';
import Barber from '../barber/barber.model.js';

const ensureUserOwnsClient = (req, targetClientId) => {
    if (req.userRole === 'USER_ROLE') {
        if (!req.clientFromToken) {
            return {
                status: 404,
                message: 'Cliente no encontrado para el usuario autenticado'
            };
        }
        if (String(req.clientFromToken._id) !== String(targetClientId)) {
            return {
                status: 403,
                message: 'No puedes gestionar favoritos de otro cliente'
            };
        }
    }
    return null;
};

export const createFavorite = async (req, res) => {
    try {
        const payload = { ...req.body };
        console.log('createFavorite | req.userRole:', req.userRole, '| req.clientFromToken:', req.clientFromToken ? req.clientFromToken.name : 'null', '| payload:', payload);
        if (req.userRole === 'USER_ROLE') {
            if (!req.clientFromToken) {
                return res.status(404).json({ success: false, message: 'Cliente no encontrado para el usuario autenticado' });
            }
            if (payload.clientId && String(payload.clientId) !== String(req.clientFromToken._id)) {
                return res.status(403).json({ success: false, message: 'No puedes crear favoritos para otro cliente' });
            }
            payload.clientId = req.clientFromToken._id;
        }

        const { typeFavorite, referenceId } = payload;
        if (!typeFavorite || !referenceId) {
            return res.status(400).json({ success: false, message: 'typeFavorite y referenceId son requeridos' });
        }

        let model;
        switch (typeFavorite) {
            case 'PRODUCT':
                model = Product;
                break;
            case 'SERVICE':
                model = Service;
                break;
            case 'HAIRCUT':
                model = Haircut;
                break;
            case 'BARBER':
                model = Barber;
                break;
            default:
                return res.status(400).json({ success: false, message: 'Tipo de favorito no válido' });
        }

        const exists = await model.findById(referenceId);
        if (!exists) {
            return res.status(404).json({ success: false, message: `No se encontró el ${typeFavorite.toLowerCase()} referenciado` });
        }

        const favorite = new Favorites(payload);
        await favorite.save();
        return res.status(201).json({ success: true, data: favorite });
    } catch (error) {
        // handle duplicate key from unique index
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'Favorite already exists' });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const getFavorites = async (req, res) => {
    try {
        const { clientId, typeFavorite } = req.query;
        console.log('getFavorites | req.userRole:', req.userRole, '| req.clientFromToken:', req.clientFromToken ? req.clientFromToken.name : 'null', '| query:', req.query);
        const filter = {};
        if (req.userRole === 'USER_ROLE') {
            if (!req.clientFromToken) {
                return res.status(404).json({ success: false, message: 'Cliente no encontrado para el usuario autenticado' });
            }
            filter.clientId = req.clientFromToken._id;
        } else if (clientId) {
            filter.clientId = clientId;
        }
        if (typeFavorite) filter.typeFavorite = typeFavorite;

        const favorites = await Favorites.find(filter).populate('clientId');
        const populatedFavorites = await Promise.all(
            favorites.map(async (fav) => {
                let modelName = '';
                switch (fav.typeFavorite) {
                    case 'PRODUCT':
                        modelName = 'Product';
                        break;
                    case 'SERVICE':
                        modelName = 'Service';
                        break;
                    case 'HAIRCUT':
                        modelName = 'Haircut';
                        break;
                    case 'BARBER':
                        modelName = 'Barber';
                        break;
                }
                if (modelName) {
                    return await fav.populate({ path: 'referenceId', model: modelName });
                }
                return fav;
            })
        );
        return res.status(200).json({ success: true, data: populatedFavorites });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const getFavoriteById = async (req, res) => {
    try {
        const { id } = req.params;
        let favorite = await Favorites.findById(id).populate('clientId');
        if (!favorite) return res.status(404).json({ success: false, message: 'Favorite not found' });
        const ownershipError = ensureUserOwnsClient(req, favorite.clientId);
        if (ownershipError) {
            return res.status(ownershipError.status).json({ success: false, message: ownershipError.message });
        }

        let modelName = '';
        switch (favorite.typeFavorite) {
            case 'PRODUCT':
                modelName = 'Product';
                break;
            case 'SERVICE':
                modelName = 'Service';
                break;
            case 'HAIRCUT':
                modelName = 'Haircut';
                break;
            case 'BARBER':
                modelName = 'Barber';
                break;
        }
        if (modelName) {
            favorite = await favorite.populate({ path: 'referenceId', model: modelName });
        }

        return res.status(200).json({ success: true, data: favorite });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const updateFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        const favorite = await Favorites.findById(id);
        if (!favorite) return res.status(404).json({ success: false, message: 'Favorite not found' });

        const ownershipError = ensureUserOwnsClient(req, favorite.clientId);
        if (ownershipError) {
            return res.status(ownershipError.status).json({ success: false, message: ownershipError.message });
        }

        const payload = { ...req.body };
        if (req.userRole === 'USER_ROLE') {
            payload.clientId = req.clientFromToken?._id;
        }

        const typeFavorite = payload.typeFavorite || favorite.typeFavorite;
        const referenceId = payload.referenceId || favorite.referenceId;

        let model;
        switch (typeFavorite) {
            case 'PRODUCT':
                model = Product;
                break;
            case 'SERVICE':
                model = Service;
                break;
            case 'HAIRCUT':
                model = Haircut;
                break;
            case 'BARBER':
                model = Barber;
                break;
            default:
                return res.status(400).json({ success: false, message: 'Tipo de favorito no válido' });
        }

        const exists = await model.findById(referenceId);
        if (!exists) {
            return res.status(404).json({ success: false, message: `No se encontró el ${typeFavorite.toLowerCase()} referenciado` });
        }

        const updated = await Favorites.findByIdAndUpdate(id, payload, { new: true });
        if (!updated) return res.status(404).json({ success: false, message: 'Favorite not found' });
        return res.status(200).json({ success: true, data: updated });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'Favorite already exists' });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const deleteFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        const favorite = await Favorites.findById(id);
        if (!favorite) return res.status(404).json({ success: false, message: 'Favorite not found' });

        const ownershipError = ensureUserOwnsClient(req, favorite.clientId);
        if (ownershipError) {
            return res.status(ownershipError.status).json({ success: false, message: ownershipError.message });
        }

        const deleted = await Favorites.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Favorite not found' });
        return res.status(200).json({ success: true, data: deleted });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
