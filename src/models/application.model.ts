import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export type ApplicationState = 'pending' | 'approved' | 'rejected';

interface JobApplication extends Document {
  jobId: ObjectId;
  userId: ObjectId;
  firstName: string;
  lastName: string;
  coverLetter?: string;
  state: ApplicationState;
}

const applicationSchema = new Schema<JobApplication>(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    coverLetter: { type: String },
    state: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    virtuals: false,
    versionKey: false,
    timestamps: { createdAt: 'created', updatedAt: 'updated_at' },
  }
);

const JobApplicationModel = mongoose.model<JobApplication>(
  'Application',
  applicationSchema
);

export { JobApplication, JobApplicationModel };
