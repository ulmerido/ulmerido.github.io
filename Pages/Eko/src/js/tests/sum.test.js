const tests = require('./tests');
const func = tests.sum;
const ipex = tests.ipex;
test('adds 1 + 2 to equal 3', () => {
    expect(func(1, 2)).toBe(3);
});

/*test('the data is peanut butter', () => {
    return ipex.getIP().then(data => {
        expect(data).toBe('peanut butter');
    });
});*/

