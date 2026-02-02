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
    const { username, role, isActive } = req.body;

    // Build update object with only provided fields
    const updateData: any = {};
    if (username !== undefined) updateData.username = username;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
    }

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select('-password');
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