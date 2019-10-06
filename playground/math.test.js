const {calculateTip} = require('./math')

test('Should calculate total with tip', () => {
    const expected = 13
    const actual = calculateTip(10, .3)
    expect(actual).toBe(expected)
})

test('Should calculate total with default tip, if tip not provided', () => {
    const expected = 12.5
    const actual = calculateTip(10)
    expect(actual).toBe(expected)
})