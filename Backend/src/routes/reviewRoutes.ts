import Router from "express";
import { ReviewController } from "../controllers/ReviewController";
import { authenticate } from "../middleware/Auth";
import { roleHandler } from "../middleware/roleHandler";
import { UserRole } from "../models/UserRole";

const router = Router();
router.use(authenticate);
router.use(roleHandler([UserRole.ADMIN]));

router.get("/:farmSlug/:workerSlug", roleHandler([UserRole.FARMER, UserRole.VETERINARY,UserRole.WORKER,UserRole.LOAN_OFFICER]), ReviewController.getReviewsByWorker);
router.get("/:farmSlug/:slug", roleHandler([UserRole.FARMER, UserRole.VETERINARY,UserRole.WORKER,UserRole.LOAN_OFFICER]), ReviewController.getReviewById);
router.post("/:farmSlug", ReviewController.createReview);
router.put("/:farmSlug/:slug", roleHandler([UserRole.FARMER, UserRole.VETERINARY,UserRole.WORKER,UserRole.LOAN_OFFICER]), ReviewController.updateReview);
router.delete("/:farmSlug/:slug", roleHandler([UserRole.FARMER, UserRole.VETERINARY,UserRole.WORKER,UserRole.LOAN_OFFICER]), ReviewController.deleteReview);

router.get("/:workerId/average-ratings", roleHandler([UserRole.FARMER, UserRole.VETERINARY,UserRole.WORKER,UserRole.LOAN_OFFICER]), ReviewController.getAverageRatings);

export default router;
