import express from 'express';
import cors from 'cors';

const app = express();

// Middlewares
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// Ruta de health check directa
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API funcionando correctamente'
  });
});

export default app;