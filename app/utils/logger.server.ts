import { createLogger } from './logger';

const isEnabled = process.env.NODE_ENV !== 'production';
    
export const serverLogger = createLogger(isEnabled, console);

export default serverLogger;
