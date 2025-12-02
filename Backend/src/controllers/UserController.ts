import { Request, Response } from 'express';
import {User} from '../models/User'; 
import {asyncHandler} from '../middleware/AsyncHandler';

const getUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await User.find({}, '-password'); // Exclude password field
    return res.json(users);
});

const getUserById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;
    const user = await User.findById(userId, '-password'); // Exclude password field
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user);
});

const updateUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;
    const { username, role } = req.body;

    if (!username || !role) {
        return res.status(400).json({ message: 'Username and role are required' });
    }

    const user = await User.findByIdAndUpdate(userId, { username, role }, { new: true, runValidators: true });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
});

const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ message: 'User deleted successfully' });
});

const userController = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser
};

export default userController;