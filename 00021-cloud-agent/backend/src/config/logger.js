import morgan from 'morgan';

morgan.token('url-path', req => req.path);
export const requestLogger = morgan(':method :url-path :status :response-time ms');
