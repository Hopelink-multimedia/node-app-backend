
export default class MyResponse {

    static getSuccessResponse(msg?: string) {
        if (!msg) msg = "Success !";

        let result: any = {};
        result.response = 200;
        result.message = msg;
        return result;
    };

    static getFailureResponse(msg?: string) {
        if (!msg) msg = "Unknown error !";

        let result: any = {};
        result.response = -1;
        result.message = msg;

        return result;
    }

    static isSuccess(responseObject: { response: number; }) {
        return (responseObject && responseObject.response === 200);
    }
}

