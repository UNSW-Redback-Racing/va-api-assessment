## Vehicle Analytics API Assessment

Your task is to **design and implement** a clean API that exposes telemetry data from a
**multi-sensor emulator**. The repository provides a **skeleton** API (health check only) and a
**separate emulator service** that generates the data. **You must define and implement** the API
routes that consume the emulator and expose sensor metadata and telemetry to clients.

The focus is on:

- API design and separation of concerns (metadata vs data).
- Clear, consistent contracts and error handling.
- **You** produce an OpenAPI/Swagger spec that documents your **final** API (no full spec is
  provided; only the health endpoint is pre-defined).
- Reasonable testing and robustness.

This backend is intended to be consumed by the **VA frontend assessment** application  
([`va-frontend-assessment`](https://github.com/UNSW-Redback-Racing/va-frontend-assessment)),
but your API design should be generic enough for other clients too.

---

## Scenario

You are given:

- A **data emulator** (in `emulator/`) that runs as a **separate service** and generates
  readings for several sensors. The emulator is **read-only** – do not modify it.
- A minimal Node.js + TypeScript API skeleton in `api/`: Express server, CORS, and
  `GET /health`. No other routes are implemented; your API must **consume the emulator**
  (via HTTP/WebSocket) and expose the data to clients.

Each sensor has:

- A long **numeric `sensorId`** (computed inside the emulator from `busNumber`, `frameId`,
  `signalIndex` – see emulator code).
- A human-readable name and a unit.

---

## Required API behaviour (what you must provide)

Your API must support the following **behaviour**; the exact paths, HTTP methods, and
payload shapes are for you to design.

1. **Health**
   - A health check endpoint is already implemented at `GET /health`. You may keep it as-is
     or extend it.

2. **Metadata**
   - Clients need a way to discover sensors and map `sensorId` → to the `sensorName` and `unit`.
   - Your API must expose, for each sensor, at least: **sensorId**, **sensorName**, **unit**.

3. **Data**
   - Clients need access to **latest** telemetry, a route that provides the most recent reading
     for all sensors (sensorId, value, timestamp).
   - You may also offer **streaming** (e.g. WebSocket or SSE) so clients can receive
     readings in real time; that is optional but encouraged if you have time.

4. **Documentation**
   - You must document your **final** API with an OpenAPI 3.x spec (e.g. `openapi.yaml` or
     equivalent) and state in `justification.md` how to view or use it (e.g. Swagger UI).

The repository does **not** provide a full OpenAPI spec for the metadata and data endpoints.
Designing the routes, status codes, and response shapes is part of the assessment.

---

## Tasks

**You may NOT modify the emulator (`emulator/`) for any task.** Justify your approach for each task in `justification.md`.

1. **API design**  
   Design and implement the API surface on top of the emulator: choose paths, methods and
   response shapes for your metadata and data routes (and optional streaming), and document
   them with an OpenAPI 3.x spec. Explain your design choices and trade-offs.

2. **Invalid data from the emulator**  
   When running, the emulator occasionally sends readings in an **incorrect format** (e.g. wrong types, extra fields). This will be visible if you forward the raw stream to clients. Add logic in the **API** so that invalid data is not sent to the frontend (or stored as latest). What you do with invalid data (drop, log, count, etc.) is up to you, so long as it is justified in `justification.md`.

3. **Out-of-range values (sensor-specific)**  
   The emulator occasionally sends values **outside the valid range** for a sensor. Treat a reading as out-of-range when **value** is outside the valid min–max for that sensor in the table below. Add a feature in the **API** so that for **each sensor**, when out-of-range values for that sensor occur **more than 3 times in 5 seconds**, the current timestamp and a short error message (including the sensor identifier) are printed to the console.

   **Valid range per sensor** (treat value outside [min, max] as out-of-range):

   | Sensor name           | Valid min | Valid max | Unit |
   |-----------------------|-----------|-----------|------|
   | BATTERY_TEMPERATURE   | 20        | 80        | °C   |
   | MOTOR_TEMPERATURE     | 30        | 120       | °C   |
   | TYRE_PRESSURE_FL      | 150       | 250       | kPa  |
   | TYRE_PRESSURE_FR      | 150       | 250       | kPa  |
   | TYRE_PRESSURE_RL      | 150       | 250       | kPa  |
   | TYRE_PRESSURE_RR      | 150       | 250       | kPa  |
   | PACK_CURRENT          | -300      | 300       | A    |
   | PACK_VOLTAGE          | 350       | 500       | V    |
   | PACK_SOC              | 0         | 100       | %    |
   | VEHICLE_SPEED         | 0         | 250       | km/h |
   | STEERING_ANGLE        | -180      | 180       | deg  |
   | BRAKE_PRESSURE_FRONT  | 0         | 120       | bar  |

---

## Emulator (read-only, black box)

The **only** emulator lives under `emulator/`. It is a **black box**: it does not store or
hold data; it only outputs a stream of readings. Do not modify the emulator code or config.

- **`emulator/src/sensor-config.json`** – defines sensors (busNumber, frameId, signalIndex,
  sensorName, unit, minValue, maxValue, intervalMs). Do not change it.
- **What the emulator exposes** (when the emulator service is running):
  - `GET /sensors` – **static** metadata only: list of `{ sensorId, sensorName, unit }`
    (no min/max). This is config from file, not stored telemetry.
  - `WS /ws/telemetry` – **stream** of readings `{ sensorId, value, timestamp }` as they
    are generated. The emulator does not serve "latest" or keep any state. **Occasionally**
    it sends a reading in an incorrect format (e.g. wrong types or extra fields), and
    occasionally a **value outside the sensor’s valid range** (overspill); the API must
    handle both.

---

## Setup and running the API

The emulator and API are run via **Docker Compose**.

**Prerequisites:** Docker and Docker Compose.

From the repository root:

```bash
cd va-api-assessment
docker compose up --build
```

This starts the **emulator** on port **3001** and the **api** on port **4000**. The API
receives `EMULATOR_URL=http://emulator:3001`. The API skeleton implements `GET /health`
(which checks that the emulator is reachable). You must add routes that consume the
emulator stream, store latest per sensor, and expose metadata and latest telemetry.

To run in the background: `docker compose up --build -d`.

**Local development (optional):** With Node.js **18+** you can run without Docker. You must
run **both** the emulator and the API (the API needs the emulator to get data).

1. **Emulator** (run first, in one terminal):

   ```bash
   cd va-api-assessment/emulator
   npm install
   npm run build
   npm start
   ```

   Emulator listens on `http://localhost:3001`.

2. **API** (in another terminal):

   ```bash
   cd va-api-assessment/api
   npm install
   npm run dev
   ```
   
   By default the API expects the emulator at `http://localhost:3001`. API: `http://localhost:4000`.

---

## What to put in `justification.md`

- Your **API design**: chosen paths, methods, and response shapes for metadata and data
  (and streaming if implemented).
- How you expect clients to use your API (e.g. call metadata once, then poll or stream data).
- How to view or use your OpenAPI spec (e.g. file path, Swagger UI URL).
- Testing and error-handling approach.
- **Task 2 (invalid data):** How you detect and handle invalid readings; what you do with
  them and why.
- **Task 3 (out-of-range per sensor):** How you implement the valid-range table and "&gt;3 out-of-range in 5 s per sensor" console logging.
- Any design trade-offs (e.g. polling vs WebSocket, filtering, or future extensions you
  considered).

---

## Helpful resources

- [Node.js documentation](https://nodejs.org/docs/latest-v18.x/api/)
- [Express.js guide](https://expressjs.com/en/guide/routing.html)
- [TypeScript handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [OpenAPI / Swagger basics](https://swagger.io/docs/specification/about/)
- [WebSockets in Node (`ws`)](https://github.com/websockets/ws)
