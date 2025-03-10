import { getSectionService, updateSectionService } from "../services/section.services.js";
import { getStudentService, registerStudentService } from "../services/student.service.js";
import { getParentService, registerParentService } from "../services/parent.services.js";
import { registerStudentFromExcelSchema } from "../validators/studentSchema.validator.js";
import { hashPasswordService } from "../services/password.service.js";
import { excelDateToStringDateFormat } from "../services/celender.service.js";

export async function registerStudentsFromExcelHelper(students, sectionId, classId, adminId){
  try {
     // validate each student from excel file
     students.shift();
    for(const student of students){
    const studentValidation =  registerStudentFromExcelSchema.validate(student);
    if(studentValidation.error){
      throw new Error(JSON.stringify({
        status: "Failed",
        student: student['firstname'],
        reason: studentValidation.error.message
      }));      
    }
    }

    // insert each student from excel file
    let insertedStudentCount = 0;
    for(const student of students){
      const normalizedStudent = {
        firstname: student['First Name'],
        lastname: student['Last Name'],
        gender: student['Gender'],
        bloodGroup: student['Blood Group'],
        dob: typeof student['DOB (dd-mm-yyyy)'] === "number" ? excelDateToStringDateFormat(student['DOB (dd-mm-yyyy)'], 'dd-mm-yyyy') : student['DOB (dd-mm-yyyy)'],
        address: student['Address'],
        city: student['City'],
        district: student['District'],
        state: student['State'],
        country: student['Country'],
        pincode: student['Pincode'],
        parentName: student['Guardian Name'],
        phone: student['Phone'],
        email: student['Email'],
        occupation: student['Occupation'],
        qualification: student['Qualification']
      };

      const { firstname, lastname, gender, bloodGroup, dob, address, city, district, state, country, pincode, parentName, phone, email, qualification, occupation } = normalizedStudent;
      const parentObj = {fullname: parentName, phone, email,qualification, occupation}
      const studentObj = {firstname, lastname, gender, bloodGroup, dob, address, city, district, state, country, pincode}
      let parent = await getParentService({ phone, isActive:true });
      if(!parent){
        const parentNames = parentName.split(" ");
        const password = parentNames[0] + "@" + phone;
        parentObj['password'] = await hashPasswordService(password);
        parent = await registerParentService(parentObj);
      }
      let studentInfo = await getStudentService({ firstname, parent: parent["_id"] });
      if(!studentInfo){
        studentObj['parent'] = parent['_id']
        studentObj['section'] = sectionId
        studentObj['classId'] = classId
        studentObj['admin'] = adminId
        await registerStudentService(studentObj)
        const section = await getSectionService({_id:sectionId})
        await updateSectionService({_id:sectionId}, {studentCount: section["studentCount"]+1})
        insertedStudentCount++
      }
    }
    return insertedStudentCount
  } catch (error) {
    throw error;
  }
}
