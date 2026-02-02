Wanfam Comprehensive Livestock Care System
Final Year Project Presentation

 Project Overview
Wanfam is a web-based livestock management platform designed to modernize record-keeping and farm operations for small to medium-scale farmers in Kenya. It replaces manual, error-prone methods with a digital system that tracks animal health, feeding, vaccinations, and productivity in real time.

 Key Objectives
Digitize livestock profiles and records

Provide real-time health and feeding alerts

Enable data-driven decision-making through analytics

Improve farm profitability and animal welfare

Ensure accessibility for farmers with low digital literacy

🛠️ Technology Stack
Component	Technology Used
Frontend	React (with TypeScript)
Backend	Node.js, Express.js
Database	MongoDB Atlas
Authentication	JWT, Bcrypt
Notifications	In-app alerts
Deployment	Vercel (Frontend), Render (Backend)
 Core Features
✅ Livestock Profile Management – Register, view, and manage animal details

✅ Health & Medical Tracking – Log treatments, vaccinations, and health history

✅ Feeding & Milking Logs – Record daily yields and feed schedules

✅ Automated Alerts – Notifications for upcoming vaccinations, deworming, etc.

✅ Analytics Dashboard – Visualize productivity, costs, and profitability

✅ Multi-Platform Access – Responsive web app for mobile and desktop

🧪 Testing & Validation
Unit & Integration Testing – Jest, Supertest

User Acceptance Testing (UAT) – Conducted with 15 farmers in Nyeri County

Usability Score (SUS) – 80/100 (Excellent)

Task Success Rate – 90% for core functionalities

 Project Structure
text
Wanfam/
├── frontend/          # React app (Vercel)
├── backend/           # Node/Express API (Render)
├── database/          # MongoDB models & schemas
├── docs/              # Project documentation
└── tests/             # Unit & integration tests
 How to Run Locally
Clone the repository

bash
git clone https://github.com/your-username/wanfam.git
Install dependencies

bash
cd frontend && npm install
cd ../backend && npm install
Set up environment variables

Create .env files in both frontend and backend with required keys (MongoDB URI, JWT secret, etc.)

Run the development servers

bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm start
Access the app

Frontend: http://localhost:3000

Backend API: http://localhost:5000

 Impact & Future Work
Immediate Impact: Reduced manual errors, improved reminder systems, better data visibility

Future Enhancements:

IoT sensor integration (low-cost health monitors)

AI-based disease prediction

Blockchain for livestock traceability

Regional adaptation across East Africa

 Team & Supervision
Developers: Brandon Isaac Datch, Alvin Kiptoo

Supervisor: Dr. Moso

Institution: Dedan Kimathi University of Technology

Year: 2026

🔗 References & Appendices
Full project documentation, survey instruments, interview protocols, consent forms, and architecture diagrams are available in the project report (Wanfam Documentation V2.docx).

 License
This project is developed for academic purposes. All rights reserved by the authors.

Thank you for your attention!
Empowering farmers through digital innovation.
