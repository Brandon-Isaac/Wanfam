import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/UserRole';

export function roleHandler(allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user as { role?: UserRole } | undefined;
            // Add these debug logs
        // console.log('User object:', user);
        // console.log('User role:', user?.role);
        // console.log('Allowed roles:', allowedRoles);
        // console.log('Role match:', allowedRoles.includes(user?.role as UserRole));

        if (!user || !user.role) {
            return res.status(401).json({ message: 'Unauthorized: No user role found' });
        }

        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({ message: 'Forbidden: Insufficient role' });
        }
        next();
    };
}