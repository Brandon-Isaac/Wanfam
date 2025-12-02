import { Request, Response } from "express";
import { User } from "../models/User";
import { WorkerReview } from "../models/WorkerReview";
import { Farm } from "../models/Farm";
import { TimeOffRequest } from "../models/TimeOffRequest";


// Create a review for a worker
 const createReview = async (req: Request, res: Response) => {
    const farm = req.params.farmId;
    if (!farm) {
        return res.status(400).json({ message: "Farm ID is required" });
    }
    try {
        const { workerId, PunctualityRating, TaskCompletionRating, TeamworkRating, CommunicationRating, ProblemSolvingRating, comment, strengths, areasForImprovement, goals } = req.body;
        const userId = req.user?.id; // Assuming user ID is available in req.user

        // Validate input
        if (!workerId || !PunctualityRating || !TaskCompletionRating || !TeamworkRating || !CommunicationRating || !ProblemSolvingRating || !comment) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const overallRating = (PunctualityRating + TaskCompletionRating + TeamworkRating + CommunicationRating + ProblemSolvingRating) / 5;
        if (overallRating < 1 || overallRating > 5) {
            return res.status(400).json({ message: "Ratings must be between 1 and 5" });
        }

        // Create a new review
        const review = new WorkerReview({
            worker: workerId,
            reviewerId: userId,
            PerformanceMetrics: {
                punctuality: PunctualityRating,
                taskCompletion: TaskCompletionRating,
                teamwork: TeamworkRating,
                communication: CommunicationRating,
                problemSolving: ProblemSolvingRating
            },
            reviewPeriod: new Date().toISOString().slice(0, 7),
            reviewDate: new Date(),
            overallRating: overallRating,
            strengths: strengths,
            areasForImprovement: areasForImprovement,
            goals: goals,
            comments: comment
        });

        await review.save();

        return res.status(201).json({ message: "Review created successfully", review });
    } catch (error) {
        console.error("Error creating review:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Get all reviews for a specific worker
 const getReviewsByWorker = async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    if (!farmId) {
        return res.status(400).json({ message: "Farm ID is required" });
    }
    try {
        const { workerId } = req.params;
        const reviews = await WorkerReview.find({ worker: workerId, farm: farmId });
        return res.status(200).json({ reviews });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return res.status(500).json({ message: "Internal server error" });  
    }
};

// Get a specific review by ID
 const getReviewById = async (req: Request, res: Response) => {
    try {
        const reviewId = req.params.id;
        const review = await WorkerReview.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        return res.status(200).json({ review });
    } catch (error) {
        console.error("Error fetching review:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//update a review
 const updateReview = async (req: Request, res: Response) => {
    try {
        const { reviewId } = req.params;
        const { PunctualityRating, TaskCompletionRating, TeamworkRating, CommunicationRating, ProblemSolvingRating, comment, strengths, areasForImprovement, goals } = req.body;

        // Validate input
        if (!PunctualityRating || !TaskCompletionRating || !TeamworkRating || !CommunicationRating || !ProblemSolvingRating || !comment) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const overallRating = (PunctualityRating + TaskCompletionRating + TeamworkRating + CommunicationRating + ProblemSolvingRating) / 5;
        if (overallRating < 1 || overallRating > 5) {
            return res.status(400).json({ message: "Ratings must be between 1 and 5" });
        }

        // Update the review
        const updatedReview = await WorkerReview.findByIdAndUpdate(reviewId, {
            PerformanceMetrics: {
                punctuality: PunctualityRating,
                taskCompletion: TaskCompletionRating,
                teamwork: TeamworkRating,
                communication: CommunicationRating,
                problemSolving: ProblemSolvingRating
            },
            overallRating: overallRating,
            strengths: strengths,
            areasForImprovement: areasForImprovement,
            goals: goals,
            comments: comment
        }, { new: true });

        if (!updatedReview) {
            return res.status(404).json({ message: "Review not found" });
        }

        return res.status(200).json({ message: "Review updated successfully", review: updatedReview });
    } catch (error) {
        console.error("Error updating review:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Delete a review
 const deleteReview = async (req: Request, res: Response) => {
    if (!req.params.farmId) {
        return res.status(400).json({ message: "Farm ID is required" });
    }
    try {
        const { reviewId } = req.params;
        const deletedReview = await WorkerReview.findByIdAndDelete(reviewId);
        if (!deletedReview) {
            return res.status(404).json({ message: "Review not found" });
        }
        return res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error("Error deleting review:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getAverageRatings = async (req: Request, res: Response) => {
    try {
        const { workerId } = req.params;
        const reviews = await WorkerReview.find({ worker: workerId });
        if (reviews.length === 0) {
            return res.status(200).json({ averageRatings: null });
        }   
        const totalRatings = reviews.reduce((acc, review) => {
            acc.punctuality += review.PerformanceMetrics?.punctuality || 0;
            acc.taskCompletion += review.PerformanceMetrics?.taskCompletion || 0;
            acc.teamwork += review.PerformanceMetrics?.teamwork || 0;
            acc.communication += review.PerformanceMetrics?.communication || 0;
            acc.problemSolving += review.PerformanceMetrics?.problemSolving || 0;
            return acc;
        }, { punctuality: 0, taskCompletion: 0, teamwork: 0, communication: 0, problemSolving: 0 });

        const averageRatings = {
            punctuality: totalRatings.punctuality / reviews.length,
            taskCompletion: totalRatings.taskCompletion / reviews.length,
            teamwork: totalRatings.teamwork / reviews.length,
            communication: totalRatings.communication / reviews.length,
            problemSolving: totalRatings.problemSolving / reviews.length
        };

        return res.status(200).json({ averageRatings });
    } catch (error) {
        console.error("Error fetching average ratings:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const  createTimeOffRequests = async (req: Request, res: Response) => {
    const  workerId  = req.user?.id;
    try {
        // Verify that the worker exists
        const worker = await User.findOne({ _id: workerId, role: 'worker' });
        if (!worker) {
            return res.status(404).json({ message: "Worker not found" });
        }
        // Create a new time-off request
        const timeOffRequest = new TimeOffRequest({
            workerId: worker._id,
            type: req.body.type,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            reason: req.body.reason,
            status: 'pending',
            requestDate: new Date()
        });
        await timeOffRequest.save();
        return res.status(201).json({ message: "Time-off request created successfully", timeOffRequest });
    } catch (error) {
        console.error("Error creating time-off request:", error);
        return res.status(500).json({ message: "Internal server error" });
    }   
};

const getTimeOffRequests = async (req: Request, res: Response) => {
    const { workerId } = req.body;
    try {
        // Verify that the worker exists
        const worker = await User.findById(workerId);
        if (!worker) {
            return res.status(404).json({ message: "Worker not found" });
        }   
        // Fetch all time-off requests for the worker
        const requests = await TimeOffRequest.find({ workerId: workerId });
        return res.status(200).json({ requests });
    } catch (error) {
        console.error("Error fetching time-off requests:", error);
        return res.status(500).json({ message: "Internal server error" });
    }  
};

const approveTimeOffRequest = async (req: Request, res: Response) => {
    const  requestId  = req.params.id;
    try {
        const request = await TimeOffRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "Time-off request not found" });
        }   
        request.status = 'approved';
        request.responseDate = new Date();
        await request.save();
        return res.status(200).json({ message: "Time-off request approved", request });
    } catch (error) {
        console.error("Error approving time-off request:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const denyTimeOffRequest = async (req: Request, res: Response) => {
    const { requestId } = req.params;
    try {
        const request = await TimeOffRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "Time-off request not found" });
        }
        request.status = 'denied';
        request.responseDate = new Date();
        await request.save();
        return res.status(200).json({ message: "Time-off request denied", request });
    }
    catch (error) {
        console.error("Error denying time-off request:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const ReviewController = {
    createReview,
    getReviewsByWorker,
    getReviewById,
    updateReview,
    deleteReview,
    getAverageRatings,
    createTimeOffRequests,
    getTimeOffRequests,
    approveTimeOffRequest,
    denyTimeOffRequest
};
      