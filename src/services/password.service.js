import bcrypt from "bcrypt";



export async function hashPassword(password) {
  try {
    const hashedPassword = await bcrypt.hash(password, 13);
    return hashedPassword;
  } catch (error) {
    return error;
  }
}


export async function checkPasswordMatch(password, encryptedPassword){
  try {
    const matchPassword = await bcrypt.compare(password , encryptedPassword);
    return matchPassword;
  } catch (error) {
    return error;    
  }
}