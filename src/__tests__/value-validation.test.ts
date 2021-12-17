import { forTesting } from "../processing";
const { getValidValue } = forTesting;

describe('value validation', () =>
{
    const betweenOneAnd10Err = 'must be between 1 and 10'
    function betweenOneAnd10(n: number)
    {
        if (n < 1 || n > 10)
        {
            return betweenOneAnd10Err;
        }
        return null;
    }
    test('number passes validation', () =>
    {
        const val = getValidValue('9', { name: 'num', type: 'int', validator: betweenOneAnd10 });
        expect(val).toBe(9);
    });
    test('number fails validation', () =>
    {
        expect(() => getValidValue('19', { name: 'num', type: 'int', validator: betweenOneAnd10 })).toThrow(betweenOneAnd10Err);
    });
});