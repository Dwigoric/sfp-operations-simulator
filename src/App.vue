<script setup>
// Import packages
import { ref } from 'vue'

// Refs
const useGrs = ref(false)
const rawInput = ref(false)

const binary1 = ref('')
const binary2 = ref('')

// Functions
const checkBit = (e) => {
    if (e.inputType === 'insertText') {
        if (e.data !== '0' && e.data !== '1') {
            e.preventDefault()
        }
    }
}
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
            <h2 class="mb-3">Binary numbers to add</h2>
            <VOtpInput v-model="binary1" length="32" variant="underlined" @beforeinput="checkBit" />
            <VSpacer class="mt-5" />
            <VIcon icon="mdi-plus" style="align-self: center"></VIcon>
            <VOtpInput v-model="binary2" length="32" variant="underlined" @beforeinput="checkBit" />
        </div>
    </VExpandTransition>
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
    justify-content: center;
    align-items: stretch;

    :deep(.v-otp-input__content) {
        max-width: 100%;
    }
}
</style>
