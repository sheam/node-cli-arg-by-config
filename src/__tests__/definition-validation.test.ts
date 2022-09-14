import { IArgDef } from "../types";
import { validateArgDefinitions } from "../definitions";

const sampleNumberFactory = (x: string): number => parseInt(x);

describe('definition validation', () =>
{
    describe('validate positional arguments', () =>
    {
        it('validates when sequence correct', () =>
        {
            const defs: IArgDef<any>[] = [
                { name: 'pos1', index: 0, type: 'string' },
                { name: 'opt1', type: 'string' },
                { name: 'pos2', index: 1, type: 'string' },
            ];

            validateArgDefinitions({ definitions: defs });
        });
        it('index values must be sequential', () =>
        {
            const defs: IArgDef<any>[] = [
                { name: 'pos1', index: 0, type: 'string' },
                { name: 'opt1', type: 'string' },
                { name: 'pos2', index: 2, type: 'string' },
            ];

            const expectedError = "Definition for argument 'pos2' has an invalid index value (2). Should it be 1?";
            expect(() => validateArgDefinitions({ definitions: defs })).toThrow(expectedError);
        });
        it('should fail if non-last-positional argument is optional', () =>
        {
            const defs: IArgDef<any>[] = [
                { name: 'pos1', index: 0, type: 'string', required: false },
                { name: 'opt1', type: 'string' },
                { name: 'pos2', index: 1, type: 'string' },
            ];

            const expectedError = "Definition for argument 'pos1' has an invalid value (false) for 'required'. Only the last indexed argument can be optional.";
            expect(() => validateArgDefinitions({ definitions: defs })).toThrow(expectedError);
        });
        it('only last positional can be marked false', () =>
        {
            const defs: IArgDef<any>[] = [
                { name: 'pos1', index: 0, type: 'string' },
                { name: 'opt1', type: 'string' },
                { name: 'pos2', index: 1, type: 'string', required: false },
            ];

            expect(() => validateArgDefinitions({ definitions: defs })).not.toThrow();
        });
    });
    describe('exactly 1 of type or factory must be supplied', () =>
    {
        it('type supplied', () =>
        {

            const defs: IArgDef<any>[] = [
                { name: 'arg1', type: 'int' },
            ];

            validateArgDefinitions({ definitions: defs });
        });
        it('factory supplied', () =>
        {

            const defs: IArgDef<any>[] = [
                { name: 'arg2', factory: sampleNumberFactory },
            ];

            validateArgDefinitions({ definitions: defs });
            expect(() => validateArgDefinitions({ definitions: defs })).not.toThrow();
        });
        it('must not specify both', () =>
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
        it('duplicate arg', () =>
        {
            const defs: IArgDef<any>[] = [
                { name: 'arg1' },
                { name: 'arg2', },
                { name: 'arg1', index: 0 },
            ];

            const expectedError = "There is more than one definition specified for 'arg1'.";
            expect(() => validateArgDefinitions({ definitions: defs })).toThrow(expectedError);
        });
        it('duplicate help', () =>
        {
            const defs: IArgDef<any>[] = [
                { name: 'help' }
            ];

            const expectedError = "There is more than one definition specified for 'help'.";
            expect(() => validateArgDefinitions({ definitions: defs })).toThrow(expectedError);
        });
        it('duplicate help avoided', () =>
        {
            const defs: IArgDef<any>[] = [
                { name: 'help' }
            ];

            expect(() => validateArgDefinitions({ disableMinusH: true, definitions: defs })).not.toThrow();
        });
    });
});
