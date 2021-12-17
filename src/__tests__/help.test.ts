import { IArgsConfig } from "../types";
import { printHelp } from "../definitions";

describe('help', () =>
{
    test('prints header', () =>
    {
        const config: IArgsConfig = {
            helpHeader: 'This is my header',
            disableMinusH: false,
            definitions: [
                { name: 'pos1', index: 0, description: 'comes first' },
                { name: 'pos2', index: 1, description: 'comes second' },
                { name: 'one', description: 'does great things' },
                { name: 'two', description: 'is required', required: true },
                { name: 'three', description: 'is an integer', type: 'int' },
                { name: 'flag', description: 'is a toggle flag, true is implied', type: 'boolean' },
            ]
        };
        process.argv = ['ts-node', 'script', 'other'];
        let logged = '';
        const logMock = jest.fn((s: string) => logged += s);
        console.log = logMock;
        printHelp(config);
        expect(logMock.mock.calls.length).toBeGreaterThanOrEqual(1);
        expect(logged).toContain('comes first');
        expect(logged).toContain('--help');
    });
    test('honour help flag', () =>
    {
        const config: IArgsConfig = {
            helpHeader: 'This is my header',
            disableMinusH: true,
            definitions: [
                { name: 'one', description: 'does great things' },
            ]
        };
        process.argv = ['ts-node', 'script', 'other'];
        let logged = '';
        const logMock = jest.fn((s: string) => logged += s);
        console.log = logMock;
        printHelp(config);
        expect(logged).not.toContain('--help');
    });
});
