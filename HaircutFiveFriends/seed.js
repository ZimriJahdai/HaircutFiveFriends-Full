'use strict';

/**
 * seed.js — HaircutFiveFriends Database Seeder
 *
 * Uso (desde HaircutFiveFriends/):
 *   node seed.js           → Agrega datos sin borrar existentes
 *   node seed.js --clean   → Limpia colecciones primero, luego agrega
 */

import mongoose from 'mongoose';
import dotenv   from 'dotenv';

dotenv.config();

// ── Models ────────────────────────────────────────────────────────────────────
import Client      from './src/client/client.model.js';
import Barber      from './src/barber/barber.model.js';
import Service     from './src/service/service.model.js';
import Haircut     from './src/haircut/haircut.model.js';
import Product     from './src/product/product.model.js';
import Appointment from './src/appointment/appointment.model.js';
import Review      from './src/review/review.model.js';
import Sale        from './src/sale/sale.model.js';
import Detail      from './src/detailSale/detail.model.js';
import Favorites   from './src/favorites/favorites.model.js';

// ── Helpers ───────────────────────────────────────────────────────────────────
const CLEAN = process.argv.includes('--clean');
const IMG   = 'https://placehold.co/600x400/1a1a2e/facc15?text=';

const future = (days, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
};

const past = (days, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d;
};

// ── Main ──────────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.URI_MONGO);
  console.log('✅ MongoDB conectado\n');

  // Limpiar en orden inverso de dependencias
  if (CLEAN) {
    await Promise.all([
      Favorites.deleteMany({}),
      Sale.deleteMany({}),
      Detail.deleteMany({}),
      Review.deleteMany({}),
      Appointment.deleteMany({}),
      Client.deleteMany({}),
      Barber.deleteMany({}),
      Haircut.deleteMany({}),
      Product.deleteMany({}),
      Service.deleteMany({}),
    ]);
    console.log('🗑️  Colecciones limpiadas\n');
  }

  // ── 1. SERVICES ─────────────────────────────────────────────────────────
  // insertMany no dispara pre-save hooks (OK, Service no los tiene)
  const services = await Service.insertMany([
    {
      name: 'Corte Clásico',
      description: 'Corte tradicional con tijera y máquina, bordes limpios y definidos.',
      price: 50, pointsPrice: 30, duration: '30min',
      category: 'CORTE_DE_CABELLO', status: 'activo',
    },
    {
      name: 'Fade Premium',
      description: 'Degradado progresivo skin-to-top de alta precisión, técnica moderna.',
      price: 80, pointsPrice: 50, duration: '45min',
      category: 'CORTE_DE_CABELLO', status: 'activo',
    },
    {
      name: 'Afeitado Tradicional',
      description: 'Afeitado clásico con navaja, toalla caliente y bálsamo post-afeitado.',
      price: 35, pointsPrice: 20, duration: '20min',
      category: 'AFEITADO', status: 'activo',
    },
    {
      name: 'Arreglo de Barba',
      description: 'Perfilado y definición de barba con navaja y aceite hidratante premium.',
      price: 45, pointsPrice: 25, duration: '25min',
      category: 'RECORTES_DE_BARBA', status: 'activo',
    },
    {
      name: 'Tratamiento Capilar',
      description: 'Hidratación y nutrición intensiva del cuero cabelludo con productos premium.',
      price: 120, pointsPrice: 80, duration: '60min',
      category: 'TRATAMIENTOS_CAPILARES', status: 'activo',
    },
    {
      name: 'Facial Masculino',
      description: 'Limpieza profunda, exfoliación y mascarilla hidratante para piel masculina.',
      price: 95, pointsPrice: 60, duration: '45min',
      category: 'TRATAMIENTOS_FACIALES', status: 'activo',
    },
    {
      name: 'Combo Corte y Barba',
      description: 'Combo completo: corte de cabello y arreglo de barba al mejor precio.',
      price: 90, pointsPrice: 55, duration: '55min',
      category: 'CORTE_DE_CABELLO', status: 'activo',
    },
  ]);
  console.log(`✅ Servicios:    ${services.length}`);

  // ── 2. PRODUCTS ─────────────────────────────────────────────────────────
  const products = await Product.insertMany([
    {
      name: 'Shampoo Men Power',
      description: 'Shampoo anticaspa con keratina, aroma fresco alpino.',
      price: 85, pointsPrice: 50, stock: 30, category: 'SHAMPOO', status: 'active',
    },
    {
      name: 'Cera Mate Strong',
      description: 'Cera de fijación fuerte con acabado mate, sin residuos grasos.',
      price: 65, pointsPrice: 40, stock: 25, category: 'WAX', status: 'active',
    },
    {
      name: 'Gel Ultra Hold',
      description: 'Gel de fijación extrema con brillo natural, ideal para looks estructurados.',
      price: 45, pointsPrice: 25, stock: 40, category: 'GEL', status: 'active',
    },
    {
      name: 'Aceite de Barba Premium',
      description: 'Mezcla de argán y jojoba para barba suave, nutrida y brillante.',
      price: 120, pointsPrice: 70, stock: 15, category: 'BEARD_OIL', status: 'active',
    },
    {
      name: 'Máquina Wahl Pro',
      description: 'Cortadora inalámbrica profesional con 8 peinillas de guía incluidas.',
      price: 850, pointsPrice: 500, stock: 5, category: 'MACHINES', status: 'active',
    },
    {
      name: 'Peine de Madera Natural',
      description: 'Peine artesanal de sándalo, anticarga estática, suave con el cabello.',
      price: 55, pointsPrice: 30, stock: 20, category: 'ACCESSORIES', status: 'active',
    },
  ]);
  console.log(`✅ Productos:    ${products.length}`);

  // ── 3. HAIRCUTS ─────────────────────────────────────────────────────────
  // imageRef es required — usando placeholders para seed
  const haircuts = await Haircut.insertMany([
    {
      name: 'Fade Clásico',
      description: 'Degradado desde skin en los lados hasta mayor largo en la parte superior. Estilo urbano y moderno.',
      imageRef: `${IMG}Fade+Clasico`,
      faceTypeRecommended: 'OVALADO',
    },
    {
      name: 'Texturizado Casual',
      description: 'Textura y movimiento en la parte superior con lados cortos. Volumen casual y desenfadado.',
      imageRef: `${IMG}Texturizado`,
      faceTypeRecommended: 'CUADRADO',
    },
    {
      name: 'Undercut Moderno',
      description: 'Lados completamente rapados con contraste marcado en la parte superior, peinado hacia atrás.',
      imageRef: `${IMG}Undercut`,
      faceTypeRecommended: 'REDONDO',
    },
    {
      name: 'Pompadour Elegante',
      description: 'Cabello peinado hacia arriba y hacia atrás con volumen frontal. Estilo retro contemporáneo.',
      imageRef: `${IMG}Pompadour`,
      faceTypeRecommended: 'CUALQUIERA',
    },
    {
      name: 'Lateral Definido',
      description: 'Raya lateral marcada, un lado más largo que el otro. Versátil para ambientes formales e informales.',
      imageRef: `${IMG}Lateral`,
      faceTypeRecommended: 'CORAZÓN',
    },
    {
      name: 'Buzz Cut',
      description: 'Corte al rape uniforme. Mínimo mantenimiento, máxima limpieza y frescura.',
      imageRef: `${IMG}Buzz+Cut`,
      faceTypeRecommended: 'TRIANGULAR',
    },
  ]);
  console.log(`✅ Cortes:       ${haircuts.length}`);

  // ── 4. BARBERS (save → activa pre-save bcrypt hash) ─────────────────────
  const [b1, b2, b3] = await Promise.all([
    new Barber({
      name: 'Carlos Mendoza',
      email: 'carlos.mendoza@haircutff.com',
      password: 'Barber123',
      phone: '55554321',
      schedule: [
        { days: 'Lunes-Viernes', hours: '09:00-18:00' },
        { days: 'Sábado',        hours: '09:00-14:00' },
      ],
    }).save(),
    new Barber({
      name: 'Luis García',
      email: 'luis.garcia@haircutff.com',
      password: 'Barber123',
      phone: '55558765',
      schedule: [
        { days: 'Martes-Sábado', hours: '10:00-19:00' },
      ],
    }).save(),
    new Barber({
      name: 'Miguel Torres',
      email: 'miguel.torres@haircutff.com',
      password: 'Barber123',
      phone: '55561234',
      schedule: [
        { days: 'Lunes-Jueves', hours: '08:00-17:00' },
        { days: 'Viernes',      hours: '08:00-15:00' },
      ],
    }).save(),
  ]);
  const barbers = [b1, b2, b3];
  console.log(`✅ Barberos:     ${barbers.length}`);

  // ── 5. CLIENTS (save → activa pre-save bcrypt hash) ─────────────────────
  const [c1, c2, c3, c4, c5] = await Promise.all([
    new Client({ name: 'Juan Pérez',      phone: '55551111', email: 'juan.perez@gmail.com',      password: 'Cliente123', faceshape: 'OVALADO',    points: 150 }).save(),
    new Client({ name: 'Mario López',     phone: '55552222', email: 'mario.lopez@gmail.com',     password: 'Cliente123', faceshape: 'CUADRADO',   points: 80  }).save(),
    new Client({ name: 'Roberto Sánchez', phone: '55553333', email: 'roberto.sanchez@gmail.com', password: 'Cliente123', faceshape: 'REDONDO',    points: 210 }).save(),
    new Client({ name: 'Diego Morales',   phone: '55554444', email: 'diego.morales@gmail.com',   password: 'Cliente123', faceshape: 'TRIANGULAR', points: 45  }).save(),
    new Client({ name: 'Andrés Castro',   phone: '55555555', email: 'andres.castro@gmail.com',   password: 'Cliente123', faceshape: 'CORAZÓN',    points: 320 }).save(),
  ]);
  const clients = [c1, c2, c3, c4, c5];
  console.log(`✅ Clientes:     ${clients.length}`);

  // ── 6. APPOINTMENTS ─────────────────────────────────────────────────────
  // Setters (normalizeToMinute) sí corren con insertMany
  const appointments = await Appointment.insertMany([
    { clienteId: c1._id, barberId: b1._id, serviceId: services[0]._id, appointmentDate: past(10), status: 'COMPLETADA' },
    { clienteId: c2._id, barberId: b2._id, serviceId: services[1]._id, appointmentDate: past(7),  status: 'COMPLETADA' },
    { clienteId: c3._id, barberId: b3._id, serviceId: services[3]._id, appointmentDate: past(5),  status: 'COMPLETADA' },
    { clienteId: c4._id, barberId: b1._id, serviceId: services[2]._id, appointmentDate: past(3),  status: 'CANCELADA'  },
    { clienteId: c1._id, barberId: b2._id, serviceId: services[4]._id, appointmentDate: future(2, 11), status: 'PENDIENTE' },
    { clienteId: c5._id, barberId: b3._id, serviceId: services[5]._id, appointmentDate: future(4, 14), status: 'PENDIENTE' },
    { clienteId: c3._id, barberId: b1._id, serviceId: services[6]._id, appointmentDate: future(6, 16), status: 'PENDIENTE' },
  ]);
  console.log(`✅ Citas:        ${appointments.length}`);

  // ── 7. REVIEWS (save → activa validación XOR barberoId / servicioId) ────
  const reviews = await Promise.all([
    new Review({ clienteId: c1._id, barberoId:  b1._id,           score: 5, comment: 'Excelente servicio, Carlos es muy profesional. El fade quedó perfecto, definitivamente volvería.' }).save(),
    new Review({ clienteId: c2._id, barberoId:  b2._id,           score: 4, comment: 'Luis tiene mucha experiencia. El corte estuvo muy bien, tardó un poco más pero valió la pena.' }).save(),
    new Review({ clienteId: c3._id, servicioId: services[3]._id,  score: 5, comment: 'El arreglo de barba fue increíble. Perfectamente definido y duró más de una semana.' }).save(),
    new Review({ clienteId: c4._id, barberoId:  b3._id,           score: 3, comment: 'El corte estuvo bien pero la espera fue larga. Buen servicio en general, mejorar los tiempos.' }).save(),
    new Review({ clienteId: c5._id, servicioId: services[0]._id,  score: 5, comment: 'Excelente experiencia. El corte clásico quedó impecable y el ambiente del local es muy agradable.' }).save(),
    new Review({ clienteId: c2._id, servicioId: services[1]._id,  score: 4, comment: 'El fade premium quedó muy bien. Buen precio por la calidad del trabajo realizado.' }).save(),
  ]);
  console.log(`✅ Reseñas:      ${reviews.length}`);

  // ── 8. DETAILS + SALES ──────────────────────────────────────────────────
  // IMPORTANTE: el pre-save hook de Detail (validateDetail.js) calcula
  // total = precio_del_servicio_o_producto * quantity automáticamente.
  // Solo hace falta pasar referenceId, detailType y quantity.

  // — Venta 1: Juan — Fade Premium (Q80) —
  const det1 = await new Detail({ referenceId: services[1]._id, detailType: 'SERVICE', quantity: 1 }).save();
  await new Sale({
    clientId: c1._id, saleType: 'LOCAL',
    detailId: [det1._id], saleDate: past(10),
    total: 80, moneyTotal: 80, totalPointsUsed: 0,
    paymentMethod: 'EFECTIVO', status: 'COMPLETADO',
  }).save();

  // — Venta 2: Mario — Corte Clásico (Q50) + 2× Gel (Q45×2=Q90) —
  const det2a = await new Detail({ referenceId: services[0]._id, detailType: 'SERVICE', quantity: 1 }).save();
  const det2b = await new Detail({ referenceId: products[2]._id, detailType: 'PRODUCT', quantity: 2 }).save();
  await new Sale({
    clientId: c2._id, saleType: 'LOCAL',
    detailId: [det2a._id, det2b._id], saleDate: past(7),
    total: 140, moneyTotal: 140, totalPointsUsed: 0,
    paymentMethod: 'TARJETA', status: 'COMPLETADO',
  }).save();

  // — Venta 3: Roberto — Facial Masculino (Q95) + Aceite de Barba (Q120) —
  const det3a = await new Detail({ referenceId: services[5]._id, detailType: 'SERVICE', quantity: 1 }).save();
  const det3b = await new Detail({ referenceId: products[3]._id, detailType: 'PRODUCT', quantity: 1 }).save();
  await new Sale({
    clientId: c3._id, saleType: 'LOCAL',
    detailId: [det3a._id, det3b._id], saleDate: past(5),
    total: 215, moneyTotal: 215, totalPointsUsed: 0,
    paymentMethod: 'EFECTIVO', status: 'COMPLETADO',
  }).save();

  // — Venta 4: Andrés — Combo Corte+Barba (Q90) + Cera Mate (Q65) —
  const det4a = await new Detail({ referenceId: services[6]._id, detailType: 'SERVICE', quantity: 1 }).save();
  const det4b = await new Detail({ referenceId: products[1]._id, detailType: 'PRODUCT', quantity: 1 }).save();
  await new Sale({
    clientId: c5._id, saleType: 'LOCAL',
    detailId: [det4a._id, det4b._id], saleDate: past(3),
    total: 155, moneyTotal: 155, totalPointsUsed: 0,
    paymentMethod: 'TARJETA', status: 'COMPLETADO',
  }).save();

  // — Venta 5: Diego — Afeitado (Q35) a domicilio, pendiente —
  const det5 = await new Detail({ referenceId: services[2]._id, detailType: 'SERVICE', quantity: 1 }).save();
  await new Sale({
    clientId: c4._id, saleType: 'DOMICILIO',
    addressSale: '5ta Avenida 10-50, Zona 1, Ciudad de Guatemala',
    detailId: [det5._id], saleDate: future(2),
    total: 35, moneyTotal: 35, totalPointsUsed: 0,
    paymentMethod: 'EFECTIVO', status: 'PENDIENTE',
  }).save();

  console.log(`✅ Ventas:       5  (7 detalles)`);

  // ── 9. FAVORITES ─────────────────────────────────────────────────────────
  // Índice único: clientId + typeFavorite + referenceId (no duplicados)
  await Favorites.insertMany([
    { clientId: c1._id, typeFavorite: 'BARBER',   referenceId: b1._id           },
    { clientId: c1._id, typeFavorite: 'SERVICE',  referenceId: services[1]._id  },
    { clientId: c1._id, typeFavorite: 'HAIRCUT',  referenceId: haircuts[0]._id  },
    { clientId: c2._id, typeFavorite: 'PRODUCT',  referenceId: products[2]._id  },
    { clientId: c3._id, typeFavorite: 'BARBER',   referenceId: b3._id           },
    { clientId: c3._id, typeFavorite: 'PRODUCT',  referenceId: products[3]._id  },
    { clientId: c5._id, typeFavorite: 'SERVICE',  referenceId: services[0]._id  },
    { clientId: c5._id, typeFavorite: 'HAIRCUT',  referenceId: haircuts[3]._id  },
  ]);
  console.log(`✅ Favoritos:    8`);

  // ── RESUMEN ───────────────────────────────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Seed completado:');
  console.log(`   Servicios  ${services.length} | Productos ${products.length} | Cortes   ${haircuts.length}`);
  console.log(`   Barberos   ${barbers.length}  | Clientes  ${clients.length}  | Citas    ${appointments.length}`);
  console.log(`   Reseñas    ${reviews.length}  | Ventas    5   | Favoritos 8`);
  console.log('\n🔐 Credenciales de prueba:');
  console.log('   Barberos → password: Barber123');
  console.log('   Clientes → password: Cliente123');
  console.log('\n📧 Emails de clientes:');
  clients.forEach(c => console.log(`   ${c.email}`));
  console.log('\n📧 Emails de barberos:');
  barbers.forEach(b => console.log(`   ${b.email}`));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
  console.log('🌱 ¡Listo!\n');
}

seed().catch((err) => {
  console.error('❌ Error en seed:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
