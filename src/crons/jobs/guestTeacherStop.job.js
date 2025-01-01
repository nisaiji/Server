import { updateSectionService } from '../../services/section.services.js';
import { deleteGuestTeacherService, getGuestTeachersService, updateGuestTeacherService } from '../../services/guestTeacher.service.js';
import { getLeaveRequestsService, updateLeaveRequestService } from '../../services/leave.service.js';


const GuestTeacherStopJob =  async() => {
  try {
  let date = new Date()
  date = date.getTime()
  console.log("guest teacher stop: ",date)

  const leaveRequests = await getLeaveRequestsService({endTime : {$lte: date}, status: {$in: ['accept', 'pending']}});
  const expiredGuestTeachers = await getGuestTeachersService({endTime: {$lte: date}, isActive: true});

  for (const leaveRequest of leaveRequests) {
    const leaveRequestState = leaveRequest['status'] === 'accept' ? 'complete' : 'expired'
    await updateLeaveRequestService({ _id: leaveRequest['_id'] }, { status: leaveRequestState })
  }
  for (const guestTeacher of expiredGuestTeachers) {
    await Promise.all([
      updateGuestTeacherService({ _id: guestTeacher["_id"] }, { isActive: false }),
      updateSectionService({_id: guestTeacher['section']}, {guestTeacher: null})
    ])
  }
} catch (error) {
  console.log(error.message)  
}
}

export default GuestTeacherStopJob;
