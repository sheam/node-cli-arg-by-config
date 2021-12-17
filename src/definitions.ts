import { IArgDef, IArgsConfig } from "./types";

export function getIndexedDefinitions(definitions: IArgDef<any>[]): IArgDef<any>[]
{
    const indexed = definitions.filter(a => typeof (a.index) !== 'undefined');
    indexed.sort((x, y) => (x.index || 0) - (y.index || 0));
    return indexed;
}

export function getNamedDefinitions(definitions: IArgDef<any>[]): IArgDef<any>[]
{
    return definitions.filter(a => typeof (a.index) === 'undefined');
}

export function validateArgDefinitions(config: IArgsConfig): void
{
    const { definitions, disableMinusH } = config;

    //check sequential arguments
    const indexed = getIndexedDefinitions(definitions);
    for (const [i, a] of indexed.entries())
    {
        if (i !== a.index)
        {
            throw new Error(`Definition for argument '${a.name}' has an invalid index value (${a.index}). Should it be ${i}?`);
        }
        if (typeof (a.required) !== 'undefined' && a.required !== true)
        {
            throw new Error(`Definition for argument '${a.name}' has an invalid value (${a.required}) for 'required'. Positional arguments are always required.`);
        }
    }

    const counts: { [name: string]: number } = {};
    counts['help'] = disableMinusH ? 0 : 1;
    counts['h'] = disableMinusH ? 0 : 1;
    for (const a of definitions)
    {
        const n = counts[a.name] || 0;
        if (n > 0)
        {
            throw new Error(`There is more than one definition specified for '${a.name}'.`);
        }
        counts[a.name] = n + 1;

        //can't specify type and factory
        if (a.type && a.factory)
        {
            throw new Error(`Definition for argument '${a.name}' must not have both 'type' and 'factory' specified.`);
        }
    }
}

export function printHelp(config: IArgsConfig): void
{
    const fx = (str: string) => str.padEnd(30);

    const lines: string[] = [];
    const { helpHeader, definitions, disableMinusH } = config;
    if (helpHeader)
    {
        lines.push(helpHeader)
    }

    const argv = process.argv;
    lines.push('Run command as:');

    const indexed = getIndexedDefinitions(definitions);
    const indexedNames = indexed.map(d => `<${d.name}>`).join(' ');
    lines.push(`   ${argv[0]} ${argv[1]} ${indexedNames} [other arguments]`);
    for (const d of indexed)
    {
        const type = d.type ? `(${d.type}) ` : '';
        lines.push(`   ${fx(d.name)} : ${type}${d.description}`);
    }

    const named = getNamedDefinitions(definitions);
    lines.push('Other arguments: ');
    if (!disableMinusH)
    {
        lines.push(`   ${fx('--help')} : show this help text`);
    }
    for (const d of named)
    {
        const required = d.required ? '(required) ' : '';
        const type = d.type ? `(${d.type}) ` : '';
        lines.push(`   ${fx(`--${d.name}=<val>`)} : ${required}${type}${d.description}`);

        if (d.type === 'boolean')
        {
            lines.push(`   ${fx(`--${d.name}`)} : is the same as --${d.name}=true`);
        }
    }

    console.log(lines.join('\n'));
}
