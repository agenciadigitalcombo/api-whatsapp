import sessionsModel from "../database/models/sessions.model";
import fs from "fs/promises";
export default async function sessionVerify(number: string): Promise<boolean> {
  try {
    const dataSession: any = await sessionsModel.getSessionNumber(number);

    if (dataSession?.success && dataSession.data.length > 1) {
      const deleteData = await sessionsModel.deleteSession(dataSession.data[0].id);
      if (deleteData === true) {
        await fs.rmdir("./auth/"+dataSession.session_name);

        return !!deleteData;
      }
    }
    
    return true; 
  } catch (error) {
    throw error; 
  }
}
