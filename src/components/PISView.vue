<script setup lang="ts">
defineEmits<{ (e: 'continue'): void }>()
</script>

<template>
  <div
    class="max-w-3xl mx-auto my-8 border-4 border-neutral-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
  >
    <div class="border-b-4 border-neutral-900 pb-4 mb-6">
      <span
        class="text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 bg-neutral-100 px-2 py-1 border border-neutral-300"
        >University of Bath — CM52069</span
      >
      <h1 class="text-3xl font-black font-mono tracking-tight mt-3 text-neutral-900">
        Participant Information Sheet
      </h1>
    </div>

    <div class="space-y-6 text-neutral-800 leading-relaxed font-sans">
      <section>
        <h2
          class="text-lg font-bold font-mono text-neutral-900 uppercase border-b-2 border-neutral-200 pb-1 mb-2"
        >
          1. Invitation to Participate
        </h2>
        <p>
          You are being invited to take part in a research study for an MSc Computer Science
          dissertation project.
        </p>
      </section>

      <section>
        <h2
          class="text-lg font-bold font-mono text-neutral-900 uppercase border-b-2 border-neutral-200 pb-1 mb-2"
        >
          2. Purpose of the Study
        </h2>
        <p>
          This study evaluates how different software interfaces—specifically static diagrams versus
          interactive visualisations—affect a user's cognitive load and usability experience when
          learning complex algorithms.
        </p>
      </section>

      <section>
        <h2
          class="text-lg font-bold font-mono text-neutral-900 uppercase border-b-2 border-neutral-200 pb-1 mb-2"
        >
          3. Why Have I Been Chosen?
        </h2>
        <p>
          You have been approached because you are a University of Bath student enrolled in a
          quantitative STEM or operations-focused discipline (e.g., Computer Science, Mathematics,
          Engineering, Quantitative Finance, Business Analytics).
        </p>
      </section>

      <section>
        <h2
          class="text-lg font-bold font-mono text-neutral-900 uppercase border-b-2 border-neutral-200 pb-1 mb-2"
        >
          4. Voluntary Participation & Withdrawal
        </h2>
        <p>
          Participation is entirely voluntary. Choosing not to participate, or withdrawing during
          the study, will have absolutely no impact on your university grades, academic standing, or
          relationship with the University.
        </p>
      </section>

      <section>
        <h2
          class="text-lg font-bold font-mono text-neutral-900 uppercase border-b-2 border-neutral-200 pb-1 mb-2"
        >
          5. Study Procedure & Data Handling
        </h2>
        <p>
          If you agree to participate, you will attend a single 45-minute session in a controlled
          University of Bath building. You will interact with a custom web application demonstrating
          algorithmic matching, predict system state changes at five breakpoints per task, and
          complete short digital questionnaires assessing cognitive load and usability.
        </p>
        <p class="mt-2 font-semibold text-neutral-900 bg-amber-50 p-3 border-2 border-amber-400">
          This study collects 100% anonymous data. No Personally Identifiable Information (PII) such
          as your name, student ID, email, or IP address will be collected. Once submitted, your
          aggregate anonymous dataset is immutable and cannot be withdrawn.
        </p>
      </section>
    </div>

    <div class="mt-8 pt-6 border-t-4 border-neutral-900 flex justify-end">
      <button
        @click="$emit('continue')"
        class="bg-neutral-900 hover:bg-neutral-800 text-white font-mono font-bold uppercase py-3 px-6 border-2 border-neutral-900 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 active:translate-x-1 active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      >
        Read and Continue &rarr;
      </button>
    </div>
  </div>
</template>
