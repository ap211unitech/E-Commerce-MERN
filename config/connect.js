const mongoose = require("mongoose");
const config = require("config");
const MongoURI = config.get("MongoURI");

const Conenction = async () => {
    try {
        await mongoose.connect(MongoURI, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        })
        console.log("DB Connected");
    } catch (err) {
        console.log(err.message);
        process.exit(1);
    }
}
module.exports = Conenction;