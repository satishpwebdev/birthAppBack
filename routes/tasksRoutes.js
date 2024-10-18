const express = require("express");
const router = express.Router();
const {getAllTasks,getTaskById,createTask, updateTask, deleteTask} = require('../controllers/taskController')
const {bulkUploadTasks} = require('../controllers/bulkController')
const {validateObjID, apiKeyMiddleware} =require('../middlewares')


router.get('/tasks', apiKeyMiddleware, getAllTasks)
router.get('/tasksbyid/:id?',validateObjID, getTaskById)
router.post('/tasks', apiKeyMiddleware, createTask)
router.put('/tasksup/:id?',validateObjID, updateTask)
router.delete('/taskdel/:id?', validateObjID, deleteTask)

router.post('/bulk-upload', bulkUploadTasks)


module.exports = router