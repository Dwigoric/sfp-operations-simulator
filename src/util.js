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

const mantissaBinaryToDecimal = (mantissa) => { // 1010101
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

const decimalToBinary = (decimal) => {
    if (decimal === 0) {
        return '0'
    }

    let binary = ''
    while (decimal > 0) {
        binary = (decimal % 2) + binary
        decimal = Math.floor(decimal / 2)
    }

    return binary
}

// {X} get mantissa substring 1 . 11111
// {X} convert mantissa binary to decimal
// {X} add them
// {X} decimal add/sub
// {} convert sum to binary

// addition > normalization > round
const addOperands = (op1, op2) => {

    let op1Partition = op1.magnitude.split('.')
    let op2Partition = op2.magnitude.split('.')

    let value1 = parseInt(op1Partition[0]) + mantissaBinaryToDecimal(op1Partition[1])
    let value2 = parseInt(op2Partition[0]) + mantissaBinaryToDecimal(op2Partition[1])

    let sum = 0
    let exponent = op1.exponent
    let sign = 0

    // -5 + 1; 5 - 1 = 4; -4
    // 1 + -5; 5 - 1 = 4; -4
    // -5 + 5 = 0

    // Addition
    if (op1.sign === op2.sign) {
        sum = value1 + value2
        sign = op1.sign && op2.sign // any sign
    } else {
        if (value1 > value2) {
            sum = value1 - value2
            sign = op1.sign
        } else if (value1 < value2) {
            sum = value2 - value1
            sign = op2.sign
        } else { // Subtraction
            sum = value1 - value2
            sign = 0 // positive if equal
        }
    }

    sum = decimalToBinary(sum) // not normalized

    //Convert sum to binary
    return {
        sum: {
            sign: sign,
            exponent: exponent,
            magnitude: sum
        }
    }
}

const normalizeSum = (rawSum) => {
    let rawMagnitude = rawSum.magnitude;
    const posDecimal = rawMagnitude.indexOf('.');
    const pos1 = rawMagnitude.indexOf('1');
    let offset = 0;

    if(pos1>posDecimal){
        offset = posDecimal - pos1;
    }
    else if(pos1<posDecimal){
        offset = posDecimal - pos1 - 1;
        rawMagnitude = rawMagnitude.substring(0, posDecimal) + rawMagnitude.substring(posDecimal+1);
    }

    let remainingMagnitude = rawMagnitude.substring(pos1 + 1);

    let formattedMagnitude = "1." + remainingMagnitude;

    while(formattedMagnitude.length < rawSum.magnitude.length){
        formattedMagnitude = formattedMagnitude + "0"
    }

    const normalizedSum = {
        sign: rawSum.sign,
        exponent: rawSum.exponent + offset,
        magnitude: formattedMagnitude
    }

    return normalizedSum;
}

export { alignExponent, addOperands }



//NOTES-------------------------------------

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

// -5 + 3 =
//+5 + -3 = 5-3, 2

// +1.0110 x 10^5
// op1: {
//     sign: (int),
//     exponent: (int),
//     magnitude: (string)
// },

// 1. convert magnitude into string (actually alr done)
// 2. detect the position of the decimal point
// 3. detect the position of the first 1

// 4. calculate offset
// ex. 0.010                    left = bigger offset, right = smaller offset
//  posDecimal = 1
//  pos1 = 3
//  if pos1 > posDecimal, offset = posDecimal - pos1 = 1 - 3 = -2
// ex2. 100.0
//  posDecimal = 3
//  pos1 = 0
//  if pos1 < posDecimal, offset = posDecimal - pos1 - 1 = 3 - 0 - 1 = +2

// 5. save all characters after the first 1 in a remainingMagnitude string

// 6. reformat string into "1." concatenated with remainingMagnitude, save in a formattedMagnitude string
// 7. compare length of new string with original, and if it's shorter, concatenate 0s until it matches the length

// 8. DONE, formattedMagnitude should be normalized (use offset to adjust exponent field after, and replace magnitude field obviously)
// ex. 0.0110
//  posDecimal = 1, pos1 = 3
//  since pos1 > posDecimal, offset = posDecimal - pos1 = 1 - 3 = -2
//  remainingMagnitude = "10"
//  formattedMagnitude = "1.10", but since its length is 2 while original is 4, add two "0"s
//  formattedMagnitude = "1.1000" with an offset of -2
//  Done