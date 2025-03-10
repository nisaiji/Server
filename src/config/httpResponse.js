const adminControllerResponse = {
    registerAdminController: {
      emailExists: "Email already exists",
      phoneExists: "Phone number already exists",
      adminResiteredSuccessfully: "Admin registered successfully"
    },

    loginController: {
      unathorized: "Invalid credentials. Please try again"
    },

    updateAdminController: {
      usernameExists: "Username already exists",
      emailExists: "Email already exists",
      phoneExists: "Phone already exists",
      affiliationExists: "Affiliation No already exists",
      adminUpdatedSuccessfully: "Admin updated successfully"
    }
  }

const attendanceControllerResponse = {
  attendanceByTeacherController: {
    sectionNotFound: "Section not found",
    teacherUnauthorized: "Teacher is unauthorized",
    noStudents: "No student provided",
    todayIsSunday: "Today is Sunday",
    scheduledHoliday: "Today is scheduled as holiday",
    attendanceAlreadyMarked: "Attendance already marked",
    attendanceMarkedSuccessfully: "Attendance marked successfully",
  },

  attendanceByParentController: {
    invalidAttendanceValue: "Invalid attendance value",
    studentNotFound: "student not found",
    unathorizedParent: "Parent is not authorized to mark attendance",
    todayIsSunday: "Today is Sunday",
    scheduledHoliday: "Today is scheduled as holiday",
    parentCantMarkAttendance: "Parent can't mark attendance,teacher already marked",
    attendanceAlreadyMarkedByParent: "Attendance already marked by parent",
    parentUnableToMarkAttendance: "Parent is unable to mark attendance",
    attendanceMarkedSuccessfully: "Attendance marked sucessfully"
  }

}


export {
  adminControllerResponse,
  attendanceControllerResponse
}