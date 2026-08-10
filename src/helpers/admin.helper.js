import exceljs from "exceljs";

export function constructStudentXlsxTemplate() {
  let workbook = new exceljs.Workbook();
  let worksheet = workbook.addWorksheet("Worksheet");

  let columns = [
    "First Name",
    "Last Name",
    "Gender",
    "Guardian Name",
    "Second Guardian Name",
    "Phone",
    "Blood Group",
    "DOB (dd-mm-yyyy)",
    "Address",
    "City",
    "District",
    "State",
    "Country",
    "Pincode",
    "Email",
    "Qualification",
    "Occupation",
    "Aadhar Number"
  ];
  let row = [
    "(Required)",
    "(Required)",
    "(Required)",
    "(Required)",
    "(Required)",
    "(Optional)",
    "(Optional)",
    "(Optional)",
    "(Optional)",
    "(Optional)",
    "(Optional)",
    "(Optional)",
    "(Optional)",
    "(Optional)",
    "(Optional)",
    "(Optional)"
  ];
  worksheet.columns = columns.map((el) => ({ header: el, key: el, width: 20 }));
  worksheet.addRow(row);
  return workbook;
}

export function constructTeacherXlsxTemplate() {
  let workbook = new exceljs.Workbook();
  let worksheet = workbook.addWorksheet("Worksheet");

  let columns = [
    "firstName",
    "lastName",
    "phone",
    "email",
    "gender",
    "dob",
    "bloodGroup",
    "university",
    "degree",
    "address",
    "city",
    "district",
    "state",
    "country",
    "pincode"
  ];
  let row = [
    "(Required)",
    "(Optional)",
    "(Required)",
    "(Optional)",
    "(Optional)",
    "(Optional)",
    "(Optional)",
    "(Optional)",
    "(Optional)",
    "(Optional)",
    "(Optional)",
    "(Optional)",
    "(Optional)",
    "(Optional)",
    "(Optional)"
  ];
  worksheet.columns = columns.map((el) => ({ header: el, key: el, width: 20 }));
  worksheet.addRow(row);
  return workbook;
}
