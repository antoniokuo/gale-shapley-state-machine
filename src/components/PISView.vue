<script setup lang="ts">
defineEmits<{ (e: 'continue'): void }>()
</script>

<template>
  <div
    class="max-w-4xl mx-auto my-8 border-4 border-neutral-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
  >
    <div class="border-b-4 border-neutral-900 pb-4 mb-6 font-mono">
      <span
        class="text-xs font-bold uppercase tracking-widest text-black bg-neutral-100 px-2 py-1 border-2 border-neutral-900"
        >University of Bath</span
      >
      <h1 class="text-3xl font-black text-black tracking-tight mt-3">
        Participant Information Sheet (PIS)
      </h1>
      <div
        class="mt-3 text-sm text-black font-bold leading-relaxed bg-neutral-50 p-4 border-2 border-neutral-900 space-y-1"
      >
        <div>
          <span class="uppercase tracking-wider text-xs text-neutral-600 block">Study Title</span>
          Architecting a DAG-Reactive State Machine for Asymmetric Bipartite Matching and
          Interactive Visualisation
        </div>
        <div class="pt-2">
          <span class="uppercase tracking-wider text-xs text-neutral-600 block"
            >Lead Researcher</span
          >
          Antonio Kuo (MSc Computer Science, University of Bath)
        </div>
        <div class="pt-2">
          <span class="uppercase tracking-wider text-xs text-neutral-600 block"
            >Academic Supervisor</span
          >
          Pedro Henrique Azevedo De Amorim (Department of Computer Science, University of Bath)
        </div>
      </div>
    </div>

    <div class="space-y-6 text-base text-black font-normal leading-relaxed font-sans">
      <section>
        <h2
          class="text-xl font-black text-black font-mono uppercase border-b-2 border-neutral-950 pb-1 mb-2"
        >
          1. Invitation to Participate
        </h2>
        <p>
          You are being invited to take part in a research study for an MSc Computer Science
          dissertation. Before you decide whether to participate, it is important that you
          understand why the research is being done and what it will involve. Please read the
          following information carefully.
        </p>
      </section>

      <section>
        <h2
          class="text-xl font-black text-black font-mono uppercase border-b-2 border-neutral-950 pb-1 mb-2"
        >
          2. What is the purpose of the study?
        </h2>
        <p>
          This study evaluates how different software interfaces—specifically static diagrams versus
          interactive visualisations—affect a user's cognitive load and usability experience when
          learning complex algorithms.
        </p>
      </section>

      <section>
        <h2
          class="text-xl font-black text-black font-mono uppercase border-b-2 border-neutral-950 pb-1 mb-2"
        >
          3. Why have I been chosen?
        </h2>
        <p>
          You have been approached because you are a University of Bath student enrolled in a
          quantitative STEM or operations-focused discipline (e.g., Computer Science, Mathematics,
          Engineering, Quantitative Finance, Business Analytics).
        </p>
      </section>

      <section>
        <h2
          class="text-xl font-black text-black font-mono uppercase border-b-2 border-neutral-950 pb-1 mb-2"
        >
          4. Do I have to take part?
        </h2>
        <p>
          No. Participation is entirely voluntary. The researcher is a peer student and holds no
          teaching or supervisory authority over you. Choosing not to participate, or withdrawing
          during the study, will have absolutely no impact on your university grades, academic
          standing, or relationship with the University.
        </p>
      </section>

      <section>
        <h2
          class="text-xl font-black text-black font-mono uppercase border-b-2 border-neutral-950 pb-1 mb-2"
        >
          5. What will happen if I take part?
        </h2>
        <p>
          If you agree to participate, you will attend a single 45-minute session in a controlled
          University of Bath building (either the Main Campus or the Virgil Building, whichever is
          most convenient). During the session, you will:
        </p>
        <ul class="list-disc pl-6 mt-2 space-y-2 font-medium">
          <li>Interact with a custom web application demonstrating algorithmic matching.</li>
          <li>Predict system state changes at five breakpoints per task.</li>
          <li>
            Complete two short digital questionnaires (Raw NASA-TLX and the System Usability Scale)
            assessing your cognitive load and the interface's usability.
          </li>
          <li>
            Complete a 5-minute unconstrained interactive sandbox session and provide brief
            open-text feedback.
          </li>
        </ul>
      </section>

      <section>
        <h2
          class="text-xl font-black text-black font-mono uppercase border-b-2 border-neutral-950 pb-1 mb-2"
        >
          6. Will my data be kept confidential?
        </h2>
        <p>
          Yes. This study collects 100% anonymous data. No Personally Identifiable Information (PII)
          such as your name, student ID, email, or IP address will be collected. Upon providing
          digital consent, the system generates a randomised UUID. All response latency, error
          rates, and survey scores are logged solely against this UUID.
        </p>
      </section>

      <section>
        <h2
          class="text-xl font-black text-black font-mono uppercase border-b-2 border-neutral-950 pb-1 mb-2"
        >
          7. What is the withdrawal policy?
        </h2>
        <p>
          You are free to withdraw from the study at any time during the 45-minute session simply by
          informing the researcher or closing the browser window; any partial data will be
          immediately destroyed.
        </p>
        <div
          class="mt-3 font-mono font-bold text-black bg-amber-50 p-4 border-2 border-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          Important: Because the data is strictly anonymous, once you complete the session and the
          data is submitted to the secure server, it will be impossible to withdraw your data, as
          the researcher cannot link your identity to a specific UUID.
        </div>
      </section>

      <section>
        <h2
          class="text-xl font-black text-black font-mono uppercase border-b-2 border-neutral-950 pb-1 mb-2"
        >
          8. Are there any risks?
        </h2>
        <p>
          This is a low-risk, screen-based usability study. There are no anticipated risks beyond
          standard computer use (e.g., mild screen fatigue).
        </p>
      </section>

      <section>
        <h2
          class="text-xl font-black text-black font-mono uppercase border-b-2 border-neutral-950 pb-1 mb-2"
        >
          9. How do I consent?
        </h2>
        <p>
          If you wish to participate, you will be asked to check a digital consent box on the web
          application prior to beginning the session. You will not be asked to sign a physical piece
          of paper, ensuring your identity remains completely unrecorded.
        </p>
      </section>

      <section>
        <h2
          class="text-xl font-black text-black font-mono uppercase border-b-2 border-neutral-950 pb-1 mb-2"
        >
          10. Contact for Further Information
        </h2>
        <p>
          If you have any questions, please contact the lead researcher, Antonio Kuo, or the
          academic supervisor, Pedro Henrique Azevedo De Amorim.
        </p>
      </section>
    </div>

    <div class="mt-8 pt-6 border-t-4 border-neutral-900 flex justify-end font-mono">
      <button
        @click="$emit('continue')"
        class="bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase py-3 px-6 border-2 border-neutral-900 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
      >
        Read and Continue &rarr;
      </button>
    </div>
  </div>
</template>
