const mongoose = require('mongoose');


async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log('Connected to the MongoDB database successfully!');
        
    } catch (error) {
        console.log("Failed to connect to the database:", error);   
    }
}

module.exports = connectToDatabase;