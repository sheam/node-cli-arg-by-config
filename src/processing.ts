import {IArgDef, IArgsConfig} from "./types";
import {getIndexedDefinitions, getNamedDefinitions, printHelp, validateArgDefinitions} from "./definitions";

function getTypedValue<TVal>(strVal: string, def: IArgDef<TVal>): TVal
{
    let val: any;
    const type = def.type||'string';
    switch(type)
    {
        case 'string':
            val = strVal;
            break;
        case 'int':
            val = parseInt(strVal);
            if(isNaN(val)) val = null;
            break;
        case 'float':
            val = parseFloat(strVal);
            if(isNaN(val)) val = null;
            break;
        case 'date':
            val = new Date(strVal);
            if(isNaN(val.getTime())) val = null;
            break;
        case 'boolean':
            if(!strVal || strVal === 'true')
            {
                val = true;
            }
            else if(strVal === 'false')
            {
                val = false;
            }
            else
            {
                val = null;
            }
            break;
    }
    if(val === null)
    {
        throw new Error(`Unable to convert argument ${def.name} with value '${strVal}' into a value of type ${type}`);
    }
    return val;
}

function getFactoryValue<TVal>(strVal: string, def: IArgDef<TVal>): TVal
{
    if(!def.factory)
    {
        throw new Error(`no factory specified for ${def.name}`);
    }

    let val: TVal;
    try {
        val = def.factory(strVal);
    }
    catch(e)
    {
        throw new Error(`failed creating value for argument ${def.name} from '${strVal}'`);
    }
    if(!val)
    {
        throw new Error(`failed create valid value for argument ${def.name} from '${strVal}'`);
    }
    return val;
}

function getValidValue<TVal>(strVal: string, def: IArgDef<TVal>): TVal
{
    const val = def.factory ? getFactoryValue(strVal, def) : getTypedValue(strVal, def);
    if(def.validator)
    {
        const err = def.validator(val);
        if(err)
        {
            throw new Error(`Value for '${def.name}' failed validation: ${err}`);
        }
    }
    return val;
}

function getNamedArgVal(arg: string, namedDefinitions: IArgDef<any>[]): { name: string, strVal: string, def: IArgDef<any> }
{
    const match = arg.match(/--(\w+)=(.+)/);
    if(!match)
    {
        throw new Error(`'${arg}' does not appear to be a valid named or positional argument`);
    }
    const name = match[1];
    const strVal = match[2];

    const def = namedDefinitions.find(d => d.name === name);
    if(!def)
    {
        throw new Error(`Could not find a definition for argument '${arg}' with name '${name}' and value '${strVal}'`);
    }

    return {
        name,
        strVal,
        def
    };
}

function getArgs<TArgObj>(config: IArgsConfig): TArgObj
{
    const {definitions} = config;
    validateArgDefinitions(config);

    const args = process.argv.slice(2);
    const resultObj: any = {};

    const indexedDefinitions = getIndexedDefinitions(definitions);
    const namedDefinitions = getNamedDefinitions(definitions);
    for(const a of indexedDefinitions)
    {
        if(typeof(a.index) !== 'number') throw new Error(`invalid index value`);

        const strVal = args[a.index];
        if(!strVal)
        {
            throw new Error(`'${a.name}' at position ${a.index+1} is missing a value`);
        }
        if(strVal.startsWith('--'))
        {
            throw new Error(`'${a.name}' at position ${a.index+1} must not contain hyphens in its value`);
        }

        resultObj[a.name] = getValidValue(strVal, a);
    }

    const remainingArgs = args.slice(indexedDefinitions.length);
    for(const arg of remainingArgs)
    {
        const result = getNamedArgVal(arg, namedDefinitions);
        const value = getValidValue(result.strVal, result.def);
        resultObj[result.name] = value;
    }

    const requiredDefinitions = namedDefinitions.filter(x => x.required);
    for(const a of requiredDefinitions)
    {
        const hasVal = typeof(resultObj[a.name]) !== 'undefined';
        if(!hasVal)
        {
            throw new Error(`'${a.name}' is required, but no value was specified for it.`);
        }
    }

    return resultObj as TArgObj;
}

/**
 * Return the built out command line arguments object.
 * @param config the configuration of your command line.
 * @returns the built out object, or null if unable to parse commands.
 */
export function processArgs<TArgObj>(config: IArgsConfig): TArgObj|null
{
    if(!config.disableMinusH)
    {
        if(process.argv.indexOf('--help') >= 0 || process.argv.indexOf('-h') >= 0)
        {
            printHelp(config);
            return null;
        }
    }

    try
    {
        return getArgs<TArgObj>(config);
    }
    catch(e: any)
    {
        if(e.message)
        {
            console.log(e.message);
        }
        else
        {
            console.log(e)
        }
        printHelp(config);
        return null;
    }
}

export const forTesting = { getTypedValue, getFactoryValue, getNamedArgVal, getArgs, getValidValue };