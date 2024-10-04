const mongoose = require("mongoose");
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

// const dbUri =`mongodb+srv://${dbUser}:${dbPass}@e-commerce.72t9c.mongodb.net/${dbName}?retryWrites=true&w=majority`
const dbUri = `mongodb+srv://${dbUser}:${dbPass}@birthday-db.pv1qi.mongodb.net/?retryWrites=true&w=majority`;

//mongoose.connect(dbUri)

module.exports = () => {
  return mongoose.connect(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};
