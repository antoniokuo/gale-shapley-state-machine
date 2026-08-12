<script setup lang="ts">
defineEmits<{ (e: 'acknowledge'): void }>()
</script>

<template>
  <div
    class="max-w-4xl w-full border-4 border-neutral-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
  >
    <div class="border-b-4 border-neutral-900 pb-3 mb-6 font-mono">
      <span
        class="text-xs font-black uppercase tracking-widest text-black bg-neutral-100 px-2 py-1 border-2 border-neutral-900"
      >
        Pre-Task Orientation Protocol
      </span>
      <h2 class="text-3xl font-black text-black tracking-tight mt-2 uppercase">
        Gale-Shapley: Logic & Legend (Static)
      </h2>
    </div>

    <div class="space-y-8 font-sans text-base text-black leading-relaxed">
      <section class="space-y-3">
        <h3
          class="text-lg font-black uppercase tracking-wide text-black font-mono border-b-2 border-neutral-900 pb-1"
        >
          0. Architectural Context: Two-Sided Resource Allocation
        </h3>
        <p>
          The system you are evaluating runs the
          <strong>Gale-Shapley Stable Matching Algorithm</strong>, a Nobel Prize-winning
          mathematical framework designed to compute optimal matching choices across modern
          decentralised networks.
        </p>
        <p class="font-bold text-neutral-900">Real-World Macro System Analogs:</p>
        <ul class="list-disc pl-6 space-y-2 text-sm font-medium text-neutral-800">
          <li>
            <strong>Higher Education Allocation (UCAS Clearing):</strong> Structurally matching
            thousands of university applicants to specific course capacity limits based on priority
            cutoff tiers.
          </li>
          <li>
            <strong>Ride-Hailing Dispatch Logistics:</strong> Asynchronously routing a rolling fleet
            of proximity vehicles to matching passenger requests based on structural arrival
            latencies.
          </li>
          <li>
            <strong>Medical Clearing Networks:</strong> Allocating clinical graduates to strict
            training quotas within regional residency hospitals based on cross-preference priority
            ranks.
          </li>
        </ul>
        <p
          class="text-sm font-semibold text-neutral-800 bg-neutral-100 p-4 border-2 border-dashed border-neutral-400 leading-normal"
        >
          <strong>System Ruleset:</strong> The matching execution is strictly <em>Asymmetric</em>.
          Proposers issue sequential applications to their highest preferred targets. Receivers do
          not lock assignments immediately; they hold options temporarily in a deferred state and
          will drop a current occupant the exact millisecond a superior candidate applies.
        </p>
      </section>

      <section class="space-y-3">
        <h3
          class="text-lg font-black uppercase tracking-wide border-b-2 border-neutral-900 pb-1 text-black font-mono"
        >
          1. Telemetry Interface Node States
        </h3>
        <p class="text-sm font-bold text-neutral-700">
          The simulation tracks 16 Proposers matching into 4 Receivers. Each Receiver maintains a
          strict quota capacity of exactly 3 slots. In this baseline condition, you will evaluate an
          isomorphic <strong>greyscale topology</strong>:
        </p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 font-mono">
          <div
            class="flex flex-col items-center p-4 border-2 border-neutral-200 bg-neutral-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.02)]"
          >
            <div
              class="border-4 px-2 py-3 flex flex-col items-center justify-center font-black w-24 bg-neutral-50 text-neutral-950 border-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xs"
            >
              <span class="text-sm font-black">P01</span>
              <span
                class="text-[9px] font-black uppercase border-t border-current pt-1 w-full text-center mt-1 block tracking-tighter"
                >EVAL</span
              >
            </div>
            <p class="text-xs font-bold text-center mt-3 font-sans leading-tight text-neutral-900">
              Active Evaluation State. The node's execution is halted. You must manually trace its
              trajectory.
            </p>
          </div>

          <div
            class="flex flex-col items-center p-4 border-2 border-neutral-200 bg-neutral-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.02)]"
          >
            <div
              class="border-4 px-2 py-3 flex flex-col items-center justify-center font-black w-24 bg-neutral-200 text-neutral-950 border-neutral-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
            >
              <span class="text-sm font-black">P01</span>
              <span
                class="text-[9px] font-black uppercase border-t border-current pt-1 w-full text-center mt-1 block tracking-tighter"
                >R3</span
              >
            </div>
            <p class="text-xs font-bold text-center mt-3 font-sans leading-tight text-neutral-900">
              Deferred Security State. The node is provisionally held inside a receiver's quota.
            </p>
          </div>

          <div
            class="flex flex-col items-center p-4 border-2 border-neutral-200 bg-neutral-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.02)]"
          >
            <div
              class="border-4 px-2 py-3 flex flex-col items-center justify-center font-black w-24 bg-white text-neutral-950 border-neutral-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
            >
              <span class="text-sm font-black">P01</span>
              <span
                class="text-[9px] font-black uppercase border-t border-current pt-1 w-full text-center mt-1 block tracking-tighter"
                >IDLE</span
              >
            </div>
            <p class="text-xs font-bold text-center mt-3 font-sans leading-tight text-neutral-900">
              Idle State. The node is unassigned, awaiting an execution tick or has been evicted.
            </p>
          </div>
        </div>
      </section>

      <section class="space-y-4">
        <h3
          class="text-lg font-black font-mono uppercase text-black border-b-2 border-neutral-900 pb-1"
        >
          2. Static Telemetry Prediction Mechanics
        </h3>
        <p class="text-sm font-medium">
          The system clock will halt exactly 5 times. You must manually cross-reference the active
          nodes against the <strong>Raw Vector Context Arrays</strong> on the right-hand panel to
          determine priority. Submit your prediction via the modal:
        </p>

        <div class="space-y-3 font-mono text-sm">
          <div
            class="flex items-start space-x-4 border-2 border-neutral-900 p-3 bg-neutral-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <span
              class="bg-white text-neutral-950 border-2 border-neutral-950 px-3 py-1 font-black min-w-[100px] text-center"
              >ACCEPT</span
            >
            <p class="font-sans text-xs font-bold text-neutral-900 pt-1">
              The targeted receiver currently holds fewer than 3 occupants. It has unallocated
              capacity and automatically accepts.
            </p>
          </div>
          <div
            class="flex items-start space-x-4 border-2 border-neutral-900 p-3 bg-neutral-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <span
              class="bg-white text-neutral-950 border-2 border-neutral-950 px-3 py-1 font-black min-w-[100px] text-center"
              >REJECT</span
            >
            <p class="font-sans text-xs font-bold text-neutral-900 pt-1">
              The targeted receiver is full. By reading the raw array, you deduce the applicant
              ranks lower than all current occupants.
            </p>
          </div>
          <div
            class="flex items-start space-x-4 border-2 border-neutral-900 p-3 bg-neutral-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <span
              class="bg-white text-neutral-950 border-2 border-neutral-950 px-3 py-1 font-black min-w-[100px] text-center"
              >DISPLACE</span
            >
            <p class="font-sans text-xs font-bold text-neutral-900 pt-1">
              The receiver is full, but the raw array shows the applicant ranks higher than a
              current occupant. Select the identity of the evicted node.
            </p>
          </div>
        </div>
      </section>
    </div>

    <div class="mt-10 pt-6 border-t-4 border-neutral-900 flex justify-end font-mono">
      <button
        @click="$emit('acknowledge')"
        class="bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase py-3 px-6 border-2 border-neutral-900 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
      >
        Acknowledge & Begin Task &rarr;
      </button>
    </div>
  </div>
</template>
