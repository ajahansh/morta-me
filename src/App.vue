<script setup>
import { ref, computed, watch, reactive, onMounted } from 'vue'
import { Engines } from './logic/engines'
import gsap from 'gsap'
import { 
  Wallet, Calendar, Info, Scale, Landmark, 
  BarChart3, Target, TrendingUp 
} from 'lucide-vue-next'

// --- LOGIC & STATE ---
const selectedCountry = ref('BE')
const propertyPrice = ref(300000)
const loanAmount = ref(270000)
const durationYears = ref(20)
const annualRate = ref(2.570)

const selectedTaxId = ref('be_fl_first')
const customTaxRate = ref(2.000) 
const regTax = ref(6000)      
const allOtherCosts = ref(2321)  
const miscCosts = ref(1489)   
const notaryVAT = ref(740)    

const adminFees = ref(350)    
const cancellationFine = ref(1.0)

// --- TAX REFUND NETHERLANDS ---
const taxRefundEnabled = ref(true)
const incomeTaxBracket = ref(36.97) // Standard NL bracket

// --- ANIMATION STATE ---
// This object holds the numbers currently visible to the user
const display = reactive({
  upfront: 0,
  monthly: 0,
  resale: 0,
  principal: 0,
  interest: 0
})

const currentEngine = computed(() => Engines[selectedCountry.value])
const isCustomTax = computed(() => selectedTaxId.value.includes('custom'))

// --- WATCHERS ---
watch(selectedCountry, (newCountry) => {
  selectedTaxId.value = Engines[newCountry].defaultTaxes[0].id
})

watch([selectedTaxId, propertyPrice], ([newId, newPrice]) => {
  const preset = currentEngine.value.defaultTaxes.find(t => t.id === newId)
  if (preset && preset.rate !== null) {
    regTax.value = Math.round(newPrice * preset.rate)
  }
})

// --- MATH & FINANCIALS ---
const monthlyRate = computed(() => currentEngine.value.calculateMonthlyRate(annualRate.value))
const totalMonths = computed(() => durationYears.value * 12)
const monthlyPayment = computed(() => {
  const r = monthlyRate.value, n = totalMonths.value, p = loanAmount.value
  if (r <= 0) return p / n; 
  return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
})

const totalInterestPaid = computed(() => (monthlyPayment.value * totalMonths.value) - loanAmount.value)
const avgMonthlyInterest = computed(() => totalInterestPaid.value / totalMonths.value)
const avgMonthlyPrincipal = computed(() => monthlyPayment.value - avgMonthlyInterest.value)

const totalNotaryPayable = computed(() => Number(regTax.value) + Number(allOtherCosts.value) + Number(miscCosts.value) + Number(notaryVAT.value))
const upfrontDeposit = computed(() => propertyPrice.value - loanAmount.value)
const totalUpfront = computed(() => upfrontDeposit.value + totalNotaryPayable.value + adminFees.value)

const lossFreeResale = computed(() => {
  const buyFees = totalNotaryPayable.value + adminFees.value
  const sellFees = totalNotaryPayable.value - regTax.value
  const bankPenalty = loanAmount.value * (cancellationFine.value / 100)
  return propertyPrice.value + buyFees + sellFees + bankPenalty
})

// --- EXTRA MATH NETHERLANDS ---
const monthlyTaxRefund = computed(() => {
  if (selectedCountry.value !== 'NL' || !taxRefundEnabled.value) return 0
  // Interest * Tax Bracket = Refund
  return avgMonthlyInterest.value * (incomeTaxBracket.value / 100)
})

const netMonthlyPayment = computed(() => monthlyPayment.value - monthlyTaxRefund.value)


// --- DYNAMIC LOCALIZATION ---
const format = (v) => {
  const locale = currentEngine.value.locale || 'de-DE'
  return Math.round(v).toLocaleString(locale)
}

const formatDec = (v) => {
  const locale = currentEngine.value.locale || 'de-DE'
  return v.toLocaleString(locale, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })
}

// --- GSAP TWEENING LOGIC ---
watch(
  [totalUpfront, monthlyPayment, lossFreeResale, avgMonthlyPrincipal, avgMonthlyInterest, netMonthlyPayment], 
  (newVals) => {
    // Determine if we should animate to the Gross or Net monthly payment
    const targetMonthly = (selectedCountry.value === 'NL' && taxRefundEnabled.value) 
      ? newVals[5] // netMonthlyPayment
      : newVals[1]; // monthlyPayment

    // Kill any active animations on 'display' to prevent "glitching"
    gsap.killTweensOf(display);

    gsap.to(display, {
      duration: 0.5,
      ease: "power2.out",
      upfront: newVals[0],
      monthly: targetMonthly,
      resale: newVals[2],
      principal: newVals[3],
      interest: newVals[4]
    });
  }, 
  { immediate: true }
);
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] font-sans p-4 md:p-12 text-slate-900">
    <div class="max-w-7xl mx-auto space-y-10">
      
      <header class="flex flex-col md:flex-row justify-between items-center gap-8">
        <div class="flex items-center gap-5 group cursor-default">
          <img src="./assets/logo.svg" alt="MortaMe Logo" class="logo-animate w-14 h-14 md:w-16 md:h-16 object-contain flex-shrink-0" />
          
          <div class="flex flex-col justify-center">
            <h1 class="brand-header leading-none">MortaMe.</h1>
            <p class="brand-sub">The Most Transparent Mortgage Simulator</p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <nav class="country-nav">
            <button v-for="c in Engines" :key="c.code" @click="selectedCountry = c.code"
              class="country-btn" :class="{ 'active': selectedCountry === c.code }">
              <img :src="c.flag" class="w-4 h-3 rounded-sm"> {{ c.name }}
            </button>
          </nav>
        </div>
      </header>

      <div class="grid lg:grid-cols-12 gap-8 lg:gap-12">
        <section class="lg:col-span-5 space-y-8">
          <div class="glass-panel p-8 md:p-10">
            <div class="panel-tag">Configurator</div>
            
            <div class="space-y-10 mt-6">
              <div class="value-hero">
                <label>Property Valuation</label>
                <div class="flex items-center">
                  <span class="currency">€</span>
                  <input type="number" v-model="propertyPrice" class="hero-input">
                </div>
              </div>

              <div class="space-y-6">
                <h3 class="fancy-title"><Landmark :size="20"/> Loan Terms</h3>
                <div class="control-card">
                  <div class="flex justify-between items-end mb-4">
                    <label class="tiny-label">Loan Amount</label>
                    <div class="flex items-center font-serif text-2xl font-bold text-indigo-600">
                      €<input type="number" v-model="loanAmount" class="inline-input w-36">
                    </div>
                  </div>
                  <input type="range" :value="(loanAmount/propertyPrice)*100" @input="loanAmount = Math.round(propertyPrice * ($event.target.value / 100))" min="10" :max="currentEngine.maxLTV * 100" class="range-slider">
                  <div class="flex justify-between mt-2 text-[10px] font-bold text-slate-400"><span>10%</span><span>LTV: {{ Math.round((loanAmount/propertyPrice)*100) }}%</span></div>
                  
                  <div class="grid grid-cols-2 gap-4 mt-6">
                    <div class="input-cell">
                      <label>Rate (%)</label>
                      <input type="number" step="0.001" v-model="annualRate">
                    </div>
                    
                    <div class="input-cell col-span-2 sm:col-span-1">
                      <div class="flex justify-between items-center mb-1">
                        <label>Duration</label>
                        <span class="text-sm font-black text-indigo-600">{{ durationYears }} Years</span>
                      </div>
                      <input 
                        type="range" 
                        v-model.number="durationYears" 
                        min="5" 
                        max="25" 
                        step="1" 
                        class="range-slider mt-2"
                      >
                      <div class="flex justify-between mt-1 text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                        <span>5y</span>
                        <span>25y</span>
                      </div>
                    </div>

                    <div class="input-cell"><label>Admin Fee (€)</label><input type="number" v-model="adminFees"></div>
                    <div class="input-cell"><label>Exit Fine (%)</label><input type="number" step="0.1" v-model="cancellationFine"></div>
                  </div>
                </div>
              </div>

              <div class="space-y-6">
                <h3 class="fancy-title"><Scale :size="20"/> Notary & Taxes</h3>
                <div class="tax-card space-y-6">
                  <div class="space-y-2">
                    <label class="tiny-label-indigo">{{ currentEngine.labels.regTitle }}</label>
                    <div class="flex gap-2">
                      <select v-model="selectedTaxId" class="select-field">
                        <option v-for="tax in currentEngine.defaultTaxes" :key="tax.id" :value="tax.id">{{ tax.label }}</option>
                      </select>
                      <input v-if="isCustomTax" type="number" step="0.001" v-model="customTaxRate" class="select-field-sm" @input="regTax = Math.round(propertyPrice * (customTaxRate / 100))">
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="edit-cell"><label>Tax Amount</label><input type="number" v-model="regTax" :readonly="!isCustomTax"></div>
                    <div class="edit-cell"><label>Other Costs</label><input type="number" v-model="allOtherCosts"></div>
                    <div class="edit-cell"><label>{{ currentEngine.labels.misc }}</label><input type="number" v-model="miscCosts"></div>
                    <div class="edit-cell"><label>{{ currentEngine.labels.tax }}</label><input type="number" v-model="notaryVAT"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <main class="lg:col-span-7 space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="summary-card-dark">
              <span class="summary-label"><Wallet :size="16"/> Upfront Capital</span>
              <h2 class="summary-value">€{{ format(display.upfront) }}</h2>
              <p class="summary-footer">Own Deposit + Legal + Bank Fees</p>
            </div>
            
            <div class="summary-card-light">
              <span class="summary-label-indigo"><Calendar :size="16"/> Monthly Payment</span>
              <h2 class="summary-value-dark">
                €{{ formatDec(taxRefundEnabled && selectedCountry === 'NL' ? netMonthlyPayment : display.monthly) }}
              </h2>
              <p class="summary-footer-dark">
                {{ taxRefundEnabled && selectedCountry === 'NL' ? 'Net Payment after Tax Credit' : `Full Amortization at ${annualRate}%` }}
              </p>
            </div>
          </div>

          <div class="glass-panel-flat p-8 md:p-12 space-y-12">
            <div class="flex justify-between items-center border-b pb-6">
              <h3 class="fancy-title-large">Financial Analysis</h3>
              <BarChart3 class="text-indigo-600" :size="28"/>
            </div>

            <div class="grid md:grid-cols-2 gap-12">
              <div class="space-y-4">
                <span class="label-bold"><Target :size="16" class="text-rose-500"/> Break-Even Price</span>
                <div class="highlight-box">
                  <div class="text-4xl font-serif font-black">€{{ format(display.resale) }}</div>
                  <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Required Resale Value</div>
                </div>
              </div>

              <div class="space-y-6">
                <span class="label-bold"><TrendingUp :size="16" class="text-indigo-600"/> Monthly Wealth Allocation</span>
                <div class="space-y-4">
                  <div class="progress-track h-8"> 
                    <div class="bar-equity flex items-center px-3 overflow-hidden transition-all duration-500" 
                      :style="{ width: (avgMonthlyPrincipal/monthlyPayment)*100 + '%' }">
                      <span class="text-[9px] text-white font-black whitespace-nowrap">
                         {{ Math.round((avgMonthlyPrincipal/monthlyPayment)*100) }}%
                      </span>
                    </div>
                    <div class="bar-interest flex items-center justify-end px-3 overflow-hidden transition-all duration-500" 
                      :style="{ width: (avgMonthlyInterest/monthlyPayment)*100 + '%' }">
                      <span class="text-[9px] text-white font-black whitespace-nowrap">
                        {{ Math.round((avgMonthlyInterest/monthlyPayment)*100) }}%
                      </span>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-2 text-[11px] font-black uppercase tracking-tight">
                    <div class="text-indigo-600"> Wealth (Equity): <span class="block text-lg font-serif">€{{ formatDec(display.principal) }}</span></div>
                    <div class="text-rose-500 text-right"> Expense (Interest): <span class="block text-lg font-serif">€{{ formatDec(display.interest) }}</span></div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="selectedCountry === 'NL'" class="tax-card bg-emerald-50/30 border-emerald-100 mt-6">
              <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                      <Target :size="18" />
                    </div>
                    <div>
                      <label class="tiny-label-indigo !text-emerald-600">Tax Credit (Hypotheekrenteaftrek)</label>
                      <p class="text-[10px] font-bold text-slate-400 uppercase">Deduct interest from income tax</p>
                    </div>
                  </div>
                  <button 
                    @click="taxRefundEnabled = !taxRefundEnabled"
                    class="w-12 h-6 rounded-full transition-colors relative"
                    :class="taxRefundEnabled ? 'bg-emerald-500' : 'bg-slate-300'"
                  >
                    <div 
                      class="absolute top-1 bg-white w-4 h-4 rounded-full transition-all"
                      :class="taxRefundEnabled ? 'left-7' : 'left-1'"
                    ></div>
                  </button>
              </div>  
              <div v-if="taxRefundEnabled" class="mt-4 pt-4 border-t border-emerald-100/50">
                <div class="flex justify-between items-center">
                  <span class="text-[11px] font-black text-slate-500 uppercase">Estimated Refund:</span>
                  <span class="text-emerald-600 font-serif font-bold text-lg">€{{ formatDec(monthlyTaxRefund) }} /mo</span>
                </div>
              </div>
            </div>
            <div class="pt-10 border-t grid sm:grid-cols-2 gap-10">
              <div class="cost-stat">
                <div class="icon-circle-rose"><Landmark :size="24"/></div>
                <div>
                  <label class="tiny-label">Total Interest Cost</label>
                  <span class="stat-num-rose">€{{ format(display.interest * totalMonths) }}</span>
                </div>
              </div>
              <div class="cost-stat sm:justify-end text-right">
                <div class="order-2 sm:order-1">
                  <label class="tiny-label">Total Maturity Value</label>
                  <span class="stat-num">€{{ format(loanAmount + (display.interest * totalMonths)) }}</span>
                </div>
                <div class="icon-circle-slate order-1 sm:order-2"><TrendingUp :size="24"/></div>
              </div>
            </div>
          </div>

          <footer class="glossary-panel">
            <h4 class="glossary-header"><Info :size="16"/> Technical Glossary</h4>
            <div class="grid sm:grid-cols-2 gap-12 text-[12px] leading-relaxed">
              <div class="space-y-2">
                <p class="font-black text-slate-900 uppercase tracking-wider">Upfront Capital</p>
                <p class="text-slate-500 font-medium">
                  Total out-of-pocket cash required to finalize the purchase. This includes your down payment (deposit), registration taxes, notary fees, and bank administrative costs.
                </p>
              </div>
              <div class="space-y-2">
                <p class="font-black text-slate-900 uppercase tracking-wider">Break-Even Price</p>
                <p class="text-slate-500 font-medium">
                  The minimum resale value required to recover your initial investment. It accounts for buying fees, administrative costs, and potential bank penalties incurred if the mortgage is cancelled early.
                </p>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Playfair+Display:wght@700;900&display=swap');

/* Logo Animation Logic */
.logo-animate {
  transition: transform 0.3s ease;
}

.group:hover .logo-animate {
  transform: translateY(-2px);
}

/* Deep selection to target the path inside the SVG if injected as a component, 
   or simply rely on the img hover if using <img> tags */
.wealth-line {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.group:hover .wealth-line {
  stroke: #6366F1; /* Slightly brightens on hover */
}

/* Typography Headers */
.brand-header { font-family: 'Playfair Display', serif; @apply text-5xl font-black text-slate-900 transition-colors; }
.brand-sub { @apply text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2; }
.fancy-title { font-family: 'Playfair Display', serif; @apply text-2xl font-bold text-slate-800 flex items-center gap-3; }
.fancy-title-large { font-family: 'Playfair Display', serif; @apply text-3xl font-bold text-slate-800; }

/* Navigation */
.country-nav { @apply flex p-1 bg-white rounded-xl shadow-lg border border-slate-100; }
.country-btn { @apply flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-all; }
.country-btn.active { @apply bg-indigo-600 text-white shadow-md shadow-indigo-200; }

/* Cards & Panels */
.glass-panel { @apply bg-white backdrop-blur-3xl rounded-[3rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] border border-white relative; }
.glass-panel-flat { @apply bg-white rounded-[3.5rem] shadow-2xl border border-slate-50; }
.panel-tag { @apply absolute -top-3 left-10 px-4 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full; }

/* Inputs */
.value-hero { @apply p-8 bg-slate-50 rounded-[2.5rem] border border-transparent focus-within:border-indigo-100 transition-all; }
.value-hero label { @apply text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2; }
.currency { font-family: 'Playfair Display', serif; @apply text-4xl font-bold text-indigo-600 mr-3; }
.hero-input { font-family: 'Playfair Display', serif; @apply w-full bg-transparent text-5xl font-black outline-none text-slate-900; }

.control-card { @apply p-6 bg-white rounded-3xl border border-slate-100; }
.inline-input { @apply bg-transparent outline-none ml-1 text-right; }
.input-cell { @apply flex flex-col p-4 bg-slate-50 rounded-2xl border border-transparent transition-all hover:bg-white hover:border-slate-100; }
.input-cell label { @apply text-[9px] font-black text-slate-500 uppercase mb-1; }
.input-cell input { @apply bg-transparent font-bold text-lg outline-none text-slate-900; }
.input-cell input[type="range"] { @apply cursor-pointer accent-indigo-600; padding: 0; height: 1.5rem; }
.tax-card { @apply p-8 bg-indigo-50/30 rounded-[2.5rem] border border-indigo-100; }
.select-field { @apply flex-grow p-3 bg-white rounded-xl text-xs font-bold shadow-sm outline-none text-slate-900; }
.select-field-sm { @apply w-20 p-3 bg-white rounded-xl text-xs font-black shadow-sm outline-none text-center text-slate-900; }
.edit-cell { @apply flex flex-col gap-1; }
.edit-cell label { @apply text-[9px] font-black text-indigo-400 uppercase; }
.edit-cell input { @apply w-full bg-white p-3 rounded-xl text-xs font-black outline-none shadow-sm text-slate-900; }

/* Result Cards */
.summary-card-dark { @apply bg-slate-800 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden; }
.summary-card-light { @apply bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100; }
.summary-label { @apply text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2; }
.summary-label-indigo { @apply text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2; }
.summary-value { font-family: 'Playfair Display', serif; @apply text-5xl font-bold mt-4 tracking-tight; }
.summary-value-dark { font-family: 'Playfair Display', serif; @apply text-5xl font-bold mt-4 text-slate-900 tracking-tight; }
.summary-footer { @apply mt-6 pt-6 border-t border-white/10 text-[10px] opacity-40 uppercase font-bold; }
.summary-footer-dark { @apply mt-6 pt-6 border-t border-slate-100 text-[10px] text-slate-400 uppercase font-bold; }

/* Analytics */
.highlight-box { @apply p-8 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200; }
.progress-track { @apply w-full h-4 flex rounded-full overflow-hidden bg-slate-100 shadow-inner; }
.bar-equity { @apply bg-indigo-600 h-full transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.4)]; }
.bar-interest { @apply bg-rose-500 h-full transition-all duration-1000; }

.cost-stat { @apply flex items-center gap-5; }
.tiny-label { @apply text-[10px] font-black text-slate-400 uppercase block mb-1; }
.stat-num { font-family: 'Playfair Display', serif; @apply text-2xl font-bold text-slate-900; }
.stat-num-rose { font-family: 'Playfair Display', serif; @apply text-2xl font-bold text-rose-500; }
.icon-circle-rose { @apply w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500; }
.icon-circle-slate { @apply w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400; }

.glossary-panel { @apply p-10 rounded-[3rem] bg-slate-50 border border-slate-100; }
.glossary-header { @apply text-[10px] font-black mb-6 uppercase text-slate-400 tracking-[0.3em] flex items-center gap-2; }

/* Range Slider */
.range-slider { @apply appearance-none w-full h-2 bg-slate-100 rounded-full outline-none; }
.range-slider::-webkit-slider-thumb { @apply appearance-none w-7 h-7 bg-indigo-600 rounded-full border-4 border-white shadow-xl cursor-pointer hover:scale-110 transition-transform; }

.progress-track { @apply w-full flex rounded-full overflow-hidden bg-slate-100 shadow-inner; transition: all 0.5s ease; }
.bar-equity { @apply bg-indigo-600 h-full shadow-[0_0_15px_rgba(79,70,229,0.4)]; }
.bar-interest { @apply bg-rose-500 h-full; }

/* Keep numbers from "wiggling" during count-up */
.summary-value, .summary-value-dark, .stat-num, .stat-num-rose {
  font-variant-numeric: tabular-nums;
}
</style>
