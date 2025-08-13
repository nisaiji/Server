import { getAdminsService } from "../../services/admin.services.js"
import { convertToMongoId } from "../../services/mongoose.services.js";
import { registerSessionService, updateSessionService } from "../../services/session.services.js";

const SessionCreateJob =  async() => {
  try {
  console.log("session create job")
  const schools = await getAdminsService({});
  const currentYear = new Date().getFullYear();

  const march31 = new Date(currentYear+1, 2, 31, 0, 0, 0);
  const april1 = new Date(currentYear, 3, 1, 0, 0, 0);
  
  for (const school of schools) {
    await updateSessionService({ school: convertToMongoId(school['_id']) }, { isCurrent: false, status: 'completed' });
    await registerSessionService({
      school: school['_id'], 
      isCurrent: true, 
      status: "active", 
      acedmicStartYear: march31,
      acedmicEndYear: april1
     });
     console.log(`Session created for school: ${school['schoolName']}`);
  }

} catch (error) {
  console.log(error.message)  
}
}

export default SessionCreateJob;