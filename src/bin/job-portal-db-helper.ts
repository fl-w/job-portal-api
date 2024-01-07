import mongoose from 'mongoose';
import { config } from '../config';
import { UserModel, UserRole } from '../models';

mongoose.connect(config.MONGO_URI);

async function findUser(email: string) {
  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new Error(`User not found: ${email}`);
  }

  return user;
}

async function getUserDetails(email: string): Promise<void> {
  const user = await findUser(email);
  console.log(`${user}`);
}

async function changeUserRole(email: string, newRole: UserRole): Promise<void> {
  const user = await findUser(email);

  user.role = newRole;
  await user.save();

  console.log(`User role updated successfully. New role: ${newRole}`);
}

async function clearDatabase(): Promise<void> {
  await UserModel.deleteMany({});
  console.log('Database cleared successfully.');
}

// Example usage:
// node job-portal-db-helper.js setrole user@example.com admin
// node job-portal-db-helper.js getuser user@example.com
// node job-portal-db-helper.js cleardb

const [command, ...args] = process.argv.slice(2);

try {
  switch (command) {
    case 'getuser':
      getUserDetails(args.at(0));
      break;
    case 'setrole':
      const [email, newRole] = args;
      changeUserRole(email, newRole as UserRole);
      break;
    case 'cleardb':
      clearDatabase();
      break;
    default:
      console.error('Invalid command. Available commands: getuser, setrole, cleardb');
      break;
  }
} catch (error) {
  console.error('Error occured whilst for ', command, error);
} finally {
  mongoose.disconnect();
}
