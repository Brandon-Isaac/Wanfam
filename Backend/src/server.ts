import Express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

// Load environment variables FIRST before any other imports
dotenv.config();

import authRoutes from "./routes/authRoutes";
import livestockRoutes from "./routes/livestockRoutes";
import feedConsumptionRoutes from "./routes/FeedConsumptionRoutes";
import feedScheduleRoutes from "./routes/FeedScheduleRoutes";
import healthRoutes from "./routes/healthRoutes";
import userRoutes from "./routes/userRoutes";
import farmRoutes from "./routes/farmRoutes";
import workerRoutes from "./routes/workerRoutes";
import taskRoutes from "./routes/taskRoutes";
import livestockProductRoutes from "./routes/livestockProductRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import timeOffRequestRoutes from "./routes/timeOffRequestRoutes";
import auditLogRoutes from "./routes/auditLogRoutes";
import capitalRoutes from "./routes/capitalRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import inventoryRoutes from "./routes/inventoryRoutes";
import reportRoutes from "./routes/reportRoutes";
import wageRoutes from "./routes/wageRoutes";
import vetRoutes from "./routes/VetRoutes";
import treatmentRoutes from "./routes/treatmentRoutes";
import chatRoutes from "./routes/chatRoutes";

const app = Express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yourdbname';

mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
}).then(() => {
    console.log("MongoDB connected");
}).catch((err) => {
    console.error("MongoDB connection error:", err);
});

app.use(Express.json());
app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/livestock", livestockRoutes);
app.use("/api/v1/feed-consumption", feedConsumptionRoutes);
app.use("/api/v1/feed-schedule", feedScheduleRoutes);
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/farms", farmRoutes);
app.use("/api/v1/workers", workerRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/products", livestockProductRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/time-off-requests", timeOffRequestRoutes);
app.use("/api/v1/audit-logs", auditLogRoutes);
app.use("/api/v1/capital", capitalRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/wages", wageRoutes);
app.use("/api/v1/vets", vetRoutes);
app.use("/api/v1/treatments", treatmentRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use('/api/v1/breeds', require('./routes/breedRoutes').default);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
export default app;