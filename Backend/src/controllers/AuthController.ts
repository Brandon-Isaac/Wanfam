import {User} from "../models/User";
import { UserRole } from "../models/UserRole";
import {authenticate} from "../middleware/Auth";
import {asyncHandler} from "../middleware/AsyncHandler";
import {Request, Response} from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const register= asyncHandler(async(req:Request, res:Response)=>{
    const {
        firstName,
        lastName,
        email,
        phone,
        password,
        role,
        licenseNumber,
        specialization,
        employeeId,
        department,
        bankName,
        branch,
    } = req.body;
    
    if(!firstName || !lastName || !email || !password || !role) {
        return res.status(400).json({ message: 'First name, last name, email, password, and role are required' });
    } 

    if (role === UserRole.VETERINARY && !licenseNumber) {
        return res.status(400).json({ message: 'License number is required for veterinary officers' });
    }
    
    if ((role === UserRole.WORKER || role === UserRole.LOAN_OFFICER) && !employeeId) {
        return res.status(400).json({ message: 'Employee ID is required for workers and loan officers' });
    }
    
    if (role === UserRole.LOAN_OFFICER && (!bankName || !branch)) {
        return res.status(400).json({ message: 'Bank name and branch are required for loan officers' });
    }
    
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const userData: any = {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        role
    };
    if (role === UserRole.VETERINARY) {
        userData.licenseNumber = licenseNumber;
        if (specialization) userData.specialization = specialization;
    }
    if (role === UserRole.WORKER || role === UserRole.LOAN_OFFICER) {
        userData.employeeId = employeeId;
        if (department) userData.department = department;
    }
    if (role === UserRole.LOAN_OFFICER) {
        userData.bankName = bankName;
        userData.branch = branch;
    }    
    const user = new User(userData);
    await user.save();
    
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    const { password: _, ...userResponse } = user.toObject();
    
    res.status(201).json({ 
        token,
        user: userResponse,
        message: 'User registered successfully'
    });
});

const login = asyncHandler(async(req:Request, res:Response)=>{
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    res.status(200).json({ token, message: 'Login successful' });
});

const getProfile = asyncHandler(async(req:Request, res:Response)=>{
    const userId = req.user?.id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
});

const updateDetails = asyncHandler(async(req:Request, res:Response)=>{
    const userId = req.user?.id;
    const { firstName, lastName,email, phone, preferredLanguage, role} = req.body;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phone = phone || user.phone;
    user.preferredLanguage = preferredLanguage || user.preferredLanguage;
    user.email = email || user.email;
    user.role = role || user.role;

    await user.save();

    res.status(200).json({ user });
});

const changePassword = asyncHandler(async(req:Request, res:Response)=>{
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
});

export const AuthController={
    register,
    login,
    getProfile,
    updateDetails,
    changePassword
};