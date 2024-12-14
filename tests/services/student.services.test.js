import studentModel from "../../src/models/student.model.js";
import { getStudentService } from "../../src/services/student.service.js";


afterEach(() => {
  // jest.clearAllMocks(); // Clears call history but keeps mock implementations
  // Or, if needed:

  // jest.resetAllMocks(); // Clears both call history and mock implementations
});


test('#getStudentService', async()=>{
  const data = { name: "kuldeep", age:22 }
  const spy = jest.spyOn(studentModel, 'findOne').mockImplementation(()=>{
    return {...data, createdAt:"2024-11-12", updatedAt: "2024-11-14"}
  })
  const student = await getStudentService({name:"kuldeep"})
  expect(spy).toHaveBeenCalledTimes(1)
  expect(spy).toHaveBeenCalled()
  expect(spy).toHaveBeenCalledWith({name:"kuldeep"})
  expect(true).toBeTruthy();
})

test("#findOne throw error", async () => {
  const spy = jest.spyOn(studentModel, "findOne").mockImplementation(() =>
    Promise.reject(new Error("Kuldeep"))
  );
  expect(spy).toHaveBeenCalledTimes(1)
  await expect(getStudentService({ name: "Kuldeep" })).rejects.toThrow("Kuldeep");
});

test("#findOne throw", async () => {
  // jest.clearAllMocks();
  const spy = jest.spyOn(studentModel, "findOne").mockImplementation(() =>
    Promise.reject(new Error("Kuldeep"))
  );
  expect(spy).toHaveBeenCalledTimes(1)
  await expect(getStudentService({ name: "Kuldeep" })).rejects.toThrow("Kuldeep");
});