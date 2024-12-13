export const helper = () =>{
  console.log("helper method called-----------------------------")
  const num = Math.floor(Math.random()*10);
  return num*2==0;
}

export const execute = () =>{
  console.log("execute method called-------------------------")
  const result = helper();
  if(true){
    return "learn JS"
  }else{
    return "learn react"
  }
}