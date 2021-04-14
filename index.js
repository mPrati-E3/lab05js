'use strict' ;

const express = require('express');
const morgan = require('morgan'); // logging requests to console
const app = express();

app.use(morgan('dev'));

app.use(express.static('./public')); // map static requests to the ./public directory

app.use(express.json()); // decode JSON in request body

//----------------------------------------------------------------------------------------

const BaseDati = [
    // id, description, important, private, project, deadline, completed
    [1, "Complete Lab 3",       false,  true,   "Javascript Exam",  "2021-03-29T14:30:00",  true],
    [2, "Buy some groceries",   false,  false,  "",                 "2021-03-30T14:00:00",  false],
    [3, "Read a good book!",    true,   true,   "Culture",          "",                     false],
    [4, "Watch Mr. Robot",      false,  true,   "Tv series",        "2021-03-25T21:30:00",  false],
    [5, "Program some Js",      true,   true,   "Javascript Exam",  "2021-04-20T21:30:00",  true],
    [6, "Repair PC",            true,   false,  "",                 "",                     false]
  ];

//-----------------------------------------------------------------------------------------

const dayjs = require('dayjs');

function TASK(id, desc, imp=false, priv=true, pro=null, dl=null, isCompleted=false ){
    this.id=id;
    this.description=desc;
    this.important=imp;
    this.private=priv;
    this.project=pro;
    this.deadline=dl && dayjs(dl);;
    this.completed=isCompleted;
}

let TL = [];

BaseDati.forEach(t => TL.push(new TASK(t[0],t[1],t[2],t[3],t[4],t[6])));


//------------------------------------------------------------------------------------


// retrieve a list of all available tasks
app.get('/tasks', (req, res) => {
    res.json(TL) ;
}) ;

// retrieve a list of all the tasks that fulfill a given property (important)
app.get('/tasks/importants', (req, res) => {
    res.json(TL.filter( i => i.important)) ;
});

// update an existing task, by providing all relevant information (all the properties except ‘id’ will
// overwrite the current properties of the existing task having that ‘id’)
app.post('/tasks/update/:taskId', (req, res) => {
    const taskId = req.params.taskId;
    const theTaskToModify = TL.filter((task)=>(task.id==taskId)) ;
    const theNewTask = req.body ;
    if( theNewTask.description && theNewTask.important && theNewTask.private && 
        theNewTask.project && theNewTask.deadline && theNewTask.completed) {

        for (let i=0; i<TL.length; i++){
            if (TL[i].id == taskId){
                TL[i].description=theNewTask.description;
                TL[i].important=theNewTask.important;
                TL[i].private=theNewTask.private;
                TL[i].project=theNewTask.project;
                TL[i].deadline=theNewTask.deadline;
                TL[i].completed=theNewTask.completed;
            }
        }

        res.end(); // close the POST request with an empty body

    } else {
        // the Json object doesn't have the expected properties
        res.status(400).json({reason: "insufficient information"});
    }
});


// delete an existing task, given its id
app.get('/tasks/delete/:taskId', (req, res) => {

    const taskId = req.params.taskId;

    if( taskId != null) {

        TL=TL.filter(task => task.id != taskId);

        res.json(TL) ;

        res.end(); // close the POST request with an empty body

    } else {
        // the Json object doesn't have the expected properties
        res.status(400).json({reason: "insufficient information"});
    }
});


// mark a task as “completed” given his id
app.get('/tasks/complete/:taskId', (req, res) => {
    const taskId = req.params.taskId;
    if( taskId != null) {

        for (let i=0; i<TL.length; i++){
            if (TL[i].id == taskId){
                TL[i].completed=true;
            }
        }

        res.json(TL) ;

        res.end(); // close the POST request with an empty body

    } else {
        // the Json object doesn't have the expected properties
        res.status(400).json({reason: "insufficient information"});
    }
});


// create a new task, by providing all relevant information – except the ‘id’
app.post('/tasks', (req, res) => {
    const theTask = req.body ;
    if( theTask.description && theTask.important && theTask.private && 
        theTask.project && theTask.deadline && theTask.completed) {
        TL.push({   
                    id:             TL.length+1, 
                    description:    theTask.description,
                    important:      theTask.important,
                    private:        theTask.private,
                    project:        theTask.project,
                    deadline:       theTask.deadline,
                    completed:      theTask.completed
                }); // add to database
        res.end(); // close the POST request with an empty body
    } else {
        // the Json object doesn't have the expected properties
        res.status(400).json({reason: "insufficient information"});
    }
});

// retrieve a task by his id
app.get('/tasks/:taskId', (req, res) => {
    const taskId = req.params.taskId ;
    const theTask = TL.filter((task)=>(task.id==taskId)) ;
    if(theTask.length==1) {
        res.json(theTask[0]) ; 
    } else {
        res.status(400).json({reason: "task not found", taskId: taskId});
    }
});

app.listen(3000, ()=>{ console.log('Application started');});

