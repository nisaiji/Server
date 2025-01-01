import { updateChangePasswordRequestsService } from "../../services/changePassword.services.js"

const changePasswordRequestExpireJob = async () =>{
  try {
    let date = new Date()
    date = date.getTime()
    console.log("change password request expire: ",date)
    await updateChangePasswordRequestsService({status: {$in :['pending', 'accept'] }, expiredAt: {$lte: date} }, {status: 'expired'})
  } catch (error) {
    console.log(error.message)  
  }
}

export default changePasswordRequestExpireJob;