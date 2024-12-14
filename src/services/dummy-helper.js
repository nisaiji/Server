export const helper = () =>{
  console.log("helper method called-----------------------------")
  const num = Math.floor(Math.random()*10);
  return num*2==0;
}