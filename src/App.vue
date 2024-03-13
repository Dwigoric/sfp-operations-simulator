<script setup>
// Import packages
import { ref } from 'vue'

// Refs
const roundingMethod = ref(true)

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
    <div>
        <h2>Choose your rounding method:</h2>
        <VSwitch id="rounding-method" v-model="roundingMethod">
            <template #label>
                <VDialogBottomTransition>
                    <div v-if="roundingMethod">RTN-TE</div>
                    <div v-else>G/R/S</div>
                </VDialogBottomTransition>
            </template>
        </VSwitch>
    </div>

    <div id="binary-input">
        <h2 class="mb-3">Binary numbers to add</h2>
        <VOtpInput v-model="binary1" length="32" variant="underlined" @beforeinput="checkBit" />
        <VSpacer class="mt-5" />
        <VIcon icon="mdi-plus" style="align-self: center"></VIcon>
        <VOtpInput v-model="binary2" length="32" variant="underlined" @beforeinput="checkBit" />
    </div>

    <div></div>
</template>

<style scoped>
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
}

#binary-input >>> .v-otp-input__content {
    max-width: 100%;
}
</style>
