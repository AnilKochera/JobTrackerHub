import { logger } from './logger';

interface MetricTags {
  [key: string]: string;
}

class Metrics {
  private metrics: Map<string, number>;
  private startTimes: Map<string, number>;

  constructor() {
    this.metrics = new Map();
    this.startTimes = new Map();
  }

  increment(name: string, value = 1, tags: MetricTags = {}) {
    const key = this.getKey(name, tags);
    const current = this.metrics.get(key) || 0;
    this.metrics.set(key, current + value);
    this.log('increment', { name, value, tags });
  }

  timing(name: string, tags: MetricTags = {}) {
    const key = this.getKey(name, tags);
    this.startTimes.set(key, performance.now());
  }

  endTiming(name: string, tags: MetricTags = {}) {
    const key = this.getKey(name, tags);
    const startTime = this.startTimes.get(key);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.log('timing', { name, duration, tags });
      this.startTimes.delete(key);
    }
  }

  private getKey(name: string, tags: MetricTags): string {
    const tagString = Object.entries(tags)
      .map(([k, v]) => `${k}:${v}`)
      .join(',');
    return tagString ? `${name}:${tagString}` : name;
  }

  private log(type: string, data: any) {
    logger.info('Metric', { type, ...data });
  }
}

export const metrics = new Metrics();