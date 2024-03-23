// This file contains the utility functions used in the application.

const alignExponent = (inputOp1, inputOp2) => {
    const { op1, op2 } = JSON.parse(JSON.stringify({ op1: inputOp1, op2: inputOp2 })) // Deep copy

    op1.integer = 1
    op2.integer = 1

    let diff = Math.abs(op1.exponent - op2.exponent)

    if (op1.exponent < op2.exponent) {
        op1.mantissa = shift(op1.mantissa, diff, op1.mantissa.length, op1.integer)
        op1.exponent = op2.exponent
        op1.integer = 0
    } else if (op1.exponent > op2.exponent) {
        op2.mantissa = shift(op2.mantissa, diff, op2.mantissa.length, op2.integer)
        op2.exponent = op1.exponent
        op2.integer = 0
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

const shift = (str, offset, len, int) => {
    offset = Math.min(offset, len)
    let str_shift = ''
    for (let i = 0; i < offset; i++) {
        if (i + 1 === offset) {
            str_shift += int
            continue
        }
        str_shift += '0'
    }
    str_shift += str.substring(0, len - offset)

    return str_shift
}

const mantissaBinaryToDecimal = (mantissa) => { // 1010101
    let decimal = 0
    for (let i = 0; i < mantissa.length; i++) {
        const power = -(i + 1)
        const bit = mantissa[i]

        if (bit === '1') { // Comparison corrected here
            decimal += Math.pow(2, power)
        }
    }

    return decimal
}

const decimalToBinary = (decimalPart, precision) => {
    let binary = ''
    while (precision > 0) {
        decimalPart *= 2
        if (decimalPart >= 1) {
            binary += '1'
            decimalPart -= 1
        } else {
            binary += '0'
        }
        precision--
    }
    return binary
}

const useGRS = (operand, digitsSupported) => {

    let opPartition = operand.magnitude.split('.')
    let mantissa = opPartition[1]

    digitsSupported = digitsSupported - 1 // remove LHS of binary point in counting

    let binary = ''
    let stickyBit = '0'

    if (mantissa.length < digitsSupported + 3) {
        binary = mantissa.padEnd(digitsSupported + 3, '0') // append GRS
    } else {
        for (let i = 0; i < mantissa.length; i++) {
            if (i < digitsSupported + 2) { // copy mantissa + RS
                binary = binary + mantissa[i]
            } else { // determine sticky bit
                if (mantissa[i] === '1') {
                    stickyBit = '1'
                    break
                }
            }
        }
        binary = binary + stickyBit // append sticky bit
    }
    binary = opPartition[0] + '.' + binary // recover magnitude w/ GRS

    return {
        result: {
            sign: operand.sign,
            exponent: operand.exponent,
            magnitude: binary
        }
    }
}

const addOperands = (op1, op2) => {

    let op1Partition = op1.magnitude.split('.')
    let op2Partition = op2.magnitude.split('.')


    // binary to decimal
    let value1mantissa = mantissaBinaryToDecimal(op1Partition[1])
    let value2mantissa = mantissaBinaryToDecimal(op2Partition[1])

    let initialMantissa = 0
    let exponent = op1.exponent
    let sign = 0

    // addition
    if (op1.sign === op2.sign) {
        initialMantissa = value1mantissa + value2mantissa
        sign = op1.sign && op2.sign
    } else {
        if (value1mantissa > value2mantissa) {
            initialMantissa = value1mantissa - value2mantissa
            sign = op1.sign
        } else if (value1mantissa < value2mantissa) {
            initialMantissa = value2mantissa - value1mantissa
            sign = op2.sign
        } else { // Subtraction
            initialMantissa = value1mantissa - value2mantissa
            sign = 0
        }
    }

    //wholeNumber.toString(2); // convert to binary

    let wholeNumberPart = (parseInt(op1Partition[0]) + parseInt(op2Partition[0])).toString(2)
    let lengthOfInitialMantissa = String(initialMantissa)
    initialMantissa = decimalToBinary(initialMantissa, lengthOfInitialMantissa.length)
    let initialSum = wholeNumberPart + '.' + initialMantissa

    //initialSum = decimalToBinary(initialSum) // 2 . 242412

    return {
        result: {
            sign: sign,
            exponent: exponent,
            magnitude: initialSum
        }
    }
}

const normalizeSum = (rawSum) => {
    let rawMagnitude = rawSum.magnitude
    const posDecimal = rawMagnitude.indexOf('.')
    const pos1 = rawMagnitude.indexOf('1')
    let offset = 0

    if (pos1 > posDecimal) {
        offset = posDecimal - pos1
    } else if (pos1 < posDecimal) {
        offset = posDecimal - pos1 - 1
        rawMagnitude = rawMagnitude.substring(0, posDecimal) + rawMagnitude.substring(posDecimal + 1)
    }

    let remainingMagnitude = rawMagnitude.substring(pos1 + 1)

    let formattedMagnitude = '1.' + remainingMagnitude

    while (formattedMagnitude.length < rawSum.magnitude.length) {
        formattedMagnitude = formattedMagnitude + '0'
    }

    const normalizedSum = {
        sign: rawSum.sign,
        exponent: rawSum.exponent + offset,
        magnitude: formattedMagnitude
    }

    return normalizedSum
}

const RoundRTNTE = (input, maxDigits) => {

    let magnitudeInput = input.magnitude

    while (magnitudeInput.length < maxDigits + 1) {
        magnitudeInput = magnitudeInput + '0'
    }

    if (magnitudeInput.length == maxDigits + 1) {
        return {
            sign: input.sign,
            exponent: input.exponent,
            magnitude: magnitudeInput
        }
    } else {
        let magnitudeBody = magnitudeInput.substring(0, maxDigits + 1)
        const magnitudeRound = magnitudeInput.substring(maxDigits + 1)
        const round1st = magnitudeRound[0]
        const roundOthers = magnitudeRound.substring(1)

        switch (round1st) {
            case '0':
                //keep as is
                break
            case '1':
                if (roundOthers.indexOf('1') != -1) {
                    let last0 = magnitudeBody.lastIndexOf('0')

                    if (last0 != -1) {
                        let after0 = ''
                        let remainingDigits = magnitudeBody.substring(last0 + 1).length

                        for (let i = 0; i < remainingDigits; i++) {
                            after0 = after0 + '0'
                        }
                        magnitudeBody = magnitudeBody.substring(0, last0) + '1' + after0
                    } else {
                        throw new Error('Exception - overflow when attempting RTNTE')
                    }
                } else {
                    if (magnitudeBody[magnitudeBody.length - 1] === 0) {
                        return {
                            sign: input.sign,
                            exponent: input.exponent,
                            magnitude: magnitudeBody
                        }
                    } else {
                        let last0 = magnitudeBody.lastIndexOf('0')

                        if (last0 != -1) {
                            let after0 = ''
                            let remainingDigits = magnitudeBody.substring(last0 + 1).length

                            for (let i = 0; i < remainingDigits; i++) {
                                after0 = after0 + '0'
                            }
                            magnitudeBody = magnitudeBody.substring(0, last0) + '1' + after0
                        } else {
                            throw new Error('Exception - overflow when attempting RTNTE')
                        }
                    }
                }

        }

        const roundedInput = {
            sign: input.sign,
            exponent: input.exponent,
            magnitude: magnitudeBody
        }

        return roundedInput
    }
}

export { alignExponent, addOperands, useGRS, normalizeSum, RoundRTNTE }


//NOTES-------------------------------------

// for round to nearest - ties to even:
// 1. Substring slice the magnitude into two strings: magnitudeBody and remainingMagnitude
//  - magnitudeBody is the string up until the max no. of digits
//  - remainingMagnitude is the rest of the string

// 2. process the remainingMagnitude string accordingly
// 000 - do nothing
// 001 - round down
// 010 - round down
// 011 - round down
// 100 - ties to even
// 101 - round up
// 110 - round up
// 111 - round up

// 3. look for the first zero starting at the tail end of magnitudeBody (if no 0 found, skip to 4)
// do nothing or round down - leave as is
// round up - change to 1, change all 1's after it (if any) to 0
// ties to even - if the tail of magnitudeBody is 0, leave as is; if 1, look for the first 0 from the tail and round up

// 4. CASE FOR NO ZERO (all 1's)
// do nothing or round down - leave as is
// round up or ties to even - overflow exception

// 5. DONE, magnitudeBody is now rounded!

// ex. RTN-TE 0.100101 to 5 digits
// - body = 0.1001, remaining = 01


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

// pls output as an array/object
// - initial sum (not yet normalized/rounded)
// - normalized
// - rounded
