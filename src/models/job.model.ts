import mongoose, { Schema, Document } from 'mongoose';
import { JobApplicationModel } from '.';

interface SalaryRange {
  currency: string;
  min: number;
  max: number;
}

const salaryRangeSchema = new Schema<SalaryRange>(
  {
    currency: { type: String, required: true, maxlength: 3 },
    min: { type: Number, required: true },
    max: { type: Number, required: true },
  },
  { _id: false }
);

interface Job extends Document {
  title: string;
  description: string;
  image?: string;
  active: boolean;
  location: string;
  company: string;
  salary?: SalaryRange;
  created: Date;
  updated_at: Date;
}

const jobSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    active: { type: Boolean, required: true, default: true },
    location: { type: String },
    company: { type: String, required: true },
    salary: salaryRangeSchema,
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'created', updatedAt: 'updated_at' },
  }
);

jobSchema.pre('findOneAndDelete', async function (next) {
  const jobId = this.getQuery()['_id'];
  try {
    await JobApplicationModel.deleteMany({ jobId });
    next();
  } catch (error) {
    next(error);
  }
});

jobSchema.set('toObject', {
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const JobModel = mongoose.model<Job>('Job', jobSchema);

export { SalaryRange, Job, JobModel };
