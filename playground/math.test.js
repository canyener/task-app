const {calculateTip, fahrenheitToCelcius, celciusToFahrenheit} = require('./math')

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

test('Should convert 32 F to 0 C', () => {
    const expected = 0
    const actual = fahrenheitToCelcius(32)
    expect(actual).toBe(expected)
})

test('Should convert 0 C to 32 F', () => {
    const expected = 32
    const actual = celciusToFahrenheit(0)
    expect(actual).toBe(expected)
})