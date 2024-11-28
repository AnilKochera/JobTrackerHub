interface LogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  data?: any;
}

class Logger {
  private maxEntries = 1000;
  private storageKey = 'jobtrackr_logs';

  private get entries(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    } catch {
      return [];
    }
  }

  private set entries(value: LogEntry[]) {
    const trimmed = value.slice(-this.maxEntries);
    localStorage.setItem(this.storageKey, JSON.stringify(trimmed));
  }

  private log(level: LogEntry['level'], message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
    };

    if (import.meta.env.DEV) {
      console[level](message, data);
    }

    this.entries = [...this.entries, entry];
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  getEntries(): LogEntry[] {
    return this.entries;
  }

  clear() {
    localStorage.removeItem(this.storageKey);
  }
}

export const logger = new Logger();