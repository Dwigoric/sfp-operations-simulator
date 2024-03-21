// This file contains the utility functions used in the application.

const alignExponent = (inputOp1, inputOp2) => {
    const { op1, op2 } = JSON.parse(JSON.stringify({ op1: inputOp2, op2: inputOp2 })) // Deep copy

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
        };
    }

    // Initialize base integer to 1 for both operands
    op1.integer = 1;
    op2.integer = 1;

    // Normalize op1
    if (op1.mantissa != 0) {
        while (op1.mantissa[0] === '0' && op1.mantissa.length > 1) {
            op1.mantissa = op1.mantissa.slice(1) + '0';
            op1.exponent--;
        }
    }

    // Normalize op2
    if (op2.mantissa != 0) {
        while (op2.mantissa[0] === '0' && op2.mantissa.length > 1) {
            op2.mantissa = op2.mantissa.slice(1) + '0';
            op2.exponent--;
        }
    }

    // Adjust exponents to be equal
    while (op1.exponent < op2.exponent) {
        op1.mantissa = '0' + op1.mantissa.slice(0, -1);
        op1.exponent++;
    }
    while (op2.exponent < op1.exponent) {
        op2.mantissa = '0' + op2.mantissa.slice(0, -1);
        op2.exponent++;
    }

    const op1Exp = Math.abs(inputOp1.exponent); // Taking absolute value
    const op2Exp = Math.abs(inputOp2.exponent); // Taking absolute value

    if (op1Exp > op2Exp && op1.mantissa[0] === '0') {
        op1.integer = 0;
    } else if (op1Exp < op2Exp && op2.mantissa[0] === '0') {
        op2.integer = 0;
    }

    // Special Case: if op1.mantissa === 0 || op2.mantissa === 0
    let diff = Math.abs(op1.exponent - op2.exponent);
    if (op1.mantissa == 0) {
        op1.mantissa = op1.mantissa.substring(0, diff - 1) + '1' + op1.mantissa.substring(diff);
    }
    if (op2.mantissa == 0) {
        op2.mantissa = op2.mantissa.substring(0, diff - 1) + '1' + op2.mantissa.substring(diff);
    }

    op1.magnitude = op1.integer + '.' + op1.mantissa;
    op2.magnitude = op2.integer + '.' + op2.mantissa;

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

export { alignExponent }
