import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './utils/env';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { initWebSocket } from './websockets/stream';
import { apiRoutes } from './routes/api.routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1', apiRoutes);

// Error Handling
app.use(errorHandler);

const server = http.createServer(app);

// Initialize WebSocket stream
initWebSocket(server);

server.listen(env.PORT, () => {
    logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
});
