const {calculateTip, fahrenheitToCelcius, celciusToFahrenheit, add} = require('./math')

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

// test('Async test demo', (done) => {
//     setTimeout(() => {
//         expect(1).toBe(2)
//         done()
//     }, 2000);
// })

test('Should add two numbers', (done) => {
    add(2, 3).then(sum => {
        expect(sum).toBe(5)
        done()
    })
})

test('Should add two numbers async/await', async () => {
    const actual = await add(2, 3)
    const expected = 5
    expect(actual).toBe(expected)
})

test('Should return error message with negative numbers', (done) => {
    const expected = 'Numbers must be non-negative'
    add(3, -4).catch(e => {
        expect(e).toBe(expected)
        done()
    })
})

test('Should return error message with negative numbers async/await', async () => {
    const expected = 'Numbers must be non-negative'
    await expect(add(3, -4)).rejects.toBe(expected)
})