import bcrypt from "bcrypt";

export async function hashPasswordService(password) {
  try {
    const hashedPassword = await bcrypt.hash(password, 13);
    return hashedPassword;
  } catch (error) {
    return error;
  }
} 

export async function matchPasswordService(passwords) {
  try {
    const{enteredPassword, storedPassword} = passwords;
    const matchPassword = await bcrypt.compare(enteredPassword,storedPassword);
    return matchPassword;
  } catch (error) {
    throw error;
  }
}
