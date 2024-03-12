<script setup>
// Import packages
import { ref } from 'vue'

// Refs
const roundingMethod = ref(true)

const binary1 = ref('')
const binary2 = ref('')
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
        <VTextField v-model="binary1" label="Binary 1" />
        <VIcon icon="mdi-plus" style="align-self: center"></VIcon>
        <VSpacer class="mb-5" />
        <VTextField v-model="binary2" label="Binary 2" />
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
</style>
