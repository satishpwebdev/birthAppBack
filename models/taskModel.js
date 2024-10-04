const mongoose = require("mongoose");

module.exports = mongoose.model("Tasks", {
  empCode: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  birthDate: { type: String },
  workEmail: { type: String }
});
