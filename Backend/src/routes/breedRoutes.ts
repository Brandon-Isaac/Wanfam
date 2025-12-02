import BreedControllers from "../controllers/BreedControllers";
import { Router } from "express";
import { authenticate } from "../middleware/Auth";
import { roleHandler } from "../middleware/roleHandler";
import { UserRole } from "../models/UserRole";
const router = Router();

router.get("/:species", authenticate, roleHandler([UserRole.FARMER, UserRole.ADMIN, UserRole.VETERINARY]), BreedControllers.getBreedsForSpecies);

export default router;