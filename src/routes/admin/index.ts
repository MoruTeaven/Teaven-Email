import { Hono } from 'hono';
import usersRouter from './users';
import providersRouter from './providers';
import analyticsRouter from './analytics';
import settingsRouter from './settings';

const adminRouter = new Hono<{ Bindings: Env }>();
adminRouter.route('/', usersRouter);
adminRouter.route('/', providersRouter);
adminRouter.route('/', analyticsRouter);
adminRouter.route('/', settingsRouter);

export default adminRouter;