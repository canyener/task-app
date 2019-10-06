const calculateTip = (total, tipPercent = .25) => total + (total * tipPercent)

const fahrenheitToCelcius = (temp) => (temp - 32) / 1.8

const celciusToFahrenheit = (temp) => (temp * 1.8) + 32

module.exports = {
    calculateTip,
    fahrenheitToCelcius,
    celciusToFahrenheit
}