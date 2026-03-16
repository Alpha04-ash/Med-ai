import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

export const userRoutes = Router();

userRoutes.post('/', UserController.createUser);
userRoutes.get('/:id', UserController.getUser);
userRoutes.get('/:id/export', UserController.exportData);
userRoutes.delete('/:id/purge', UserController.purgeData);
