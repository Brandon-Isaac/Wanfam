import { Router } from 'express';
import { ChatController } from '../controllers/ChatController';
import { authenticate } from '../middleware/Auth';

const router = Router();

// All chat routes require authentication
router.use(authenticate);

// Chat with AI assistant
router.post('/chat', ChatController.chat);

// Get chat suggestions
router.get('/suggestions', ChatController.getSuggestions);

export default router;
