import { IArgDef } from "../types";
import { validateArgDefinitions } from "../definitions";

const sampleNumberFactory = (x: string): number => parseInt(x);

describe('definition validation', () =>
{
    describe('validate positional arguments', () =>
    {
        test('validates when sequence correct', () =>
        {
            const defs: IArgDef<any>[] = [
                { name: 'pos1', index: 0, type: 'string' },
                { name: 'opt1', type: 'string' },
                { name: 'pos2', index: 1, type: 'string' },
            ];

            validateArgDefinitions({ definitions: defs });
        });
        test('index values must be sequential', () =>
        {
            const defs: IArgDef<any>[] = [
                { name: 'pos1', index: 0, type: 'string' },
                { name: 'opt1', type: 'string' },
                { name: 'pos2', index: 2, type: 'string' },
            ];

            const expectedError = "Definition for argument 'pos2' has an invalid index value (2). Should it be 1?";
            expect(() => validateArgDefinitions({ definitions: defs })).toThrow(expectedError);
        });
        test('should not be marked as optional', () =>
        {
            const defs: IArgDef<any>[] = [
                { name: 'pos1', index: 0, type: 'string' },
                { name: 'opt1', type: 'string' },
                { name: 'pos2', index: 1, type: 'string', required: false },
            ];

            const expectedError = "Definition for argument 'pos2' has an invalid value (false) for 'required'. Positional arguments are always required.";
            expect(() => validateArgDefinitions({ definitions: defs })).toThrow(expectedError);
        });
    });
    describe('exactly 1 of type or factory must be supplied', () =>
    {
        test('type supplied', () =>
        {

            const defs: IArgDef<any>[] = [
                { name: 'arg1', type: 'int' },
            ];

            validateArgDefinitions({ definitions: defs });
        });
        test('factory supplied', () =>
        {

            const defs: IArgDef<any>[] = [
                { name: 'arg2', factory: sampleNumberFactory },
            ];

            validateArgDefinitions({ definitions: defs });
            expect(() => validateArgDefinitions({ definitions: defs })).not.toThrow();
        });
        test('must not specify both', () =>
        {

            const defs: IArgDef<any>[] = [
                { name: 'arg1', type: 'string', factory: sampleNumberFactory }
            ];

            const expectedError = `Definition for argument 'arg1' must not have both 'type' and 'factory' specified.`;
            expect(() => validateArgDefinitions({ definitions: defs })).toThrow(expectedError);
        });
    });
    describe('one one of each name', () =>
    {
        test('duplicate arg', () =>
        {
            const defs: IArgDef<any>[] = [
                { name: 'arg1' },
                { name: 'arg2', },
                { name: 'arg1', index: 0 },
            ];

            const expectedError = "There is more than one definition specified for 'arg1'.";
            expect(() => validateArgDefinitions({ definitions: defs })).toThrow(expectedError);
        });
        test('duplicate help', () =>
        {
            const defs: IArgDef<any>[] = [
                { name: 'help' }
            ];

            const expectedError = "There is more than one definition specified for 'help'.";
            expect(() => validateArgDefinitions({ definitions: defs })).toThrow(expectedError);
        });
        test('duplicate help avoided', () =>
        {
            const defs: IArgDef<any>[] = [
                { name: 'help' }
            ];

            expect(() => validateArgDefinitions({ disableMinusH: true, definitions: defs })).not.toThrow();
        });
    });
});