# Node CLI Args By Config

## Summary
A command line args for node scripts.
The focus is to be simple to configure and use, but powerful if you need it.

## Limitations
- only supports positional and double-dash-equals (i.e. --myarg=myval or --myflag) args.
- assumes you will be running from a node script at this point.

## Supports
- positional args
- named arguments (e.g., --name)
- optional and required arguments (named only, positional are always required)
- decent looking help, which prints help on the arguments and an optional header
- easy way to validate your argument configuration
- typed arguments of 'int', 'float', 'date', 'string'
- argument factories, handy for creating an object out of a CLI arg
- custom validation if needed

## CLI examples
- `yarn myscript positinalArgVal1 positinalArgVal2 --other-arg=other-value --some-flag`
- `yarn myscript --other-arg=other-value --some-flag`

## Configuration

### Simple setup

```typescript
interface IMyArgObj
{
    arg1?: string;
    arg2?: number;
    arg3: number;
}

const myConfig: IArgsConfig = {
    helpHeader: 'My little script is handy.',
    definitions: [
        { name: 'arg1' },
        { name: 'arg2', type: 'int' },
        { name: 'arg3', type: 'int', required: true }
    ],
};

validateArgDefinitions(myConfig); //for testing only as next call validates anyway

const args = processArgs<IMyArgObj>(myConfig);
if(!args)
{
    //this only happens if there was an error with args, and help was printed out
    process.exit(-1);
}

console.log(`arg1 is ${args.arg1}`);
console.log(`arg2 is ${args.arg2}`);
console.log(`arg3 plus one is ${args.arg3+1}`);
```

### Available fields for Args
* @param name: name of the flag. This will also be the flag set on result object.
* @param type: type of value. If not set, and factory not set, assume 'string'. Mstring, number, date are accepted.
* @param description: description that will appear in helper.
* @param index: for required positional parameters. Starting at 0, ignoring interpreter and script name. i.e., ts-node npm-script arg0 arg1...
* @param required: set to true if this argument is required. Positional default to true. Only last positional can be optional.
* @param factory: a function which converts a string value into a TVal
* @param validator: a function which verifies that the constructed value is correct. It returns an error message if not valid.

#### Example with a factory and validator

```typescript
const sampelNumFactory = (s: string) => { return { theNumber: parseInt(s), ts: new Date() } };
const sampleBetween1and10 = (n: number) => (n < 1 || n > 10) ? 'must be between 1 and 10' : '';

const myConfig: IArgsConfig = {
    helpHeader: 'My little script is handy.',
    definitions: [
        { name: 'arg1' },
        { name: 'arg2', factory: sampelNumFactory, validator: sampleBetween1and10 },
        { name: 'arg3', type: 'int', required: true }
    ],
};

const args = processArgs<IMyArgObj>(myConfig);

console.log(`the number is ${args.arg2.theNumber}`);
```

## Available Calls
* processArgs - get arguments from the command line based on your configuration.
* printHelp - print command line help based on your configuration.
* validateArgDefinitions - run automatically when you process arguments, but handy for testing.
