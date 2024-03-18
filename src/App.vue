<script setup>
// Import packages
import { reactive, ref, watch } from 'vue'

// Refs
const useGrs = ref(false)
const rawInput = ref(false)

const binary1 = ref('001111111' + '0'.repeat(23))
const binary2 = ref('001111111' + '0'.repeat(23))
const base2_maxDigits = ref(7)

const base2_1 = reactive({
    sign: false,
    exponent: 0,
    mantissa: '0000000'
})

const base2_2 = reactive({
    sign: false,
    exponent: 0,
    mantissa: '0000000'
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

const simulate = () => {
    if (rawInput.value) {
        info.op1.sign = parseInt(binary1.value[0], 10)
        info.op1.exponent = parseInt(binary1.value.slice(1, 9), 2) - 127
        info.op1.mantissa = '1' + binary1.value.slice(9)

        info.op2.sign = parseInt(binary2.value[0], 10)
        info.op2.exponent = parseInt(binary2.value.slice(1, 9), 2) - 127
        info.op2.mantissa = '1' + binary2.value.slice(9)
    } else {
        info.op1.sign = base2_1.sign ? 1 : 0
        info.op1.exponent = base2_1.exponent
        info.op1.mantissa = '1' + base2_1.mantissa

        info.op2.sign = base2_2.sign ? 1 : 0
        info.op2.exponent = base2_2.exponent
        info.op2.mantissa = '1' + base2_2.mantissa
    }
}

// Lifecycle hooks
watch(base2_maxDigits, (newVal) => {
    // Append 0 if the magnitude is shorter than the new max digits
    if (base2_1.mantissa.length < newVal) {
        base2_1.mantissa += '0'.repeat(newVal - base2_1.mantissa.length)
    }
    if (base2_2.mantissa.length < newVal) {
        base2_2.mantissa += '0'.repeat(newVal - base2_2.mantissa.length)
    }

    // Truncate the magnitude if it's longer than the new max digits
    if (base2_1.mantissa.length > newVal) {
        base2_1.mantissa = base2_1.mantissa.slice(0, newVal)
    }
    if (base2_2.mantissa.length > newVal) {
        base2_2.mantissa = base2_2.mantissa.slice(0, newVal)
    }
})
</script>

<template>
    <div id="switches">
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
    </div>

    <VExpandTransition>
        <div v-if="rawInput" id="binary-input">
            <h2 class="mb-3">Binary numbers to add (s, e, m)</h2>
            <VOtpInput v-model="binary1" length="32" variant="underlined" @beforeinput="checkBit" />
            <VSpacer class="mt-5" />
            <VIcon icon="mdi-plus" style="align-self: center"></VIcon>
            <VOtpInput v-model="binary2" length="32" variant="underlined" @beforeinput="checkBit" />
        </div>
        <div v-else id="base2-input">
            <div>
                <h2>Max digits in the mantissa</h2>
                <VSlider v-model="base2_maxDigits" max="23" min="1" step="1" thumb-label="always" />
            </div>
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
                        :length="base2_maxDigits"
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
                <VSpacer class="mb-3" />
                <VIcon icon="mdi-plus-thick" style="align-self: center"></VIcon>
                <VSpacer class="mt-3" />
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
                        :length="base2_maxDigits"
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
            </VListGroup>
            <VListGroup>
                <template #activator="{ props }">
                    <VListItem title="Step 2. Perform binary addition" v-bind="props" />
                </template>
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
#switches {
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
    width: 33rem;
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
