import EventEmitter from 'events';
import sensorConfig from './sensor-config.json';

export interface SensorConfig {
  busNumber: number;
  frameId: number;
  signalIndex: number;
  sensorName: string;
  unit: string;
  minValue: number;
  maxValue: number;
  intervalMs: number; // fixed interval between samples for this sensor
}

export interface TelemetryReading {
  sensorId: number;
  value: number;
  timestamp: number; // unix seconds
}

export const telemetryEmitter = new EventEmitter();

const sensors: SensorConfig[] = sensorConfig;

export function computeSensorId(sensor: SensorConfig): number {
  let uniqueId = sensor.busNumber;
  uniqueId = uniqueId * 10_000_000_000 + sensor.frameId;
  uniqueId = uniqueId * 100 + sensor.signalIndex;
  return uniqueId;
}

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// With this probability the emulator sends a reading in an incorrect format (for assessment).
const INVALID_FORMAT_PROBABILITY = 0.15;
// With this probability the emulator sends a value outside the sensor's valid range (overspill).
const OVERSPILL_PROBABILITY = 0.20;

function scheduleSensor(sensor: SensorConfig): void {
  const interval = Math.max(50, sensor.intervalMs);
  setTimeout(() => {
    const sensorId = computeSensorId(sensor);
    let value: number;
    if (Math.random() < OVERSPILL_PROBABILITY) {
      // Overspill: emit a value outside [minValue, maxValue] so the API can detect out-of-range.
      const span = sensor.maxValue - sensor.minValue;
      value = Math.random() < 0.5
        ? sensor.minValue - span * (0.1 + Math.random() * 0.5)
        : sensor.maxValue + span * (0.1 + Math.random() * 0.5);
    } else {
      value = randomInRange(sensor.minValue, sensor.maxValue);
    }
    const timestamp = Date.now() / 1000;

    if (Math.random() < INVALID_FORMAT_PROBABILITY) {
      // Emit an invalid payload (wrong types, missing field, or junk) so the API must validate.
      const roll = Math.random();
      const payload =
        roll < 0.33
          ? { sensorId: String(sensorId), value, timestamp }
          : roll < 0.66
            ? { sensorId, value: String(value), timestamp }
            : { sensorId, value, timestamp, extra: 'junk' };

      // Log invalid-format payloads for visibility.
      console.log('[emulator] invalid-format', JSON.stringify(payload));
      telemetryEmitter.emit('reading', payload);
    } else {
      const reading: TelemetryReading = { sensorId, value, timestamp };
      // Log normal readings (including overspill) for visibility even without WebSocket clients.
      console.log('[emulator] reading', JSON.stringify(reading));
      telemetryEmitter.emit('reading', reading);
    }

    scheduleSensor(sensor);
  }, interval);
}

export function startEmulator(): void {
  sensors.forEach((sensor) => scheduleSensor(sensor));
}

export function getSensorConfigs(): SensorConfig[] {
  return sensors;
}

