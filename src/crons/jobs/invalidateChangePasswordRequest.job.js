import { updateChangePasswordRequestsService } from "../../services/changePassword.services.js"

const invalidateChangePasswordRequest = async () =>{
  try {
    let date = new Date()
    date = date.getTime()
    const requests = await updateChangePasswordRequestsService({status: {$in :['pending', 'accept'] }, expiredAt: {$lte: date} }, {status: 'expired'})
    console.log("invalidate forget password requests")
  } catch (error) {
    console.log(error.message)  
  }
}

export default invalidateChangePasswordRequest;