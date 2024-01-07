import mongoose, { Schema, Document } from 'mongoose';

type UserRole = 'user' | 'admin';
interface User extends Document {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  appliedJobs: mongoose.Types.ObjectId[];
  role: UserRole;
}

const userSchema = new Schema<User>({
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true },
  appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
});

const UserModel = mongoose.model<User>('User', userSchema);

export { User, UserModel, UserRole };
