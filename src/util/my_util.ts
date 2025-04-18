// const cronParser = require("cron-parser");
import {Parser} from "json2csv";

const randToken = require('rand-token');
const fs = require('fs');
export default class MyUtil {

    static getMongooseId() {
        // return mongoose.Types.ObjectId().toString();
        return randToken.generate(6);

        //The following are the odds of getting a non-unique id for number of digits
        // 4 -> one in 14.7 million
        // 6 -> one in 56.8 billion
    };


}