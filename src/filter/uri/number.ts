import { Request, Response, NextFunction } from "express";
function FilterNumber(req: Request, res: Response, next: NextFunction) {

  var random  = `Whats_api_${Math.floor(Math.random() * 10000)}`;
   console.log(random);
   
  // const phoneNumberRegex = /^\+?[1-9]\d{1,14}$/;
  // if (!phoneNumberRegex.test(req.params.id)) {
  //   return res.status(400).json({ error: "Invalid phone number format" });
  // }
  // next();

}
export { FilterNumber }