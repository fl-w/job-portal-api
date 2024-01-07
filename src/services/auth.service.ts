import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { AuthToken } from '../middleware';
import { config } from '../config';
export const hashPassword = async (password: string): Promise<string> =>
  await bcrypt.hash(password, config.saltRounds);

export const comparePasswords = async (
  pass: string,
  encryptedPass: string
): Promise<boolean> => bcrypt.compare(pass, encryptedPass);

export const generateToken = (user: User): string => {
  const payload: AuthToken = {
    sub: user._id,
    profile_name: `${user.firstName} ${user.lastName}`,
    role: user.role,
  };

  return jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
};
