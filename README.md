# CPL Diagnostics — Phase 1 UI/UX prototype

Front-end prototype of three modules from the CPL Apps layout plan: the Patient Mobile App, the Doctor Mobile App and the Admin Mobile App. All three are mobile-first; on a desktop each runs inside a phone frame with a clickable feature list beside it. Mock data only — no backend, OTP, payment gateway, WhatsApp API, GPS or LIS.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```

The start page links to all three modules. Logins are simulated: any 10-digit mobile number and any 6-digit OTP work in the Patient App, and the Doctor and Admin logins are pre-filled.

## Structure

```
src/
  components/
    ui/         Button, Card, Badge, Field, Tabs, Overlay (modal + toast)…
    charts/     TrendChart, BarChart, DonutChart, BarList (plain SVG)
    mobile/     MobileFrame, Screen/TopBar/TabBar, Kit (chips, stat tiles, lists), AuthScreen — used by Doctor and Admin
    reports/    ResultRow (lab result with reference range)
  data/         Mock data: catalog, patient, doctor, admin
  lib/          Formatting, order status labels, sample lifecycle, chart helpers
  modules/
    launcher/   Start page
    patient/    PatientApp, PatientContext, components/, screens/ (+ screens/booking/), i18n/ (en and hi dictionaries)
    doctor/     DoctorApp, DoctorContext, components/, screens/
    admin/      AdminApp, AdminContext, components/, screens/
  types/        Shared TypeScript types
```

Stack: React, Vite, TypeScript, Tailwind CSS v4, Lucide icons, React Router (hash routing, so `dist/` works on any static host).
