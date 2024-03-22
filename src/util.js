// This file contains the utility functions used in the application.

const alignExponent = (inputOp1, inputOp2) => {
    const { op1, op2 } = JSON.parse(JSON.stringify({ op1: inputOp1, op2: inputOp2 })) // Deep copy

    // Special Case: Exponents are equal, don't normalize
    if (op1.exponent === op2.exponent) {
        return {
            op1: {
                sign: op1.sign,
                exponent: op1.exponent,
                magnitude: '1.' + op1.mantissa
            },
            op2: {
                sign: op2.sign,
                exponent: op2.exponent,
                magnitude: '1.' + op2.mantissa
            }
        }
    }

    // Initialize base integer to 1 for both operands
    op1.integer = 1
    op2.integer = 1

    // Normalize op1
    if (op1.mantissa != 0) {
        while (op1.mantissa[0] === '0' && op1.mantissa.length > 1) {
            op1.mantissa = op1.mantissa.slice(1) + '0'
            op1.exponent--
        }
    }

    // Normalize op2
    if (op2.mantissa != 0) {
        while (op2.mantissa[0] === '0' && op2.mantissa.length > 1) {
            op2.mantissa = op2.mantissa.slice(1) + '0'
            op2.exponent--
        }
    }

    // Adjust exponents to be equal
    while (op1.exponent < op2.exponent) {
        op1.mantissa = '0' + op1.mantissa.slice(0, -1)
        op1.exponent++
    }
    while (op2.exponent < op1.exponent) {
        op2.mantissa = '0' + op2.mantissa.slice(0, -1)
        op2.exponent++
    }

    const op1Exp = Math.abs(inputOp1.exponent) // Taking absolute value
    const op2Exp = Math.abs(inputOp2.exponent) // Taking absolute value

    if (op1Exp > op2Exp && op1.mantissa[0] === '0') {
        op1.integer = 0
    } else if (op1Exp < op2Exp && op2.mantissa[0] === '0') {
        op2.integer = 0
    }

    // Special Case: if op1.mantissa === 0 || op2.mantissa === 0
    let diff = Math.abs(op1.exponent - op2.exponent)
    if (op1.mantissa == 0) {
        op1.mantissa = op1.mantissa.substring(0, diff - 1) + '1' + op1.mantissa.substring(diff)
    }
    if (op2.mantissa == 0) {
        op2.mantissa = op2.mantissa.substring(0, diff - 1) + '1' + op2.mantissa.substring(diff)
    }

    op1.magnitude = op1.integer + '.' + op1.mantissa
    op2.magnitude = op2.integer + '.' + op2.mantissa

    return {
        op1: {
            sign: op1.sign,
            exponent: op1.exponent,
            magnitude: op1.magnitude
        },
        op2: {
            sign: op2.sign,
            exponent: op2.exponent,
            magnitude: op2.magnitude
        }
    }
}
const mantissaBinaryToDecimal = (mantissa) => {
    let total = 0
    for (let i = 0; i < mantissa.length; i++) {
        const power = -(i + 1)
        const bit = mantissa[i]

        if (bit === 1) {
            total += Math.power(2, power)
        }
    }

    return total
}

const addOperands = (op1, op2) => {}

export { alignExponent, addOperands }




// op1: {
//     sign: 0,
//     exponent: op1.exponent,
//     magnitude: 1.10101
// },
// op2: {
//     sign: 1,
//     exponent: op2.exponent,
//     magnitude: 0.01100
// }

// 1.10101 - 0.01100 = result & sign of 1.10101
// 
// If sign = same, then add normally and copy the sign
// If sign = different, then subtract smaller magnitude from bigger magnitude and copy sign of bigger

//+5 + -3 = 5-3, 2

// +1.0110 x 10^5
// op1: {
//     sign: 0,
//     exponent: 5,
//     magnitude: 1.0110
// },