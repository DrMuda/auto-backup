// import config from "./conifg.json";
const config = require("./conifg.json");
// import fse from "fs-extra";
const fse = require("fs-extra");
// import compressing from "compressing";
const compressing = require("compressing");
// import moment from "moment";
const moment = require("moment");
// import log4js from "log4js";
const log4js = require("log4js");

log4js.configure({
    appenders: {
        cheese: { type: "file", filename: "./logs/autoBackup.log" },
        console: {
            type: "console",
        },
    },
    categories: { default: { appenders: ["cheese", "console"], level: "debug" } },
});
const log = log4js.getLogger("default");

try {
    log.info(`check config`);
    if (typeof config.path !== "string" || !config.path) {
        throw "path should be a string";
    }
    if (typeof config.output !== "string" || !config.output) {
        throw "output should be a string";
    }
    if (typeof config.frequency !== "number") {
        throw "frequency should be a number";
    }
    if (typeof config.timeout !== "number") {
        throw "timeout should be a number";
    }
    if (!fse.pathExistsSync(config.path)) {
        throw "config.path is not exists";
    }
    if (!fse.pathExistsSync(config.output)) {
        fse.mkdirSync(config.output);
    }
    log.info("config is right");

    setInterval(() => {
        const tempPath = "./zipTemp";
        if (!fse.pathExistsSync(tempPath)) {
            fse.mkdirSync(tempPath);
        }
        const timeFormat = "YYYY-MM-DD HH.mm.ss";
        const time = moment().format(timeFormat);
        compressing.zip
            .compressDir(config.path, `${tempPath}/${time}.zip`)
            .then(() => {
                log.info("zip success");
                fse.copy(tempPath, config.output, function (err) {
                    if (err) {
                        log.error("An error occured while copying the folder.");
                        return log.error(err);
                    }
                    log.info("Copy completed!");
                    setTimeout(() => {
                        fse.removeSync("./zipTemp");
                    }, 1000);
                    const fileNameList = fse.readdirSync(config.output);
                    for (let i = 0; i < fileNameList.length; i++) {
                        const fileCreateTime = moment(fileNameList[i], `${timeFormat}.zip`);
                        if ((moment() - fileCreateTime) / 1000 > config.timeout * 60) {
                            fse.removeSync(`${config.output}/${fileNameList[i]}`);
                            log.info("remove " + fileNameList[i]);
                        }
                    }
                });
            })
            .catch(() => {
                throw "zip error";
            });
    }, config.frequency * 60 * 1000);
} catch (error) {
    log.error(error);
}
