# 💊 React.js Pharma Forms — Final Demo

<div align="center">

![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.x-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![Redux Saga](https://img.shields.io/badge/Redux%20Saga-1.x-999999?style=for-the-badge&logo=redux-saga&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-12.x-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-1.x-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

A production-grade **clinical trial management system** built with React 18, TypeScript, Redux Toolkit, Redux Saga, and Framer Motion — featuring multi-step pharmaceutical forms, audit trail, and a regulatory compliance dashboard.

[🔴 Live Demo](#) · [📂 Browse Code](#) · [🐛 Report Bug](../../issues)

</div>

---

## ✨ Features

- 🏥 **Patient Intake** — Multi-step patient registration with eligibility validation
- 💊 **Medication Configuration** — Dynamic drug dosage management
- ⚠️ **Adverse Event Reporting** — Severity scoring and event tracking
- 🔬 **Visit & Lab Tracking** — Scheduled visit and lab result management
- 📋 **Protocol Management** — Clinical trial protocol setup
- 🩺 **Physical Exam** — Structured examination data capture
- 📊 **Regulatory Dashboard** — Audit trail and compliance overview
- 🎞️ **Framer Motion Animations** — Smooth, polished page & form transitions
- 🔒 **Unsaved Changes Guard** — Route-level protection for clinical data integrity
- 🧪 **Clinical Validation Hook** — Reusable `useClinicalValidation` for form validation

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | ^18.2.0 | UI library (Hooks + Composition) |
| TypeScript | ^5.2.2 | Type-safe development |
| Redux Toolkit | ^2.0.1 | State management |
| Redux Saga | ^1.2.3 | Async side effects |
| Framer Motion | ^12.x | Page & form animations |
| React Router DOM | ^6.21.1 | Client-side routing |
| Axios | ^1.6.2 | HTTP client |
| Vite | ^5.0.8 | Build tool |

---

## 📁 Project Structure

```
src/
├── api/
│   └── apiService.ts                  # Axios instance + interceptors
├── features/                          # Redux slices, sagas & types
│   ├── patient/
│   │   ├── patientSlice.ts
│   │   ├── patientSaga.ts
│   │   └── patientTypes.ts
│   ├── medication/
│   │   ├── medicationSlice.ts
│   │   └── medicationTypes.ts
│   ├── adverseEvents/
│   │   ├── adverseEventsSlice.ts
│   │   └── adverseEventsTypes.ts
│   ├── visits/
│   │   ├── visitsSlice.ts
│   │   └── visitsTypes.ts
│   ├── medicalHistory/
│   │   ├── medicalHistorySlice.ts
│   │   └── medicalHistoryTypes.ts
│   ├── physicalExam/
│   │   ├── physicalExamSlice.ts
│   │   └── physicalExamTypes.ts
│   ├── protocol/
│   │   ├── protocolSlice.ts
│   │   ├── protocolSelectors.ts
│   │   └── protocolTypes.ts
│   ├── audit/
│   │   ├── auditSlice.ts
│   │   └── auditTypes.ts
│   ├── store.ts                       # Redux store config
│   └── rootSaga.ts                    # Root saga watcher
├── pages/
│   ├── PatientIntake/
│   ├── Medication/
│   ├── AdverseEvents/
│   ├── LabTracking/
│   ├── PhysicalExam/
│   ├── Protocol/
│   └── Dashboard/
├── components/
│   ├── Layout/                        # PharmaHeader, PharmaSidebar, PharmaLayout
│   └── Shared/                        # ClinicalStepper, ConfirmDialog, ErrorSummary
│                                        # GlassInput, PharmaButton
├── hooks/
│   ├── useAppDispatch.ts
│   ├── useAppSelector.ts
│   └── useClinicalValidation.ts       # Reusable clinical form validation
├── routes/
│   └── index.tsx                      # Route definitions + guards
└── config/
    └── env.ts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js **v18+**
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/Mounika-anki0260/reactjs-pharma-forms-final-demo.git

# Navigate into the project
cd reactjs-pharma-forms-final-demo

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open your browser at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🗺️ Pages & Routes

| Path | Page | Description |
|------|------|-------------|
| `/intake` | PatientIntake | Patient registration & eligibility |
| `/medication` | MedicationConfig | Drug & dosage configuration |
| `/adverse-events` | AdverseEvents | AE severity reporting |
| `/visits` | VisitLabTracking | Visit scheduling & lab results |
| `/physical-exam` | PhysicalExam | Structured exam data capture |
| `/protocol` | ProtocolView | Clinical trial protocol |
| `/dashboard` | RegulatoryDashboard | Compliance & audit trail |

---

## 🏗️ Redux State Architecture

```
Redux Store
├── patient        → patientSaga handles async API calls
├── medication     → dosage & drug management
├── adverseEvents  → AE scoring & tracking
├── visits         → visit scheduling & lab results
├── medicalHistory → patient history records
├── physicalExam   → examination data
├── protocol       → trial protocol config
└── audit          → audit trail & unsaved changes guard
```

---

## 🎞️ Animations

Powered by **Framer Motion** for:
- Smooth page transitions between clinical modules
- Animated form step progressions via `ClinicalStepper`
- Micro-interactions on buttons and inputs

---

## 🔒 Data Integrity Guard

The **audit slice** tracks unsaved form changes and triggers a `ConfirmDialog` when navigating away — protecting clinical trial data integrity.

---

## 📸 Screenshots

> _Add screenshots once deployed_

| Patient Intake | Regulatory Dashboard | Adverse Events |
|----------------|----------------------|----------------|
| ![intake]() | ![dashboard]() | ![ae]() |

---

## 👩‍💻 Author

**Mounika Anki** · [@Mounika-anki0260](https://github.com/Mounika-anki0260)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
