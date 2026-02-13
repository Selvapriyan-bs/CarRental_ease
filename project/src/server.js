const express = require("express");
const cors = require("cors");
// const fs = require("fs");

const app=express();
const PORT=4000;
app.use(express.json());
app.use(cors())

const courses = require("./data/db.json");
    
app.get("/course/list",(req,res)=>{
return res.json(courses);
})

app.get("/course/list/:id",(req,res)=>{
const id=Number(req.params.id)
const course=courses.find((c)=>c.cid==id)
if(!course){
    return res.json({"Msg":"course not found"})
}return res.json(course)
})
app.delete('/course/list/:id',(req,res)=>{
    const id=Number(req.params.id)
    const index = courses.findIndex((c)=>c.cid==id)
    if(index === -1){
        return res.json({"Msg":"Course not found"})
    }
    courses.splice(index, 1)
    res.json({"Msg":"Deleted Successfully.."})
})
app.put('/course/list/:id',(req,res)=>{
    const id=Number(req.params.id)
    const {cname,ctitle}=req.body
    const course=courses.find((c)=>c.cid==id)
    if(!course)
        return res.json({"Msg":"Course not found"})
    course.cname=cname;
    course.ctitle=ctitle;
    // fs.writeFileSync('./data/db.json', JSON.stringify(courses, null, 1))
    res.json({"Msg":"Updated Successfully"})
})
app.post('/course/list',(req,res)=>{
    const {cname,ctitle}=req.body
    const nid=courses.length+1;
    const newobject={cid:nid,cname,ctitle}
    courses.push(newobject)
    // fs.writeFileSync('./data/db.json', JSON.stringify(courses, null, 1))
    res.status(201).json({"Msg":"Data stored"});
})
app.listen(PORT,()=>{
    console.log("Server is running on port number 4000")
})

