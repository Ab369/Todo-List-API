//todoserver by storing in file in todos.json
//if multiple responses send from same function then it results in error
const express = require('express');
var bodyParser = require('body-parser');
const fs=require("fs");
const app = express();
const port=3000;
app.use(bodyParser.json());

app.post("/todos",createTodo);
app.get("/todos",getTodo);
app.get("/todos/:id",getTodoById);
app.put("/todos/:id",updateTodo);
app.delete("/todos/:id",deleteTodo);

let id;

/////////helping functions ///////////////////
function findId(arr,id)
{
  for(let i=0;i<arr.length;i++)
    {
      if(arr[i].id===id)
        return i;
    }

  return -1;
}

function removeElement(arr,index)
{
   let newArray=[];
   for(let i=0;i<arr.length;i++)
    {
      if(i!=index)
        newArray.push(arr[i]);
    }

    return newArray;
}

/////////////////////////////////////

function createTodo(req,res)
{
  let newTodo=req.body;
  let obj=newTodo;
  id= Math.floor(Math.random() * 10000);
  obj.id=id;

  fs.readFile("todos.json","utf-8",(err,data)=>
{
    if(err)throw err;

    //JSON to array of objects
    if(data.length==0)  //using this condition as initially todos.json is empty
        {
           obj=JSON.stringify(obj);  //to convert response object in string for storing in JSON
           firstValue="["+obj+"]";    //for putting a string that when parsed converts to array of objects
           fs.writeFile("todos.json",firstValue,(err)=>{
            if(err) throw err;
            res.send(firstValue);
           })
        }

    else  //in this case todos.json not empty so we need to push further values
    {
        let dataArr=JSON.parse(data); //converting to array of objects
        dataArr.push(obj);
        fs.writeFile("todos.json",JSON.stringify(dataArr),(err)=>
        {
            //we converted dataArr to string(using stringify) before writing in JSON file
            if(err) throw err;
            res.send(dataArr);
        })
    }
})
}

function getTodo(req,res)
{
  fs.readFile("todos.json","utf-8",(err,data)=>
{
    if(data.length==0)
        res.status(404);
    else
    res.send(JSON.parse(data));  //if send only data then send in JSON format
})
}

function getTodoById(req,res)
{
    let id=parseInt(req.params.id);
    fs.readFile("todos.json","utf-8",(err,data)=>
        {
            if(data.length==0)
                res.status(404);
            else
            {
                let dataArr=JSON.parse(data);
                let index=findId(dataArr,id);
                if(index!=-1)
                res.send(dataArr[index]);
                else
                res.status(404).send("item not found");
            }
        }) 
}

function updateTodo(req,res)
{

    let id=parseInt(req.params.id);
    fs.readFile("todos.json","utf-8",(err,data)=>
        {
            if(data.length==0)
                res.status(404);
            else
            {
                let newObj=req.body;
                let dataArr=JSON.parse(data);
                let index=findId(dataArr,id);
                if(index!=-1)
                {
                    let obj=dataArr[index];
                    obj.title=newObj.title;
                    obj.description=newObj.description;
                    obj.completed=newObj.completed;
                    dataArr[index]=obj;
                    fs.writeFile("todos.json",JSON.stringify(dataArr),(err)=>
                        {
                            if(err) throw err;
                            res.send(dataArr);
                        })
                }
                else
                res.status(404).send("item not found");
            }
        })
}


function deleteTodo(req,res)
{
  let id=parseInt(req.params.id);
  fs.readFile("todos.json","utf-8",(err,data)=>
    {
        if(data.length==0)
            res.status(404);
        else
        {
            let dataArr=JSON.parse(data);
            let index=findId(dataArr,id);
            if(index!=-1)
            {
                dataArr=removeElement(dataArr,index);
                fs.writeFile("todos.json",JSON.stringify(dataArr),(err)=>
                    {
                        if(err) throw err;
                        res.send(dataArr);
                    })
            }
            else
            res.status(404).send("item not found");
        }
    })
}
app.listen(port,()=>{console.log("started todoserver")});


module.exports = app;
