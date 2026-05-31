/// <reference types="jest" />

// Carga variables de entorno de test ANTES que cualquier módulo
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

// Silencia console.log durante tests (opcional, comenta si prefieres verlos)
global.console.log = jest.fn();
global.console.error = jest.fn();
