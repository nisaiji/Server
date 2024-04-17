import bcrypt from "bcrypt";



export async function hashPassword(password) {
  try {
    console.log({password});
    const hashedPassword = await bcrypt.hash(password, 13);
    console.log({hashedPassword});
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