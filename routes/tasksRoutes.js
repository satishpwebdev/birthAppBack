const express = require("express");
const router = express.Router();
const {getAllTasks,getTaskById,createTask, updateTask, deleteTask} = require('../controllers/taskController')
const {bulkUploadTasks} = require('../controllers/bulkController')
const {validateObjID, apiKeyMiddleware} =require('../middlewares')


router.get('/tasks', apiKeyMiddleware, getAllTasks)
router.get('/tasksbyid/:id?',validateObjID, apiKeyMiddleware, getTaskById)
router.post('/tasks', apiKeyMiddleware, createTask)
router.put('/tasksup/:id?',validateObjID, apiKeyMiddleware, updateTask)
router.delete('/taskdel/:id?', validateObjID, apiKeyMiddleware, deleteTask)

router.post('/bulk-upload', apiKeyMiddleware, bulkUploadTasks)


module.exports = router