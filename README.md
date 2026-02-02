

WANFAM is a web-based livestock management platform designed to modernize record-keeping and farm operations for small to medium-scale farmers in Kenya. The system replaces manual, error-prone methods with a digital solution that tracks animal health, feeding, vaccinations, and productivity in real time.

---

##  Project Overview

Livestock farmers often rely on paper records and memory-based tracking, which leads to missed vaccinations, poor productivity monitoring, and reduced profitability.  
WANFAM provides a centralized, easy-to-use digital platform that improves animal welfare, farm efficiency, and data-driven decision-making.

---

##  Key Objectives

- Digitize livestock profiles and records  
- Provide real-time health and feeding alerts  
- Enable data-driven decision-making through analytics  
- Improve farm profitability and animal welfare  
- Ensure accessibility for farmers with low digital literacy  

---

##  Technology Stack

| Component        | Technology Used |
|------------------|-----------------|
| Frontend         | React (TypeScript) |
| Backend          | Node.js, Express.js |
| Database         | MongoDB Atlas |
| Authentication  | JWT, Bcrypt |
| Notifications   | In-app alerts |
| Deployment      | Vercel (Frontend), Render (Backend) |

---

##  Core Features

- **Livestock Profile Management**  
  Register, view, and manage detailed animal information.

- **Health & Medical Tracking**  
  Log treatments, vaccinations, and complete medical history.

- **Feeding & Milking Logs**  
  Record daily feed schedules and milk production.

- **Automated Alerts**  
  Notifications for upcoming vaccinations, deworming, and health checks.

- **Analytics Dashboard**  
  Visualize productivity, costs, and profitability trends.

- **Multi-Platform Access**  
  Responsive web application for both mobile and desktop devices.

---

##  Testing & Validation

- **Unit & Integration Testing:** Jest, Supertest  
- **User Acceptance Testing (UAT):** Conducted with 15 farmers in Nyeri County  

### Results
- **System Usability Scale (SUS):** 80 / 100 (Excellent)
- **Task Success Rate:** 90% for core functionalities

---

##  How to Run Locally

### 1️ Clone the Repository
```bash
git clone https://github.com/your-username/wanfam.git
2️ Install Dependencies
cd frontend
npm install

cd ../backend
npm install
3️ Set Up Environment Variables
Create .env files in both the frontend and backend directories with the required configuration values:

MongoDB URI

JWT Secret

Other necessary keys

4️ Run the Development Servers
Backend

cd backend
npm run dev
Frontend

cd frontend
npm start
5️ Access the Application
Frontend: http://localhost:3000

Backend API: http://localhost:5000

 Impact & Future Work
Immediate Impact
Reduced manual record-keeping errors

Improved reminder and alert systems

Better visibility of farm productivity data

Future Enhancements
IoT sensor integration for low-cost health monitoring

AI-based disease prediction models

Blockchain-based livestock traceability

Regional expansion across East Africa

👥 Team & Supervision
Developers

Brandon Isaac Datch

Alvin Kiptoo

Supervisor

Dr. Moso

Institution

Dedan Kimathi University of Technology

Year

2026

 References & Appendices
Full project documentation, survey instruments, interview protocols, consent forms, and architecture diagrams are available in:

Wanfam Documentation V2.docx

 License
This project is developed for academic purposes only.
All rights reserved by the authors.

 Thank You
Empowering farmers through digital innovation.
