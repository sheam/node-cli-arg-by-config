import { processArgs } from "./processing";
import { IArgDef, IArgsConfig } from "./types";
import { printHelp, validateArgDefinitions } from "./definitions";

export type {
    IArgsConfig,
    IArgDef
}

export {
    processArgs,
    printHelp,
    validateArgDefinitions,
};
