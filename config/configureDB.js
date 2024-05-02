const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const configureDB = async () => {
    mongoose
        .connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            console.log('Connected to MongoDB');
        })
        .catch((error) => {
            console.log(error);
        });
};

module.exports = configureDB;