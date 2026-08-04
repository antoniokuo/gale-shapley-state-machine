<script setup lang="ts">
// Final view, no emits required.
</script>

<template>
  <div
    class="max-w-3xl mx-auto my-12 border-4 border-neutral-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
  >
    <div class="border-b-4 border-neutral-900 pb-4 mb-6">
      <h1 class="text-3xl font-black font-mono tracking-tight text-neutral-900">
        Digital Debriefing Statement
      </h1>
    </div>

    <div class="space-y-6 text-neutral-800 leading-relaxed font-sans text-sm">
      <p class="text-lg font-bold">Thank you for your valuable participation in this study!</p>
      <p>
        Your time and input are highly appreciated and directly contribute to this MSc Computer
        Science dissertation project.
      </p>

      <section>
        <h2
          class="text-base font-bold font-mono text-neutral-900 uppercase border-b-2 border-neutral-200 pb-1 mb-2"
        >
          Project Purpose and Rationale
        </h2>
        <p>
          The objective of this research is to empirically evaluate whether a DAG-reactive state
          machine paired with an interactive user interface significantly reduces cognitive load and
          improves usability compared to traditional static diagrams when learning complex
          O(N&sup2;) algorithms.
        </p>
      </section>

      <section>
        <h2
          class="text-base font-bold font-mono text-neutral-900 uppercase border-b-2 border-neutral-200 pb-1 mb-2"
        >
          Data Management and Anonymity Reminder
        </h2>
        <p>
          As stated at the beginning of the session, your data has been transmitted and recorded
          securely under a completely randomised, unlinked UUID. No personally identifiable
          information (such as your name or student ID) has been collected. Because your dataset
          contains zero identifying markers, it is now impossible to isolate or delete your specific
          responses from the secure database.
        </p>
      </section>

      <section>
        <h2
          class="text-base font-bold font-mono text-neutral-900 uppercase border-b-2 border-neutral-200 pb-1 mb-2"
        >
          Future Findings & Contact
        </h2>
        <p>
          The final aggregate, anonymised results of this study will be compiled into a dissertation
          report submitted in September 2026. If you have any questions regarding the project or
          wish to learn about the high-level findings after this date, please feel free to contact
          the research team via email:
        </p>
        <ul class="list-none mt-2 space-y-1 bg-neutral-100 p-4 border border-neutral-300 font-mono">
          <li><span class="font-bold">Lead Researcher:</span> Antonio Kuo (ak4329@bath.ac.uk)</li>
          <li>
            <span class="font-bold">Academic Supervisor:</span> Pedro Henrique Azevedo De Amorim
            (phaa20@bath.ac.uk)
          </li>
        </ul>
      </section>
    </div>

    <div class="mt-8 pt-6 border-t-4 border-neutral-900 text-center">
      <p
        class="font-mono font-bold text-neutral-900 uppercase bg-emerald-100 p-4 border-2 border-emerald-500"
      >
        You may now close this browser window.
      </p>
    </div>
  </div>
</template>
