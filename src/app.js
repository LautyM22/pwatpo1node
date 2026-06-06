import express from 'express';
import cardRoutes from './routes/cardRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Middlewares
app.use(express.json());

app.use('/api/cards', cardRoutes);


// Ruta de health check directa
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API funcionando correctamente'
  });
});

//Midleware de error
app.use(errorHandler);

export default app;