import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/** 对密码进行哈希 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/** 校验密码 */
export async function verifyPassword(
  password: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}
