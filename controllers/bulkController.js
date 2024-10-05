const multer = require('multer');
const xlsx = require('xlsx');
const Tasks = require('../models/taskModel');

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } }).single('file'); 

const bulkUploadTasks = (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: 'File upload error', message: err.message });
        }
        
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
            
            const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(sheet);

            const tasksToInsert = data.map((record) => {
                const { empCode, firstName, lastName, birthDate, workEmail } = record;

                if (!empCode || !firstName || !lastName || !birthDate || !workEmail) {
                    throw new Error(`Missing required fields in record: ${JSON.stringify(record)}`);
                }

                return {
                    empCode,
                    firstName,
                    lastName,
                    birthDate,
                    workEmail
                };
            });

            const existingTasks = await Tasks.find({
                $or: tasksToInsert.map(task => ({ empCode: task.empCode }))
            });

            const existingEmpCodes = existingTasks.map(task => task.empCode);
            const newTasks = tasksToInsert.filter(task => !existingEmpCodes.includes(task.empCode));

            
            if (newTasks.length > 0) {
                const insertedTasks = await Tasks.insertMany(newTasks);
                res.status(201).json({
                    message: `${insertedTasks.length} tasks uploaded successfully`,
                    data: insertedTasks
                });
            } else {
                res.status(200).json({
                    message: 'All tasks already exist in the database',
                });
            }
        } catch (error) {
            next(error);
        }
    });
};

module.exports = {
    bulkUploadTasks
};
