'use strict';

import Product from '../src/product/product.model.js';
import Service from '../src/service/service.model.js';
import Haircut from '../src/haircut/haircut.model.js';
import Barber from '../src/barber/barber.model.js';
import Client from '../src/client/client.model.js';

export const seedDatabase = async () => {
    try {
        console.log('Seeder | Iniciando comprobación de datos...');

        // 1. Seed Haircuts
        const haircutCount = await Haircut.countDocuments();
        if (haircutCount === 0) {
            console.log('Seeder | Insertando cortes de cabello por defecto...');
            const defaultHaircuts = [
                {
                    name: 'Fade Clásico',
                    description: 'Un desvanecido clásico que va desde la piel hasta la parte superior de forma suave.',
                    imageRef: 'https://res.cloudinary.com/djuxr89ny/image/upload/v1700000000/classic-fade.jpg',
                    faceTypeRecommended: 'OVALADO'
                },
                {
                    name: 'Pompadour Moderno',
                    description: 'Peinado alto hacia atrás con volumen en la parte superior y lados cortos.',
                    imageRef: 'https://res.cloudinary.com/djuxr89ny/image/upload/v1700000000/pompadour.jpg',
                    faceTypeRecommended: 'CUADRADO'
                },
                {
                    name: 'Buzz Cut',
                    description: 'Corte muy corto y uniforme ideal para caras redondas u ovaladas.',
                    imageRef: 'https://res.cloudinary.com/djuxr89ny/image/upload/v1700000000/buzz-cut.jpg',
                    faceTypeRecommended: 'REDONDO'
                }
            ];
            await Haircut.insertMany(defaultHaircuts);
            console.log('Seeder | Cortes de cabello insertados.');
        }

        // 2. Seed Products
        const productCount = await Product.countDocuments();
        if (productCount === 0) {
            console.log('Seeder | Insertando productos por defecto...');
            const defaultProducts = [
                {
                    name: 'Cera para Cabello Fijación Fuerte',
                    description: 'Cera a base de agua con acabado mate y fijación fuerte para todo el día.',
                    price: 85.00,
                    pointsPrice: 85,
                    stock: 50,
                    category: 'WAX',
                    image: 'https://res.cloudinary.com/djuxr89ny/image/upload/v1700000000/hair-wax.jpg',
                    status: 'active'
                },
                {
                    name: 'Shampoo Anticaída Orgánico',
                    description: 'Shampoo con ingredientes naturales para fortalecer el cabello desde la raíz.',
                    price: 120.00,
                    pointsPrice: 120,
                    stock: 30,
                    category: 'SHAMPOO',
                    image: 'https://res.cloudinary.com/djuxr89ny/image/upload/v1700000000/shampoo.jpg',
                    status: 'active'
                },
                {
                    name: 'Aceite de Eucalipto para Barba',
                    description: 'Aceite hidratante y aromático para mantener una barba suave y brillosa.',
                    price: 95.00,
                    pointsPrice: 95,
                    stock: 25,
                    category: 'BEARD_OIL',
                    image: 'https://res.cloudinary.com/djuxr89ny/image/upload/v1700000000/beard-oil.jpg',
                    status: 'active'
                }
            ];
            await Product.insertMany(defaultProducts);
            console.log('Seeder | Productos insertados.');
        }

        // 3. Seed Services
        const serviceCount = await Service.countDocuments();
        if (serviceCount === 0) {
            console.log('Seeder | Insertando servicios por defecto...');
            const defaultServices = [
                {
                    name: 'Corte de Cabello VIP',
                    description: 'Corte de cabello personalizado con lavado, asesoría de imagen y bebida de cortesía.',
                    price: 100.00,
                    pointsPrice: 100,
                    duration: '45min',
                    category: 'CORTE_DE_CABELLO',
                    status: 'activo'
                },
                {
                    name: 'Afeitado de Barba Tradicional',
                    description: 'Afeitado tradicional con toalla caliente, espuma premium y masaje facial.',
                    price: 75.00,
                    pointsPrice: 75,
                    duration: '30min',
                    category: 'AFEITADO',
                    status: 'activo'
                },
                {
                    name: 'Tratamiento Facial Exfoliante',
                    description: 'Limpieza facial profunda con exfoliación y mascarilla de carbón activo.',
                    price: 150.00,
                    pointsPrice: 150,
                    duration: '40min',
                    category: 'TRATAMIENTOS_FACIALES',
                    status: 'activo'
                }
            ];
            await Service.insertMany(defaultServices);
            console.log('Seeder | Servicios insertados.');
        }

        // 4. Seed Barbers
        const barberCount = await Barber.countDocuments();
        if (barberCount === 0) {
            console.log('Seeder | Insertando barberos por defecto...');
            const defaultBarbers = [
                {
                    name: 'Juan El Barbero',
                    email: 'juan@barberia.com',
                    password: 'Barbero1234!',
                    phone: '55551234',
                    schedule: [
                        { days: 'Lunes a Viernes', hours: '09:00 - 18:00' },
                        { days: 'Sábado', hours: '09:00 - 14:00' }
                    ],
                    status: true
                },
                {
                    name: 'Carlos Estilista',
                    email: 'carlos@barberia.com',
                    password: 'Barbero1234!',
                    phone: '55555678',
                    schedule: [
                        { days: 'Lunes a Viernes', hours: '10:00 - 19:00' },
                        { days: 'Sábado', hours: '09:00 - 16:00' }
                    ],
                    status: true
                }
            ];
            for (const barberData of defaultBarbers) {
                await Barber.create(barberData);
            }
            console.log('Seeder | Barberos insertados.');
        }

        // 5. Seed Clients
        const clientDemo = await Client.findOne({ email: 'cliente@demo.com' });
        if (!clientDemo) {
            console.log('Seeder | Creando cliente demo...');
            await Client.create({
                name: 'Cliente Demo',
                email: 'cliente@demo.com',
                password: 'Cliente1234!',
                phone: '55559999',
                faceshape: 'OVALADO',
                points: 50,
                status: true,
                userId: 'usr_c1ientDemo12'
            });
        } else {
            // Asegurar que el cliente demo existente tenga el userId correcto
            clientDemo.userId = 'usr_c1ientDemo12';
            await clientDemo.save();
        }

        console.log('Seeder | Base de datos sincronizada con éxito.');
    } catch (error) {
        console.error('Seeder | Error en la semilla de base de datos:', error.message);
    }
};
