"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MyResponse {
    static getSuccessResponse(msg) {
        if (!msg)
            msg = "Success !";
        let result = {};
        result.response = 200;
        result.message = msg;
        return result;
    }
    ;
    static getFailureResponse(msg) {
        if (!msg)
            msg = "Unknown error !";
        let result = {};
        result.response = -1;
        result.message = msg;
        return result;
    }
    static isSuccess(responseObject) {
        return (responseObject && responseObject.response === 200);
    }
}
exports.default = MyResponse;
