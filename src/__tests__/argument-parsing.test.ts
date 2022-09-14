import { IArgDef } from "../types";
import { forTesting } from "../processing";

const { getTypedValue, getFactoryValue, getNamedArgVal, getArgs } = forTesting;

const sampleNumberFactory = (x: string): number => parseInt(x);

describe('argument parsing', () =>
{
    describe('typed parsing', () =>
    {
        it('valid string', () =>
        {
            const result = getTypedValue('one', { name: 'arg1', type: 'string' });
            expect(result).toBe('one');
        });
        it('valid int', () =>
        {
            const result = getTypedValue('11', { name: 'arg1', type: 'int' });
            expect(result).toBe(11);
        });
        it('invalid int', () =>
        {
            expect(() => getTypedValue('eleven', { name: 'arg1', type: 'int' })).toThrow("Unable to convert argument arg1 with value 'eleven' into a value of type int");
        });
        it('valid float', () =>
        {
            const result = getTypedValue('11.1', { name: 'arg1', type: 'float' });
            expect(result).toBe(11.1);
        });
        it('invalid float', () =>
        {
            expect(() => getTypedValue('eleven point one', { name: 'arg1', type: 'float' })).toThrow("Unable to convert argument arg1 with value 'eleven point one' into a value of type float");
        });
        it('valid implied boolean', () =>
        {
            const result = getTypedValue('', { name: 'arg1', type: 'boolean' });
            expect(result).toBe(true);
        });
        it('valid true boolean', () =>
        {
            const result = getTypedValue('true', { name: 'arg1', type: 'boolean' });
            expect(result).toBe(true);
        });
        it('valid false boolean', () =>
        {
            const result = getTypedValue('false', { name: 'arg1', type: 'boolean' });
            expect(result).toBe(false);
        });
        it('invalid boolean', () =>
        {
            expect(() => getTypedValue('other', { name: 'arg1', type: 'boolean' })).toThrow("Unable to convert argument arg1 with value 'other' into a value of type boolean");
        });
        it('invalid float', () =>
        {
            expect(() => getTypedValue('eleven point one', { name: 'arg1', type: 'float' })).toThrow("Unable to convert argument arg1 with value 'eleven point one' into a value of type float");
        });
    });
    describe('factory parsing', () =>
    {
        it('valid int', () =>
        {
            const result = getFactoryValue('11', { name: 'arg1', factory: sampleNumberFactory });
            expect(result).toBe(11);
        });
        it('invalid int', () =>
        {
            expect(() => getFactoryValue('eleven', { name: 'arg1', factory: sampleNumberFactory })).toThrow('');
        });
    });
    describe('positional arguments', () =>
    {
        it('get correct string values', () =>
        {
            interface IArgs
            {
                one: string;
                two: string;
                three: string;
            }

            const argDefs: IArgDef<any>[] = [
                { name: 'three', index: 2 },
                { name: 'one', index: 0 },
                { name: 'two', index: 1 },
            ];
            process.argv = [
                'ts-node',
                'my-script',
                '111',
                '222',
                '333',
            ];
            const result = getArgs<IArgs>({ definitions: argDefs });
            expect(result).not.toBeNull();
            if (result)
            {
                expect(result.one).toBe('111');
                expect(result.two).toBe('222');
                expect(result.three).toBe('333');
            }
        });
        it('get correct int values', () =>
        {
            interface IArgs
            {
                one: string;
                two: string;
                three: string;
            }

            const argDefs: IArgDef<any>[] = [
                { name: 'three', index: 2, type: 'int' },
                { name: 'one', index: 0, type: 'int' },
                { name: 'two', index: 1, type: 'int' },
            ];
            process.argv = [
                'ts-node',
                'my-script',
                '111',
                '222',
                '333',
            ];
            const result = getArgs<IArgs>({ definitions: argDefs });
            expect(result).not.toBeNull();
            if (result)
            {
                expect(result.one).toBe(111);
                expect(result.two).toBe(222);
                expect(result.three).toBe(333);
            }
        });
        it('throw if value missing', () =>
        {
            interface IArgs
            {
                one: string;
                two: string;
                three: string;
            }

            const argDefs: IArgDef<any>[] = [
                { name: 'three', index: 2 },
                { name: 'one', index: 0 },
                { name: 'two', index: 1 },
            ];
            process.argv = [
                'ts-node',
                'my-script',
                '111',
                '222',
            ];
            expect(() => getArgs<IArgs>({ definitions: argDefs })).toThrow("'three' at position 3 is missing a value")
        });
        it('get positional with named', () =>
        {
            interface IArgs
            {
                pos1: string;
                pos2: string;
                named: string;
            }

            const argDefs: IArgDef<any>[] = [
                { name: 'pos2', index: 1 },
                { name: 'named' },
                { name: 'pos1', index: 0 },
            ];
            process.argv = [
                'ts-node',
                'my-script',
                '111',
                '222',
                '--named=aName',
            ];
            const result = getArgs<IArgs>({ definitions: argDefs });
            expect(result).not.toBeNull();
            if (result)
            {
                expect(result.pos1).toBe('111');
                expect(result.pos2).toBe('222');
                expect(result.named).toBe('aName')
            }
        });
        it('get positional with named and optional present', () =>
        {
            interface IArgs
            {
                pos1: string;
                pos2?: string;
                named: string;
            }

            const argDefs: IArgDef<any>[] = [
                { name: 'pos2', index: 1, required: false },
                { name: 'named' },
                { name: 'pos1', index: 0 },
            ];
            process.argv = [
                'ts-node',
                'my-script',
                '111',
                '222',
                '--named=aName',
            ];
            const result = getArgs<IArgs>({ definitions: argDefs });
            expect(result).not.toBeNull();
            if (result)
            {
                expect(result.pos1).toBe('111');
                expect(result.pos2).toBe('222');
                expect(result.named).toBe('aName')
            }
        });
        it('get positional with named and optional missing', () =>
        {
            interface IArgs
            {
                pos1: string;
                pos2?: string;
                named: string;
            }

            const argDefs: IArgDef<any>[] = [
                { name: 'pos2', index: 1, required: false },
                { name: 'named' },
                { name: 'pos1', index: 0 },
            ];
            process.argv = [
                'ts-node',
                'my-script',
                '111',
                '--named=aName',
            ];
            const result = getArgs<IArgs>({ definitions: argDefs });
            expect(result).not.toBeNull();
            if (result)
            {
                expect(result.pos1).toBe('111');
                expect(result.pos2).toBeUndefined();
                expect(result.named).toBe('aName')
            }
        });
        it('with optional last positional argument', () =>
        {
            interface IArgs
            {
                one: string;
                two: string;
                three?: string;
            }

            const argDefs: IArgDef<any>[] = [
                { name: 'three', index: 2, required: false },
                { name: 'one', index: 0 },
                { name: 'two', index: 1 },
            ];
            process.argv = [
                'ts-node',
                'my-script',
                '111',
                '222',
            ];
            const result = getArgs<IArgs>({ definitions: argDefs });
            expect(result).not.toBeNull();
            if (result)
            {
                expect(result.one).toBe('111');
                expect(result.two).toBe('222');
                expect(result.three).toBeUndefined();
            }
        });
        it('one optional positional and named', () =>
        {
            interface IArgs
            {
                pos1?: string;
                named1?: string;
                named2?: string;
            }

            const argDefs: IArgDef<any>[] = [
                { name: 'pos1', index: 0, required: false },
                { name: 'named1' },
                { name: 'named2' },
            ];
            process.argv = [
                'ts-node',
                'my-script',
                '111',
                '--named1=222',
            ];
            const result = getArgs<IArgs>({ definitions: argDefs });
            expect(result).not.toBeNull();
            if (result)
            {
                expect(result.pos1).toBe('111');
                expect(result.named1).toBe('222');
                expect(result.named2).toBeUndefined();
            }
        });
    });
    describe('named arguments', () =>
    {
        it('get named value', () =>
        {
            const argDefs: IArgDef<any>[] = [
                { name: 'arg1' },
                { name: 'arg2' },
            ];
            const result = getNamedArgVal('--arg1=111', argDefs);
            expect(result).not.toBeNull();
            expect(result.name).toBe('arg1');
            expect(result.strVal).toBe('111');
            expect(result.def?.name).toBe('arg1');
        });
        it('get named value with no definition', () =>
        {
            const argDefs: IArgDef<any>[] = [
                { name: 'arg1' },
                { name: 'arg2' },
            ];
            expect(() => getNamedArgVal('--arg3=333', argDefs)).toThrow("Could not find a definition for argument '--arg3=333' with name 'arg3' and value '333'");
        });
        it('required missing', () =>
        {
            const argDefs: IArgDef<any>[] = [
                { name: 'arg1', required: true },
                { name: 'arg2' },
            ];
            process.argv = ['ts-node', 'script', '--arg2=222'];
            expect(() => getArgs({ definitions: argDefs })).toThrow("'arg1' is required, but no value was specified for it.");
        });
        it('get correct string values', () =>
        {
            interface IArgs
            {
                one: string;
                two: string;
                three: string;
            }

            const argDefs: IArgDef<any>[] = [
                { name: 'three' },
                { name: 'one' },
                { name: 'two' },
            ];
            process.argv = [
                'ts-node',
                'my-script',
                '--one=111',
                '--two=222',
                '--three=333',
            ];
            const result = getArgs<IArgs>({ definitions: argDefs });
            expect(result).not.toBeNull();
            if (result)
            {
                expect(result.one).toBe('111');
                expect(result.two).toBe('222');
                expect(result.three).toBe('333');
            }
        });
        it('get correct int values', () =>
        {
            interface IArgs
            {
                one: string;
                three: string;
            }

            const argDefs: IArgDef<any>[] = [
                { name: 'three', type: 'int' },
                { name: 'one', type: 'int' }
            ];
            process.argv = [
                'ts-node',
                'my-script',
                '--one=111',
                '--three=333',
            ];
            const result = getArgs<IArgs>({ definitions: argDefs });
            expect(result).not.toBeNull();
            if (result)
            {
                expect(result.one).toBe(111);
                expect(result.three).toBe(333);
            }
        });
        it('get correct mixed values', () =>
        {
            interface IArgs
            {
                one: string;
                three: number;
            }

            const argDefs: IArgDef<any>[] = [
                { name: 'three', type: 'int' },
                { name: 'one', type: 'string' }
            ];
            process.argv = [
                'ts-node',
                'my-script',
                '--one=ONE',
                '--three=333',
            ];
            const result = getArgs<IArgs>({ definitions: argDefs });
            expect(result).not.toBeNull();
            if (result)
            {
                expect(result.one).toBe('ONE');
                expect(result.three).toBe(333);
            }
        });

        it('get correct boolean value (true)', () =>
        {
            interface IArgs
            {
                one?: string;
                flag: boolean;
            }

            const argDefs: IArgDef<any>[] = [
                { name: 'one' },
                { name: 'flag', type: 'boolean' }
            ];

            process.argv = [
                'ts-node',
                'my-script',
                '--one=testingstring',
                '--flag=true'
            ];

            const result = getArgs<IArgs>({ definitions: argDefs });
            expect(result).not.toBeNull();
            if (result)
            {
                expect(result.flag).toBe(true);
            }
        });

        it('get correct boolean value (false)', () =>
        {
            interface IArgs
            {
                one?: string;
                flag: boolean;
            }

            const argDefs: IArgDef<any>[] = [
                { name: 'one' },
                { name: 'flag', type: 'boolean' }
            ];

            process.argv = [
                'ts-node',
                'my-script',
                '--one=testingstring',
                '--flag=false'
            ];

            const result = getArgs<IArgs>({ definitions: argDefs });
            expect(result).not.toBeNull();
            if (result)
            {
                expect(result.flag).toBe(false);
            }
        });

        it('get correct boolean value (undefined)', () =>
        {
            interface IArgs
            {
                one?: string;
                flag: boolean;
            }

            const argDefs: IArgDef<any>[] = [
                { name: 'one' },
                { name: 'flag', type: 'boolean' }
            ];

            process.argv = [
                'ts-node',
                'my-script',
                '--one=testingstring',
            ];

            const result = getArgs<IArgs>({ definitions: argDefs });
            expect(result).not.toBeNull();
            if (result)
            {
                expect(result.flag).toBeUndefined();
            }
        });

        it('get correct boolean value (true without flag)', () =>
        {
            interface IArgs
            {
                one?: string;
                flag: boolean;
            }

            const argDefs: IArgDef<any>[] = [
                { name: 'one' },
                { name: 'flag', type: 'boolean' }
            ];

            process.argv = [
                'ts-node',
                'my-script',
                '--one=testingstring',
                "--flag"
            ];

            const result = getArgs<IArgs>({ definitions: argDefs });
            expect(result).not.toBeNull();
            if (result)
            {
                expect(result.flag).toBe(true);
            }
        });
    });
    describe('extra args', () =>
    {
        it('named arg', () =>
        {
            const argDefs: IArgDef<any>[] = [
                { name: 'arg1' },
                { name: 'arg2' },
            ];
            process.argv = ['ts-node', 'script', '--arg1=one', '--arg3=fail', '--arg2=222']
            expect(() => getArgs({ definitions: argDefs })).toThrow("Could not find a definition for argument '--arg3=fail' with name 'arg3' and value 'fail'");
        });
        it('named arg with valid positional', () =>
        {
            const argDefs: IArgDef<any>[] = [
                { name: 'arg1', index: 0 },
                { name: 'arg2', index: 1 },
            ];
            process.argv = ['ts-node', 'script', 'one', 'two', '--arg3=fail']
            expect(() => getArgs({ definitions: argDefs })).toThrow("Could not find a definition for argument '--arg3=fail' with name 'arg3' and value 'fail'");
        });
        it('positional', () =>
        {
            const argDefs: IArgDef<any>[] = [
                { name: 'arg1', index: 0 },
            ];
            process.argv = ['ts-node', 'script', 'one', 'two']
            expect(() => getArgs({ definitions: argDefs })).toThrow("'two' does not appear to be a valid named or positional argument");
        });
        it('positional with valid named', () =>
        {
            const argDefs: IArgDef<any>[] = [
                { name: 'arg1', index: 0 },
                { name: 'arg2' },
            ];
            process.argv = ['ts-node', 'script', 'one', '--arg2=two', 'badone']
            expect(() => getArgs({ definitions: argDefs })).toThrow("'badone' does not appear to be a valid named or positional argument");
        });
        it('named before positional', () =>
        {
            const argDefs: IArgDef<any>[] = [
                { name: 'arg1', index: 0 },
                { name: 'arg2' },
            ];
            process.argv = ['ts-node', 'script', '--arg2=two', 'one']
            expect(() => getArgs({ definitions: argDefs })).toThrow("'arg1' at position 1 is missing a value");
        });
    });
});
