/**
 * @template TVal the type of value created as part of parsing
 * @param name name of the flag. This will also be the flag set on result object.
 * @param type type of value. If not set, and factory not set, assume 'string'. Mstring, number, date are accepted.
 * @param description description that will appear in helper.
 * @param index for required positional parameters. Starting at 0, ignoring interpreter and script name. i.e., ts-node npm-script arg0 arg1...
 * @param required set to true if this argument is required. Positional default to true. Only last positional can be optional.
 * @param factory a function which converts a string value into a TVal
 * @param validator a function which verifies that the constructed value is correct. It returns an error message if not valid.
 * @template TVal @param {TVal} val
 */
export interface IArgDef<TVal>
{
    readonly name: string;
    readonly type?: 'string' | 'int' | 'float' | 'date' | 'boolean';
    readonly description?: string;
    readonly index?: number;
    readonly required?: boolean;
    readonly factory?: (stringValue: string) => TVal;
    readonly validator?: (val: TVal) => string | null;
}

/**
 * @param definitions definitions for command line arguments.
 * @param helpHeader text to print before print help on arguments.
 * @param disableMinusH set to true if you don't want the --help option auto-generated.
 */
export interface IArgsConfig
{
    definitions: IArgDef<any>[];
    helpHeader?: string;
    disableMinusH?: boolean;
}
