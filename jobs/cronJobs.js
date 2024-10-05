
const cron = require("node-cron");
const sendMail = require("../mailservice/sendMail");
const Tasks = require("../models/taskModel");
const getAllCrudMethods = require("../services/index");
const taksList = getAllCrudMethods(Tasks);

const tasks = async () => {
  try {
    const res = await taksList.getAll();
    console.log(res); 
    return res;
  } catch (error) {
    console.log(error);
    return [];
  }
};

// specific timing  (12:54 PM)

cron.schedule('0 6 * * *', async () => {
    const today = new Date();
    const todayDate = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;  
    try {
        const allTasks = await tasks();  
        const todayBirthdays = allTasks.filter((birthday) => {
            const birthdayDate = new Date(birthday.birthDate);  
            const formattedBirthday = `${String(birthdayDate.getMonth() + 1).padStart(2, '0')}-${String(birthdayDate.getDate()).padStart(2, '0')}`;
            return formattedBirthday === todayDate;
        });
        console.log("Today's birthdays:", todayBirthdays);
        if (todayBirthdays.length > 0) {
            todayBirthdays.forEach((birthday) => {
                sendMail(birthday.workEmail, birthday.firstName);
            });
        } else {
            console.log("No birthdays today.");
        }
    } catch (error) {
        console.log("Error:", error);
    }
});

module.exports = cron;


