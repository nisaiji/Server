export async function parentForgetPasswordEventRegisterService(data){
  try {
    const {eventType,sender,receiver,title,description,date} = data;
    const event = await eventModel.create(data);
    return event;
  } catch (error) {
    throw error;
  }
}

export async function teacherForgetPasswordEventRegisterService(data){
  try {
    const {eventType,sender,receiver,title,description,date} = data;
    const event = await eventModel.create(data);
    return event;
  } catch (error) {
    throw error;
  }
}