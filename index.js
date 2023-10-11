const { mongoDB } = require("./config/database");
const {DatabaseConnectionError} = require('./error-types/db-connection-err');
require('dotenv').config()
const {app} = require("./app");

async function startApp(){

    try {

        const mongo = await mongoDB();
        console.log("Mongo DB connected")
    
    } catch (error) {
        console.log(error)
        throw new DatabaseConnectionError();
    }
    
    const port = process.env.PORT || 8080

    app.listen(port, () => {
        console.log(`Listening on port ${port}`);
    });
    
}

startApp();
