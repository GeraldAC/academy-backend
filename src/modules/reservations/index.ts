// src/modules/reservations/index.ts
import { reservationRoutes } from './reservations.routes';
import { paymentRoutes } from './payments.routes';

export const reservationsModule = {
  routes: reservationRoutes,
};

export const paymentsModule = {
  routes: paymentRoutes,
};
