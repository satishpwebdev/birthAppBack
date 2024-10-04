const Tasks = require("../models/taskModel");

const getAllCrudMethods = require("../services");
const { res404Handle } = require("../middlewares");

const tasksCrud = getAllCrudMethods(Tasks);

const getAllTasks = (req, res, next) => {
  tasksCrud
    .getAll()
    .then((data) => {
      res.send(data);
    })
    // .catch((err) => {
    //    console.log(err);
    // });
    .catch((err) => next(err));
};

const getTaskById = (req, res, next) => {
  if (!req.params.id) {
    res.status(400).json({ error: "No ID provided" });
  } else {
    tasksCrud
      .geyById(req.params.id)
      .then((data) => {
        if (data) {
          res.send(data);
        } else {
          // res.status(404).json({ message: "Not found" });
          res404Handle(req, res);
        }
      })
      .catch((err) => {
        // console.log(err);
        next(err);
      });
  }
};

// const createTask = (req, res, next) => {
//    const { empCode, firstName, lastName,birthDate, workEmail } = req.body;
//    const remindTask = new Tasks({
//       empCode,
//       firstName,
//       lastName,
//       birthDate,
//       workEmail
//    });
//    if (!empCode || !firstName || !lastName || !birthDate || !workEmail) {
//       res.status(400).json({ error: `Something is missing` });
//    } else {
//       tasksCrud
//          .create(remindTask)
//          .then((data) => res.send(data))
//          .catch((err) => next(err));
//    }
// };

const createTask = (req, res, next) => {
  const { empCode, firstName, lastName, birthDate, workEmail } = req.body;

  if (!empCode || !firstName || !lastName || !birthDate || !workEmail) {
    return res.status(400).json({ error: "Something is missing" });
  }

  tasksCrud
    .getAll()
    .then(() => {
      return Tasks.findOne({
        $or: [{ empCode: empCode }, { workEmail: workEmail }]
      });
    })
    .then((existingTask) => {
      if (existingTask) {
        return res.status(400).json({ error: "Record already exists" });
      } else {
        const newTask = new Tasks({
          empCode,
          firstName,
          lastName,
          birthDate,
          workEmail
        });

        return tasksCrud
          .create(newTask)
          .then((data) => {
            res.status(201).json({ message: "Task created successfully", data });
          })
          .catch((err) => next(err));
      }
    })
    .catch((err) => next(err));
};

const deleteTask = (req, res, next) => {
  if (!req.params.id) {
    res.status(400).json({ error: "No ID provided" });
  } else {
    tasksCrud
      .delete(req.params.id)
      .then((data) => {
        if (data) {
          res.send(data);
        } else {
          // res.status(404).json({ message: "Not found" });
          res404Handle(req, res);
        }
      })
      .catch((err) => next(err));
  }
};

const updateTask = (req, res, next) => {
  if (!req.params.id || !req.body) {
    res.status(400).json({ error: "No ID or Message provided" });
  } else {
    tasksCrud
      .update(req.params.id, req.body)
      .then((data) => {
        if (data) {
          res.send(data);
        } else {
          // res.status(404).json({ message: "Not found" });
          res404Handle(req, res);
        }
      })
      .catch((err) => next(err));
  }
};

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };
