<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{ (e: 'consented'): void }>()

const declarations = ref({
  readPIS: false,
  voluntary: false,
  anonymous: false,
  eligibility: false,
  agree: false,
})

const isFullyChecked = computed(() => {
  return Object.values(declarations.value).every((val) => val === true)
})
</script>

<template>
  <div
    class="max-w-3xl mx-auto my-12 border-4 border-neutral-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
  >
    <div class="border-b-4 border-neutral-900 pb-4 mb-6 font-mono">
      <span
        class="text-xs font-bold uppercase tracking-widest text-black bg-neutral-100 px-2 py-1 border-2 border-neutral-900"
        >University of Bath &bull; Ethics ID: 17735</span
      >
      <h1 class="text-3xl font-black text-black tracking-tight mt-3">Digital Consent Gateway</h1>
    </div>

    <div
      class="text-base text-black font-mono font-bold bg-amber-50 p-4 border-2 border-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8 leading-relaxed"
    >
      To ensure absolute anonymity and compliance with data minimisation under UK GDPR, consent is
      obtained via an unlinked digital checkbox gateway integrated into the web application. No
      physical signatures or Personally Identifiable Information are collected. The participant must
      check all boxes below before the system will generate an anonymous UUID and initialise the
      study environment.
    </div>

    <div class="space-y-4 font-sans">
      <label
        class="flex items-start p-4 border-2 border-neutral-900 bg-neutral-50 cursor-pointer select-none group hover:bg-neutral-100 transition-colors"
      >
        <input
          type="checkbox"
          v-model="declarations.readPIS"
          class="mt-1 mr-4 h-5 w-5 accent-neutral-900 border-2 border-neutral-900 rounded-none focus:ring-0 shrink-0"
        />
        <span class="text-base font-medium text-black"
          >I confirm that I have read and understood the Participant Information Sheet (PIS) for
          this study.</span
        >
      </label>

      <label
        class="flex items-start p-4 border-2 border-neutral-900 bg-neutral-50 cursor-pointer select-none group hover:bg-neutral-100 transition-colors"
      >
        <input
          type="checkbox"
          v-model="declarations.voluntary"
          class="mt-1 mr-4 h-5 w-5 accent-neutral-900 border-2 border-neutral-900 rounded-none focus:ring-0 shrink-0"
        />
        <span class="text-base font-medium text-black"
          >I understand that my participation is entirely voluntary and that I am free to withdraw
          at any time during the session without giving any reason, and without my academic standing
          or legal rights being affected.</span
        >
      </label>

      <label
        class="flex items-start p-4 border-2 border-neutral-900 bg-neutral-50 cursor-pointer select-none group hover:bg-neutral-100 transition-colors"
      >
        <input
          type="checkbox"
          v-model="declarations.anonymous"
          class="mt-1 mr-4 h-5 w-5 accent-neutral-900 border-2 border-neutral-900 rounded-none focus:ring-0 shrink-0"
        />
        <span class="text-base font-medium text-black"
          >I understand that this study collects strictly anonymous data. Because no name or
          identifying information is linked to my responses, I understand that once I submit my
          final data at the end of the session, it will be impossible to withdraw it.</span
        >
      </label>

      <label
        class="flex items-start p-4 border-2 border-neutral-900 bg-neutral-50 cursor-pointer select-none group hover:bg-neutral-100 transition-colors"
      >
        <input
          type="checkbox"
          v-model="declarations.eligibility"
          class="mt-1 mr-4 h-5 w-5 accent-neutral-900 border-2 border-neutral-900 rounded-none focus:ring-0 shrink-0"
        />
        <span class="text-base font-medium text-black"
          >I confirm I am a University of Bath student enrolled in a quantitative STEM or
          operations-focused discipline, and I have not had prior exposure to this specific
          visualisation tool.</span
        >
      </label>

      <label
        class="flex items-start p-4 border-2 border-neutral-900 bg-neutral-50 cursor-pointer select-none group hover:bg-neutral-100 transition-colors"
      >
        <input
          type="checkbox"
          v-model="declarations.agree"
          class="mt-1 mr-4 h-5 w-5 accent-neutral-900 border-2 border-neutral-900 rounded-none focus:ring-0 shrink-0"
        />
        <span
          class="text-base font-bold text-black bg-emerald-50 px-2 py-0.5 border border-dashed border-emerald-400"
          >I agree to take part in this research project.</span
        >
      </label>
    </div>

    <div class="mt-8 pt-6 border-t-4 border-neutral-900 flex justify-end font-mono">
      <button
        :disabled="!isFullyChecked"
        @click="emit('consented')"
        class="font-mono font-bold uppercase py-3 px-6 border-2 border-neutral-900 transition-all focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
      >
        I Consent - Begin Session
      </button>
    </div>
  </div>
</template>
