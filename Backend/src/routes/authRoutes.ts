import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authenticate } from "../middleware/Auth";
import {auditMiddleware} from "../middleware/auditMiddleware";

const router = Router();

router.post("/register", auditMiddleware('CREATE', 'User'), AuthController.register);
router.post("/login", AuthController.login);
router.get("/profile", authenticate, AuthController.getProfile);
router.put("/profile", authenticate, auditMiddleware('UPDATE', 'User'), AuthController.updateDetails);
router.put("/change-password", authenticate, auditMiddleware('UPDATE', 'User'), AuthController.changePassword);

export default router;