## Vehicle Analytics Frontend Assessment

Your task is to design and implement a **frontend telemetry dashboard** that consumes the API you build in the VA API assessment.

The focus is on:

- Clear visualisation of multiple sensors.
- Good UX and information hierarchy.
- Consuming **both**:
  - The **metadata** route(s) you design in the API assessment.
  - The **data** route(s) / WebSocket stream you design in the API assessment.
- A **low-fidelity Figma mockup** with short justifications.

---

## Scenario

In the API assessment ([`va-api-assessment`](https://github.com/UNSW-Redback-Racing/va-api-assessment))
you design the backend API surface on top of the emulator. At a minimum, your API must expose:

- One or more **metadata** endpoints that allow the frontend to resolve `sensorId` to a
  human–readable `sensorName` and `unit`.
- One or more **data** endpoints or streams that provide current readings
  (`sensorId`, `value`, `timestamp`).
- A `GET /health` endpoint that reports API/emulator connectivity.

This frontend assessment expects you to **consume the API you designed**:

- Use your metadata endpoint(s) to build a mapping from `sensorId` to `sensorName` and `unit`.
- Use your data endpoint(s) and/or WebSocket stream to show current values.
- The scaffold already uses `GET /health` to drive a basic connection status indicator in the UI; you may extend or redesign this as part of your dashboard if you feel the need to.
- Present this information in a way that would be useful to race engineers.

---

## Starting point

This repo provides a minimal **Next.js + TailwindCSS** app with:

- `src/app/page.tsx`:
  - Currently only calls `GET /health` to show API connectivity and renders placeholder sections.
  - You must wire it to your metadata and data endpoints to display real telemetry (and any stream you choose to expose).
- `src/lib/api-client.ts`:
  - Helper for calling the REST API (health is implemented; you add metadata/data fetchers).

You are expected to **adapt and extend** this:

- Update the client to call the metadata and data routes you designed in the API assessment.
- If you expose a WebSocket stream, you may use it for live updates instead of (or in addition to) repeated HTTP requests, to reduce latency and load.

- Improve the layout and visual hierarchy.
- Add additional views/sections and features with the provided data (e.g. cards, charts, filters (safe-value ranges), light/dark modes).
- **Use shadcn/ui components for your core layout and UI elements** (cards, buttons, badges, etc.).
- You may also use **additional libraries** (e.g. charting, toast) where shadcn-styled components are not available or less applicable, as long as the overall design remains consistent.
- *Note: there are many additional shadcn/ui-styled libraries in addition to the standard shadcn/ui components. You should do some research to find components you prefer.*

---

## Requirements

1. **API consumption**
   - Use the metadata endpoint to resolve `sensorId` to human-readable `sensorName` and `unit`.
   - Use the data endpoint(s) to display current values and, optionally, basic history.

2. **Low-fidelity Figma mockup**
   - Create a **minimal low-fidelity Figma mockup** of the key dashboard screen(s) and features you choose to implement.
   - Document the Figma link and brief UX justifications in `justification.md`.

3. **Dashboard behaviour**
   - Show multiple sensors at once.
   - Make it clear which sensors are most important / critical.
   - Apply sensible formatting (e.g. decimal places, units).
   - You may choose how to represent “status” (e.g. colours, badges).

4. **Code quality**
   - Use idiomatic React/Next.js (App Router).
   - Keep components small and focused.
   - Add basic tests if you wish (not required in this skeleton).

---

## Running the frontend locally

Prerequisites:

- Node.js **18+**
- The api-assessment backend API running locally (default `http://localhost:4000`).

Steps:

```bash
cd va-frontend-assessment
npm install
npm run dev
```

Then visit `http://localhost:3000` in your browser.

---

## What to put in `justification.md`

Use `justification.md` to briefly document:

- A link to your Figma mockup and what it covers.
- Why you chose your particular layout and components.
- How you expect engineers to use this dashboard (what questions it helps answer).
- Any trade-offs or limitations you are aware of.

---

## Helpful resources

- [Next.js documentation](https://nextjs.org/docs)
- [Tailwind CSS documentation](https://tailwindcss.com/docs)
- [shadcn/ui documentation](https://ui.shadcn.com/docs)
- [shadcn Studio](https://shadcnstudio.com/)
- [React documentation](https://react.dev/learn)
- [tweakcn documentation](https://tweakcn.com/)