'use strict';

import mongoose from 'mongoose';

export const dbConnection = async () => {
  try {
     mongoose.connection.on('error', () => {
        console.log('MongoDB | no se pudo conectar a mongoDB');
        mongoose.disconnect();
        });

        mongoose.connection.on('connecting', () => {
        console.log('MongoDB | intentando conectar a mongoDB');
        });

        mongoose.connection.on('connected', () => {
        console.log('MongoDB | conectado a mongoDB');
        });

        mongoose.connection.on('open', () => {
        console.log('MongoDB | conectado a la base de datos HaircutFiveFriends');
        });
        
        mongoose.connection.on('reconnected', () => {
        console.log('MongoDB | reconectando a mongoDB');
        });

        mongoose.connection.on('disconnected', () => {
        console.log('MongoDB | desconectado a mongoDB');
        });

        await mongoose.connect(process.env.URI_MONGO, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10
        });

        // Verificar si la base de datos está vacía y ejecutar seed.js
        try {
            const barberCount = await mongoose.connection.db.collection('barbers').countDocuments();
            if (barberCount === 0) {
                console.log('MongoDB | Base de datos vacía en barberos');
                const { exec } = await import('child_process');
                exec('node seed.js', (err, stdout, stderr) => {
                    if (err) {
                        console.error(`MongoDB | Error al ejecutar seed.js: ${err.message}`);
                        return;
                    }
                    console.log(`MongoDB | Seeder completado:\n${stdout}`);
                });
            } else {
                console.log(`MongoDB | Registros existentes encontrados (${barberCount} barberos). Omitiendo seed.`);
            }
        } catch (dbErr) {
            console.warn(`MongoDB | No se pudo verificar la colección para seed: ${dbErr.message}`);
        }
    }
    catch (error) {
    console.log(`Database connection error: ${error}`);
  }
};

const gracefulShutdown = async (signal) => {
    console.log(`MongoDB | Received ${signal}. Closing MongoDB connection...`);
    try {
        await mongoose.connection.close();
        console.log('MongoDB | Database connection closed successfully');
        process.exit(0);
    } catch (error) {
        console.error(`MongoDB | Error during graceful shutdown:`, error.message);
        process.exit(1);

    }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));