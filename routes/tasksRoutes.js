const express = require("express");
const router = express.Router();
const {getAllTasks,getTaskById,createTask, updateTask, deleteTask} = require('../controllers/taskController')
const {bulkUploadTasks} = require('../controllers/bulkController')
const {validateObjID} =require('../middlewares')


router.get('/tasks', getAllTasks)
router.get('/tasksbyid/:id?',validateObjID, getTaskById)
router.post('/tasks', createTask)
router.put('/tasksup/:id?',validateObjID, updateTask)
router.delete('/taskdel/:id?', validateObjID, deleteTask)

router.post('/bulk-upload', bulkUploadTasks)


module.exports = router