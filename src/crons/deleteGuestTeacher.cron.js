import { updateSectionService } from '../services/section.services.js';
import { deleteGuestTeacherService, getGuestTeachersService } from '../services/guestTeacher.service.js';
import { getLeaveRequestsService, updateLeaveRequestService } from '../services/leave.service.js';
import { CronJob } from 'cron';


const invalidateGuestTeacherCron = new CronJob('0/10 * * * * *',  async() => {
  try {
  let date = new Date()
  console.log(date)
  date = date.getTime()
  console.log(date)

  const leaveRequests = await getLeaveRequestsService({endTime : {$lte: date}, status: 'accept'});
  const expiredGuestTeachers = await getGuestTeachersService({endTime: {$lte: date}});

  for (const leaveRequest of leaveRequests) {
    await updateLeaveRequestService({ _id: leaveRequest['_id'] }, { status: 'complete' })
  }

  for (const guestTeacher of expiredGuestTeachers) {
    await Promise.all([
       deleteGuestTeacherService({_id: guestTeacher['_id']}),
       updateSectionService({_id: guestTeacher['section']}, {guestTeacher: null})
    ])
  }
} catch (error) {
  console.log(error.message)  
}
})

export default invalidateGuestTeacherCron;
