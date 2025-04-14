export type LogMethod = 'log' | 'info' | 'warn' | 'error' | 'debug' | 'time' | 'timeEnd';

export type LoggerType = {
  log: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  debug: (...args: any[]) => void;
  time: (label: string) => void;
  timeEnd: (label: string) => void;
};

export function createLogger(enabled: boolean, consoleObj: Console): LoggerType {
  const logMethod = (method: LogMethod, ...args: any[]): void => {
    if (enabled) {
      consoleObj[method](...args);
    }
  };

  return {
    log: (...args: any[]): void => logMethod('log', ...args),
    info: (...args: any[]): void => logMethod('info', ...args),
    warn: (...args: any[]): void => logMethod('warn', ...args),
    error: (...args: any[]): void => logMethod('error', ...args),
    debug: (...args: any[]): void => logMethod('debug', ...args),
    time: (label: string): void => logMethod('time', label),
    timeEnd: (label: string): void => logMethod('timeEnd', label)
  };
}
