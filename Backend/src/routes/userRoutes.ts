import { Router } from "express";
import userController from "../controllers/UserController";
import { authenticate } from "../middleware/Auth";
import {roleHandler} from "../middleware/roleHandler";
import { UserRole } from "../models/UserRole";
import { auditMiddleware } from "../middleware/auditMiddleware";

const router = Router();

router.get("/", authenticate,roleHandler([UserRole.ADMIN]) ,userController.getUsers);
router.get("/:id", authenticate,roleHandler([UserRole.ADMIN]), userController.getUserById);
router.put("/:id",auditMiddleware('UPDATE', 'User'), authenticate,roleHandler([UserRole.ADMIN]), userController.updateUser);
router.delete("/:id",auditMiddleware('DELETE', 'User'), authenticate, roleHandler([UserRole.ADMIN]),userController.deleteUser);

export default router;