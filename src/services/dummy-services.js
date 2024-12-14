import { helper } from "./dummy-helper.js";

export const execute = () =>{
  console.log("execute method called-------------------------")
  const result = helper();
  if(true){
    return "learn JS"
  }else{
    return "learn react"
  }
}