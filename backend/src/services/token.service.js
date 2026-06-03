import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, email: user.email },
    config.jwtAccessSecret,
    { expiresIn: config.jwtAccessExpires }
  );
}

export function signRefreshToken(user, family) {
  const jti = uuidv4();
  const token = jwt.sign(
    { sub: user._id.toString(), family: family || uuidv4(), jti },
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshExpires }
  );
  return { token, family: family || jti, jti };
}

export function verifyAccessToken(token) {
  return jwt.verify(token, config.jwtAccessSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwtRefreshSecret);
}
