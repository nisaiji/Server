import exceljs from "exceljs";

export function constructStudentXlsxTemplate() {
  let workbook = new exceljs.Workbook();
  let worksheet = workbook.addWorksheet("Worksheet");

  let columns = [
    "First Name",
    "Last Name",
    "Gender",
    "Guardian Name",
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
    "(Optional)",
  ];
  worksheet.columns = columns.map((el) => ({ header: el, key: el, width: 20 }));
  worksheet.insertRow(2, row);
  return workbook;
}
