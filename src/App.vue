<script setup>
// Import packages
import { reactive, ref } from 'vue'

// Utils
import { addOperands, alignExponent, RoundRTNTE, useGRS } from './util.js'

// Refs
const useGrs = ref(false)
const rawInput = ref(false)
const bitsSupported = ref(23)

const binary1 = ref('001111111' + '0'.repeat(23))
const binary2 = ref('001111111' + '0'.repeat(23))

const base2_1 = reactive({
    sign: false,
    exponent: 0,
    mantissa: '0'.repeat(23)
})

const base2_2 = reactive({
    sign: false,
    exponent: 0,
    mantissa: '0'.repeat(23)
})

const info = reactive({
    op1: {
        sign: 0,
        exponent: 0,
        mantissa: '0000000'
    },
    op2: {
        sign: 0,
        exponent: 0,
        mantissa: '0000000'
    },
    aligned: {
        op1: {
            sign: 0,
            exponent: 0,
            magnitude: '1.0000000'
        },
        op2: {
            sign: 0,
            exponent: 0,
            magnitude: '1.0000000'
        }
    },
    preAdd: {
        op1: {
            sign: 0,
            exponent: 0,
            magnitude: '1.0000000'
        },
        op2: {
            sign: 0,
            exponent: 0,
            magnitude: '1.0000000'
        }
    },
    rawSum: {
        sign: 0,
        exponent: 0,
        magnitude: '10.0000000'
    }
})

// Functions
const checkBit = (e) => {
    if (e.inputType === 'insertText') {
        if (e.data !== '0' && e.data !== '1') {
            e.preventDefault()
        }
    }
}

const checkExponent = (e, base2) => {
    if (e.inputType === 'insertText') {
        if (e.data !== '-' && e.data !== '+' && isNaN(e.data)) {
            e.preventDefault()
        }

        // Prevent the exponent from being too large or too small
        if (base2.exponent < -12 || (base2.exponent === -12 && parseInt(e.data, 10) >= 7)) {
            e.preventDefault()
        }
        if (base2.exponent > 12 || (base2.exponent === 12 && parseInt(e.data, 10) >= 8)) {
            e.preventDefault()
        }
    }
}

const checkNumber = (e) => {
    if (e.inputType === 'insertText') {
        if (isNaN(e.data)) {
            e.preventDefault()
        }
    }
}

const simulate = () => {
    if (rawInput.value) {
        info.op1.sign = parseInt(binary1.value[0], 10)
        info.op1.exponent = parseInt(binary1.value.slice(1, 9), 2) - 127
        info.op1.mantissa = binary1.value.slice(9)

        info.op2.sign = parseInt(binary2.value[0], 10)
        info.op2.exponent = parseInt(binary2.value.slice(1, 9), 2) - 127
        info.op2.mantissa = binary2.value.slice(9)
    } else {
        info.op1.sign = base2_1.sign ? 1 : 0
        info.op1.exponent = base2_1.exponent
        info.op1.mantissa = base2_1.mantissa

        info.op2.sign = base2_2.sign ? 1 : 0
        info.op2.exponent = base2_2.exponent
        info.op2.mantissa = base2_2.mantissa
    }

    // Step 1: Align the exponents
    if (info.op1.exponent === info.op2.exponent) {
        info.aligned.op1 = {
            sign: info.op1.sign,
            exponent: info.op1.exponent,
            magnitude: '1.' + info.op1.mantissa
        }
        info.aligned.op2 = {
            sign: info.op2.sign,
            exponent: info.op2.exponent,
            magnitude: '1.' + info.op2.mantissa
        }
    } else {
        const aligned = alignExponent(info.op1, info.op2)
        info.aligned.op1 = aligned.op1
        info.aligned.op2 = aligned.op2
    }

    // Step 2: Perform binary addition
    if (useGrs.value) {
        info.preAdd.op1 = useGRS(info.aligned.op1, bitsSupported.value).result
        info.preAdd.op2 = useGRS(info.aligned.op2, bitsSupported.value).result
    } else {
        info.preAdd.op1 = RoundRTNTE(info.aligned.op1, bitsSupported.value)
        info.preAdd.op2 = RoundRTNTE(info.aligned.op2, bitsSupported.value)
    }
    info.rawSum = addOperands(info.preAdd.op1, info.preAdd.op2).result

    // Step 3: Normalize sum
    // Skip to round if the sum is 0

    // Step 4: Round

    // Step 5: Export to text file
}
</script>

<template>
    <div id="user-inputs">
        <div>
            <h2>Input method</h2>
            <VSwitch v-model="rawInput" class="input-switch">
                <template #label>
                    <VDialogBottomTransition>
                        <div v-if="rawInput">Binary</div>
                        <div v-else>Base-2</div>
                    </VDialogBottomTransition>
                </template>
            </VSwitch>
        </div>
        <div>
            <h2>Rounding method</h2>
            <VSwitch v-model="useGrs" class="input-switch">
                <template #label>
                    <VDialogBottomTransition>
                        <div v-if="useGrs">G/R/S</div>
                        <div v-else>RTN-TE</div>
                    </VDialogBottomTransition>
                </template>
            </VSwitch>
        </div>
        <div>
            <h2>Max number of bits supported</h2>
            <VTextField v-model="bitsSupported" class="w-100" @beforeinput="checkNumber" />
        </div>
    </div>

    <VExpandTransition>
        <div v-if="rawInput" id="binary-input">
            <h2 class="mb-3">Binary numbers to add (s, e, m)</h2>
            <VOtpInput
                v-model="binary1"
                class="rounded-t-xl rounded-b-0 bg-purple-darken-4 pt-3"
                length="32"
                variant="underlined"
                @beforeinput="checkBit"
            />
            <VIcon
                class="bg-purple-darken-4 w-100 py-6"
                icon="mdi-plus"
                style="align-self: center"
            ></VIcon>
            <VOtpInput
                v-model="binary2"
                class="rounded-b-xl rounded-t-0 bg-purple-darken-4 pb-7"
                length="32"
                variant="underlined"
                @beforeinput="checkBit"
            />
        </div>
        <div v-else id="base2-input">
            <h2 class="mb-3">Base-2 to add</h2>
            <div id="base2-fields">
                <div class="base2-field bg-blue-darken-4 rounded-t-xl">
                    <VSwitch v-model="base2_1.sign" class="sign-switch">
                        <template #label>
                            <VIcon v-if="base2_1.sign">mdi-minus</VIcon>
                            <VIcon v-else>mdi-plus</VIcon>
                        </template>
                    </VSwitch>
                    <VIcon>mdi-numeric-1</VIcon>
                    <VIcon>mdi-circle-small</VIcon>
                    <VOtpInput
                        v-model="base2_1.mantissa"
                        length="23"
                        variant="underlined"
                        @beforeinput="checkBit"
                    />
                    <VIcon>mdi-close</VIcon>
                    <VIcon>mdi-numeric-2</VIcon>
                    <VIcon>mdi-chevron-up</VIcon>
                    <VTextField
                        v-model.number="base2_1.exponent"
                        append-inner-icon="mdi-chevron-up"
                        hide-details
                        prepend-inner-icon="mdi-chevron-down"
                        single-line
                        @beforeinput="(e) => checkExponent(e, base2_1)"
                        @click:prepend-inner="
                            () => {
                                base2_1.exponent = Math.max(-126, base2_1.exponent - 1)
                            }
                        "
                        @click:append-inner="
                            () => {
                                base2_1.exponent = Math.min(127, base2_1.exponent + 1)
                            }
                        "
                    />
                </div>
                <VIcon class="bg-blue-darken-4 py-6 w-100" style="align-self: center"
                    >mdi-plus
                </VIcon>
                <div class="base2-field bg-blue-darken-4 rounded-b-xl">
                    <VSwitch v-model="base2_2.sign" class="sign-switch">
                        <template #label>
                            <VIcon v-if="base2_2.sign">mdi-minus</VIcon>
                            <VIcon v-else>mdi-plus</VIcon>
                        </template>
                    </VSwitch>
                    <VIcon>mdi-numeric-1</VIcon>
                    <VIcon>mdi-circle-small</VIcon>
                    <VOtpInput
                        v-model="base2_2.mantissa"
                        length="23"
                        variant="underlined"
                        @beforeinput="checkBit"
                    />
                    <VIcon>mdi-close</VIcon>
                    <VIcon>mdi-numeric-2</VIcon>
                    <VIcon>mdi-chevron-up</VIcon>
                    <VTextField
                        v-model.number="base2_2.exponent"
                        append-inner-icon="mdi-chevron-up"
                        hide-details
                        prepend-inner-icon="mdi-chevron-down"
                        single-line
                        @beforeinput="(e) => checkExponent(e, base2_2)"
                        @click:prepend-inner="
                            () => {
                                base2_2.exponent = Math.max(-126, base2_2.exponent - 1)
                            }
                        "
                        @click:append-inner="
                            () => {
                                base2_2.exponent = Math.min(127, base2_2.exponent + 1)
                            }
                        "
                    />
                </div>
            </div>
        </div>
    </VExpandTransition>

    <div id="add-button-wrapper">
        <VBtn
            :disabled="rawInput && (binary1.length < 32 || binary2.length < 32)"
            class="bg-orange-darken-3"
            @click.prevent="simulate"
        >
            <VIcon>mdi-plus</VIcon>
            <span>Add</span>
        </VBtn>
    </div>

    <div id="steps-wrapper">
        <h2>Step-by-Step Simulation</h2>
        <VList class="bg-brown-darken-2 rounded-xl">
            <VExpandTransition>
                <VListGroup v-if="rawInput" value="Step-0">
                    <template #activator="{ props }">
                        <VListItem
                            title="Step 0. Convert binary to normalized form"
                            v-bind="props"
                        />
                    </template>
                    <div class="steps-list">
                        <h3>
                            Split the binary numbers into their sign, exponent, and mantissa parts
                        </h3>
                        <div class="binary-split">
                            <div>
                                <h4>Binary 1</h4>
                                <p>Sign: {{ info.op1.sign }}</p>
                                <p>Exponent: {{ info.op1.exponent }}</p>
                                <p>Mantissa: {{ info.op1.mantissa }}</p>
                            </div>
                            <div>
                                <h4>Binary 2</h4>
                                <p>Sign: {{ info.op2.sign }}</p>
                                <p>Exponent: {{ info.op2.exponent }}</p>
                                <p>Mantissa: {{ info.op2.mantissa }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="steps-list">
                        <h3>Formulate the base-2 form</h3>
                        <div class="binary-split">
                            <p>
                                Operand 1: {{ info.op1.sign === 1 ? '-' : '+' }}1.{{
                                    info.op1.mantissa
                                }}
                                * 2^{{ info.op1.exponent }}
                            </p>
                            <p>
                                Operand 2: {{ info.op2.sign === 1 ? '-' : '+' }}1.{{
                                    info.op2.mantissa
                                }}
                                * 2^{{ info.op2.exponent }}
                            </p>
                        </div>
                    </div>
                </VListGroup>
            </VExpandTransition>
            <VListGroup>
                <template #activator="{ props }">
                    <VListItem title="Step 1. Align the exponents" v-bind="props" />
                </template>
                <h3 v-if="info.op1.exponent === info.op2.exponent" class="steps-list">
                    Since the exponents are already aligned, no further action is needed.
                </h3>
                <div v-else class="steps-list">
                    <h3>Align the exponents in favor of the operand with the larger exponent.</h3>
                    <div class="binary-split">
                        <div>
                            <h4>Aligned Operand 1</h4>
                            <p>Sign: {{ info.aligned.op1.sign }}</p>
                            <p>Exponent: {{ info.aligned.op1.exponent }}</p>
                            <p>Magnitude: {{ info.aligned.op1.magnitude }}</p>
                        </div>
                        <div>
                            <h4>Aligned Operand 2</h4>
                            <p>Sign: {{ info.aligned.op2.sign }}</p>
                            <p>Exponent: {{ info.aligned.op2.exponent }}</p>
                            <p>Magnitude: {{ info.aligned.op2.magnitude }}</p>
                        </div>
                    </div>
                </div>
            </VListGroup>
            <VListGroup>
                <template #activator="{ props }">
                    <VListItem title="Step 2. Perform binary addition" v-bind="props" />
                </template>
                <div class="steps-list">
                    <h3>Perform binary addition on the aligned operands.</h3>
                    <div class="binary-split">
                        <div>
                            <h4>Pre-addition Operand 1</h4>
                            <p>Sign: {{ info.preAdd.op1.sign }}</p>
                            <p>Exponent: {{ info.preAdd.op1.exponent }}</p>
                            <p>Magnitude: {{ info.preAdd.op1.magnitude }}</p>
                        </div>
                        <div>
                            <h4>Pre-addition Operand 2</h4>
                            <p>Sign: {{ info.preAdd.op2.sign }}</p>
                            <p>Exponent: {{ info.preAdd.op2.exponent }}</p>
                            <p>Magnitude: {{ info.preAdd.op2.magnitude }}</p>
                        </div>
                    </div>
                    <div class="binary-split">
                        <div>
                            <h4>Sum</h4>
                            <p>Sign: {{ info.rawSum.sign }}</p>
                            <p>Exponent: {{ info.rawSum.exponent }}</p>
                            <p>Magnitude: {{ info.rawSum.magnitude }}</p>
                        </div>
                    </div>
                </div>
            </VListGroup>
            <VListGroup>
                <template #activator="{ props }">
                    <VListItem title="Step 3. Normalize the result" v-bind="props" />
                </template>
            </VListGroup>
            <VListGroup>
                <template #activator="{ props }">
                    <VListItem title="Step 4. Round the result" v-bind="props" />
                </template>
            </VListGroup>
        </VList>
    </div>
</template>

<style scoped>
#user-inputs {
    display: flex;
    justify-content: space-around;
}

.input-switch {
    width: 100%;
    display: flex;
    justify-content: space-between;
}

.sign-switch {
    display: flex;
    justify-content: center;
}

#binary-input {
    width: 100%;
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
    align-items: stretch;

    :deep(.v-otp-input__content) {
        max-width: 100%;
    }
}

#base2-input {
    width: 100%;
    display: flex;
    flex-flow: column nowrap;
    justify-content: space-around;
    align-items: stretch;
}

#base2-fields {
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
    align-items: center;
    font-size: 1.5rem;

    :deep(.v-otp-input__content) {
        max-width: 90%;
    }
}

.base2-field {
    margin: 0 1rem;
    padding: 0 1rem;
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
    width: 100%;
    max-width: 100%;
    text-align: center;
    font-size: 1.5rem;
    font-weight: bold;
}

.v-text-field {
    width: 36rem;
}

#add-button-wrapper {
    width: 100%;
    padding: 3rem 0;
    display: flex;
    justify-content: center;
}

#steps-wrapper {
    width: 100%;
    display: flex;
    flex-flow: column nowrap;
}

.steps-list {
    padding: 1.2rem;
    width: 100%;
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
    align-items: stretch;
}

.binary-split {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-around;
    align-items: stretch;
    font-weight: bold;
}
</style>
