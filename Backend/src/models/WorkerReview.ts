import {Schema, model, Document} from 'mongoose';

export interface IWorkerReview extends Document {
    farmId: Schema.Types.ObjectId;
    workerId: Schema.Types.ObjectId;
    slug?: string;
    reviewerId: Schema.Types.ObjectId;
    reviewPeriod?: string;
    PerformanceMetrics?: {
        punctuality?: number;
        taskCompletion?: number;
        teamwork?: number;
        communication?: number;
        problemSolving?: number;
    };
    overallRating?: number;
    strengths?: string;
    areasForImprovement?: string;
    goals?: string;
    comments: string;
    reviewDate: Date;
}

const workerReviewSchema = new Schema<IWorkerReview>({
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    workerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reviewPeriod: { type: String },
    PerformanceMetrics: {
        punctuality: { type: Number, min: 1, max: 5 },
        taskCompletion: { type: Number, min: 1, max: 5 },
        teamwork: { type: Number, min: 1, max: 5 },
        communication: { type: Number, min: 1, max: 5 },
        problemSolving: { type: Number, min: 1, max: 5 }
    },
    overallRating: { type: Number, min: 1, max: 5, required: true },
    strengths: { type: String },
    areasForImprovement: { type: String },
    goals: { type: String },
    comments: { type: String, required: true },
    reviewDate: { type: Date, default: Date.now }
});

workerReviewSchema.pre<IWorkerReview>('save', async function(next) {
    if (this.isNew) {
        this.slug = `review-${this.workerId}-${Date.now()}`;
    }
    next();
});

// Indexes
workerReviewSchema.index({ workerId: 1, reviewDate: -1 });
workerReviewSchema.index({ reviewerId: 1 });
export const WorkerReview = model<IWorkerReview>('WorkerReview', workerReviewSchema);
