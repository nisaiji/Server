import { updateSectionService } from '../../services/section.services.js';
import {getGuestTeachersService, updateGuestTeacherService } from '../../services/guestTeacher.service.js';


const GuestTeacherStartJob =  async() => {
  try {
  let date = new Date()
  date = date.getTime()
  console.log("start guest teacher: ",date)

  const startableGuestTeachers = await getGuestTeachersService({ startTime: {$lte: date}, endTime: {$gte: date}, isActive: false })
  for (const guestTeacher of startableGuestTeachers) {
    await Promise.all([
      updateGuestTeacherService({_id: guestTeacher['_id']}, {isActive: true}),
      updateSectionService({_id: guestTeacher['section']}, {guestTeacher: guestTeacher["_id"]})
    ])
  }
} catch (error) {
  console.log(error.message)  
 }
}

export default GuestTeacherStartJob;
