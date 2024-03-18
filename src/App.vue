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
    magnitude: '0000000',
    exponent: 0,
    sign: 0
})

const base2_2 = reactive({
    magnitude: '0000000',
    exponent: 0,
    sign: 0
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

// Lifecycle hooks
watch(base2_maxDigits, (newVal) => {
    // Append 0 if the magnitude is shorter than the new max digits
    if (base2_1.magnitude.length < newVal) {
        base2_1.magnitude += '0'.repeat(newVal - base2_1.magnitude.length)
    }
    if (base2_2.magnitude.length < newVal) {
        base2_2.magnitude += '0'.repeat(newVal - base2_2.magnitude.length)
    }

    // Truncate the magnitude if it's longer than the new max digits
    if (base2_1.magnitude.length > newVal) {
        base2_1.magnitude = base2_1.magnitude.slice(0, newVal)
    }
    if (base2_2.magnitude.length > newVal) {
        base2_2.magnitude = base2_2.magnitude.slice(0, newVal)
    }
})
</script>

<template>
    <div id="switches">
        <div>
            <h2>Input method</h2>
            <VSwitch id="rounding-method" v-model="rawInput">
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
            <VSwitch id="rounding-method" v-model="useGrs">
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
                    <VIcon>mdi-numeric-1</VIcon>
                    <VIcon>mdi-circle-small</VIcon>
                    <VOtpInput
                        v-model="base2_1.magnitude"
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
                <VIcon icon="mdi-plus" style="align-self: center"></VIcon>
                <VSpacer class="mt-3" />
                <div class="base2-field bg-blue-darken-4 rounded-b-xl">
                    <VIcon>mdi-numeric-1</VIcon>
                    <VIcon>mdi-circle-small</VIcon>
                    <VOtpInput
                        v-model="base2_2.magnitude"
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
        >
            <VIcon>mdi-plus</VIcon>
            <span>Add</span>
        </VBtn>
    </div>
</template>

<style scoped>
#switches {
    display: flex;
    justify-content: space-around;
}

#rounding-method {
    width: 100%;
    display: flex;
    justify-content: space-between;
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
</style>
