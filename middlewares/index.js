const ObjectId = require("mongoose").Types.ObjectId;

const validateObjID = (req, res, next) => {
  if (ObjectId.isValid(req.params.id) === false) {
    const error = new Error(`Given id is not valid: ${req.params.id}`);
    error.status = 400;
    return next(error);
  }
  next();
};

const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  const validApiKey = process.env.API_KEY;

  if (!apiKey || apiKey !== validApiKey) {
    return res.status(403).json({ message: "Forbidden. Invalid or missing API key." });
  }

  next();
};

// const respHandle =(req,res)=>{
//    res.status(200).json({
//       success: res
//    })
// }

const res404Handle = (req, res) => {
  res.status(404).json({
    error: `No records for this ${req.params.id}`
  });
};

const errorHandler = (error, req, res, next) => {
  res.status(500).json({ error });
};

module.exports = {
  validateObjID,
  res404Handle,
  errorHandler,
  apiKeyMiddleware
  //  respHandle
};
