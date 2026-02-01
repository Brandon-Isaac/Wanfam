import cron from 'node-cron';
import { VaccinationSchedule } from '../models/VaccinationSchedule';
import { Task } from '../models/Task';
import { Animal } from '../models/Animal';
import { Farm } from '../models/Farm';
import { notifyVaccinationDue, notifyCheckupReminder, notifyUpcomingTask } from './notificationService';


export const checkUpcomingVaccinations = cron.schedule('0 8 * * *', async () => {
    try {
        console.log('Running vaccination reminder check...');
        
        // Find vaccinations due in the next 3 days
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        
        const upcomingVaccinations = await VaccinationSchedule.find({
            scheduledDate: {
                $gte: new Date(),
                $lte: threeDaysFromNow
            },
            status: 'scheduled'
        }).populate('animalId');
        
        for (const vaccination of upcomingVaccinations) {
            if (vaccination.animalId) {
                const animal = vaccination.animalId as any;
                const farm = await Farm.findById(animal.farmId).populate('owner');
                
                if (farm && farm.owner) {
                    await notifyVaccinationDue(
                        farm.owner as any,
                        animal.tagId || animal.name || 'Unknown',
                        vaccination.vaccineName,
                        vaccination.scheduledDate,
                        vaccination._id.toString()
                    );
                }
            }
        }
        
        console.log(`Sent ${upcomingVaccinations.length} vaccination reminders`);
    } catch (error) {
        console.error('Error checking vaccinations:', error);
    }
});

//Check for upcoming checkups (run daily at 8:00 AM)
// NOTE: Disabled - Animal model needs nextCheckupDate property
export const checkUpcomingCheckups = cron.schedule('0 8 * * *', async () => {
    try {
        console.log('Checkup reminders disabled - nextCheckupDate field not in Animal model');
        
        // TODO: Add nextCheckupDate field to Animal model before enabling this
        // const sevenDaysFromNow = new Date();
        // sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        
        // const animalsNeedingCheckup = await Animal.find({
        //     nextCheckupDate: {
        //         $gte: new Date(),
        //         $lte: sevenDaysFromNow
        //     }
        // });
        
        // for (const animal of animalsNeedingCheckup) {
        //     const farm = await Farm.findById(animal.farmId).populate('owner');
        //     
        //     if (farm && farm.owner && animal.nextCheckupDate) {
        //         await notifyCheckupReminder(
        //             farm.owner as any,
        //             animal.tagId || animal.name || 'Unknown',
        //             animal.nextCheckupDate,
        //             animal._id.toString()
        //         );
        //     }
        // }
        
        // console.log(`Sent ${animalsNeedingCheckup.length} checkup reminders`);
    } catch (error) {
        console.error('Error checking upcoming checkups:', error);
    }
});

//Check for upcoming tasks (run daily at 7:00 AM)
export const checkUpcomingTasks = cron.schedule('0 7 * * *', async () => {
    try {
        console.log('Running task reminder check...');
        
        // Find tasks due today or tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 59, 999);
        
        const upcomingTasks = await Task.find({
            dueDate: {
                $gte: new Date(),
                $lte: tomorrow
            },
            status: { $ne: 'Completed' }
        }).populate('assignedTo');
        
        for (const task of upcomingTasks) {
            if (task.assignedTo && task.dueDate) {
                const assignedWorkers = Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo];
                
                for (const worker of assignedWorkers) {
                    await notifyUpcomingTask(
                        (worker as any)._id,
                        task.title,
                        task.dueDate,
                        task._id.toString()
                    );
                }
            }
        }
        
        console.log(`Sent ${upcomingTasks.length} task reminders`);
    } catch (error) {
        console.error('Error checking upcoming tasks:', error);
    }
});

//Check for overdue tasks (run daily at 9:00 AM)
export const checkOverdueTasks = cron.schedule('0 9 * * *', async () => {
    try {
        console.log('Running overdue task check...');
        
        const now = new Date();
        
        const overdueTasks = await Task.find({
            dueDate: { $lt: now },
            status: { $ne: 'Completed' }
        }).populate('assignedTo createdBy');
        
        for (const task of overdueTasks) {
            // Notify assigned workers
            if (task.assignedTo) {
                const assignedWorkers = Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo];
                
                for (const worker of assignedWorkers) {
                    const { createNotification } = await import('./notificationService');
                    await createNotification({
                        userId: (worker as any)._id,
                        message: `Task "${task.title}" is overdue! Please complete it as soon as possible.`,
                        type: 'alert',
                        relatedEntityId: task._id.toString(),
                        relatedEntityType: 'task'
                    });
                }
            }
            
            // Notify task creator
            if (task.createdBy) {
                const { createNotification } = await import('./notificationService');
                await createNotification({
                    userId: (task.createdBy as any)._id,
                    message: `Task "${task.title}" is overdue and not yet completed.`,
                    type: 'warning',
                    relatedEntityId: task._id.toString(),
                    relatedEntityType: 'task'
                });
            }
        }
        
        console.log(`Processed ${overdueTasks.length} overdue tasks`);
    } catch (error) {
        console.error('Error checking overdue tasks:', error);
    }
});

//Start all scheduled jobs
export const startScheduledJobs = () => {
    checkUpcomingVaccinations.start();
    // checkUpcomingCheckups.start(); // Disabled - Animal model needs nextCheckupDate property
    checkUpcomingTasks.start();
    checkOverdueTasks.start();
    
    console.log('✅ Scheduled notification jobs started (checkup reminders disabled)');
};

//Stop all scheduled jobs
export const stopScheduledJobs = () => {
    checkUpcomingVaccinations.stop();
    // checkUpcomingCheckups.stop(); // Disabled - Animal model needs nextCheckupDate property
    checkUpcomingTasks.stop();
    checkOverdueTasks.stop();
    
    console.log('⏹️  All scheduled notification jobs stopped');
};

export default {
    checkUpcomingVaccinations,
    checkUpcomingCheckups,
    checkUpcomingTasks,
    checkOverdueTasks,
    startScheduledJobs,
    stopScheduledJobs
};
