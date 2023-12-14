const RouteNotFound = require("../exceptions/RouteNotFound");
const { sendResponse } = require("./errorsManager");

module.exports =    function (req, res, next)
                    {
                        sendResponse(new RouteNotFound("Rotta non trovata"), res);
                    }