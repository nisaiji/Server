import {execute , helper} from "../../src/services/dummy-services.js"; 

test('value is true and should return learn JS', () => {
  // jest.mock('helper', ()=>false)
  // helper.mockImplementation(()=>true)
  // const mock = jest.fn().mockImplementation(()=>false)
  // const spy = jest.spyOn(obj, 'helper').mockImplementation(()=>{
  //   return false
  // })
  const result = obj.execute();
  console.log(result)
  expect(result.toUpperCase()).toBe("learn js")
})
