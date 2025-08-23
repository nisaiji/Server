import { getSectionService, updateSectionService } from "../../services/section.services.js";
import { getStudentService, registerStudentService } from "../../services/student.service.js";
import { registerStudentFromExcelSchema } from "../../validators/studentSchema.validator.js";
import { excelDateToStringDateFormat } from "../../services/celender.service.js";
import { getParentService, registerParentService } from "../../services/v2/parent.services.js";
import { getSchoolParentService, registerSchoolParentService } from "../../services/v2/schoolParent.services.js";
import { registerSessionStudentService } from "../../services/v2/sessionStudent.service.js";

export async function registerStudentsFromExcelHelper(students, sectionId, classId, sessionId, adminId){
  try {
     // validate each student from excel file
     students.shift();
    for(const student of students){
      console.log({student})
    const studentValidation =  registerStudentFromExcelSchema.validate(student);
    if(studentValidation.error){
      throw new Error(JSON.stringify({
        status: "Failed",
        student: student['First Name'],
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
      let parent = await getParentService({ phone, isActive:true });
      let schoolParent = await getSchoolParentService({phone, school: adminId, isActive: true})

      if(!schoolParent) {
        if(!parent) {
          parent = await registerParentService({phone, status: 'unVerified'});
        }
        const parentObj = { fullname: parentName, phone, email, qualification, occupation, school: adminId, parent: parent['_id'] };
        schoolParent = await registerSchoolParentService(parentObj);
      }

      let studentInfo = await getStudentService({ firstname, schoolParent: schoolParent["_id"] });
      const studentObj = { firstname, lastname, gender, bloodGroup, dob, address, city, district, state, country, pincode }

      if(!studentInfo) {
        studentObj['schoolParent'] = schoolParent['_id'];
        studentObj['parent'] = parent['_id'];
        // studentObj['classId'] = classId;
        studentObj['admin'] = adminId;

        const registeredStudent = await registerStudentService(studentObj);
        await registerSessionStudentService({student:registeredStudent._id, session: sessionId, classId, section: sectionId, admin: adminId, schoolParent: schoolParent._id, parent: parent._id});
        const section = await getSectionService({_id:sectionId});
        await updateSectionService({_id:sectionId}, {studentCount: section["studentCount"]+1});
        insertedStudentCount++;
      }
    }
    return insertedStudentCount;
  } catch (error) {
    throw error;
  }
}
