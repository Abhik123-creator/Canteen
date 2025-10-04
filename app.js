const DEFAULT = {
  month: "2025-10",
  fund: 5000,
  remaining: 5000,
  friends: [
    { name: 'Abhik', spent: 0 },
    { name: 'Parag', spent: 0 },
    { name: 'Rajdeep', spent: 0 },
    { name: 'Sohal', spent: 0 },
    { name: 'Soumik', spent: 0 }
  ],
  expenses: []
}

let state = loadState()

// elements
const totalFundEl = document.getElementById('totalFund')
const remainingEl = document.getElementById('remaining')
const monthEl = document.getElementById('month')
const totalSpentEl = document.getElementById('totalSpent')
const expenseCountEl = document.getElementById('expenseCount')
const friendsList = document.getElementById('friendsList')
const spenderSel = document.getElementById('spender')
const dateInput = document.getElementById('date')
const ledgerTable = document.getElementById('ledgerTable').querySelector('tbody')

// ledger filter elements - will be initialized after DOM loads
let ledgerSearch, filterSpender, filterType, filterFrom, filterTo, clearFiltersBtn
let filtersBound = false

function initFilterElements(){
  ledgerSearch = document.getElementById('ledgerSearch')
  filterSpender = document.getElementById('filterSpender')
  filterType = document.getElementById('filterType')
  filterFrom = document.getElementById('filterFrom')
  filterTo = document.getElementById('filterTo')
  clearFiltersBtn = document.getElementById('clearFilters')
  
  console.log('Filter elements initialized:', {
    ledgerSearch: !!ledgerSearch,
    filterSpender: !!filterSpender,
    filterType: !!filterType,
    filterFrom: !!filterFrom,
    filterTo: !!filterTo,
    clearFiltersBtn: !!clearFiltersBtn
  })
}

function bindLedgerFilters(){
  if(filtersBound) return
  
  if(!ledgerSearch) initFilterElements()
  
  if(ledgerSearch) {
    ledgerSearch.addEventListener('input', ()=> {
      console.log('Search input:', ledgerSearch.value)
      render()
    })
  }
  if(filterSpender) {
    filterSpender.addEventListener('change', ()=> {
      console.log('Spender filter:', filterSpender.value)
      render()
    })
  }
  if(filterType) {
    filterType.addEventListener('change', ()=> {
      console.log('Type filter:', filterType.value)
      render()
    })
  }
  if(filterFrom) filterFrom.addEventListener('change', ()=> render())
  if(filterTo) filterTo.addEventListener('change', ()=> render())
  if(clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', ()=>{
      console.log('Clearing filters')
      if(ledgerSearch) ledgerSearch.value = ''
      if(filterSpender) filterSpender.value = 'all'
      if(filterType) filterType.value = 'all'
      if(filterFrom) filterFrom.value = ''
      if(filterTo) filterTo.value = ''
      render()
    })
  }
  filtersBound = true
  console.log('Filter listeners bound successfully')
}

// Firebase functions for data persistence
async function loadState(){
  try {
    // Wait for Firebase to be initialized
    while (!window.db) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const docRef = window.firestoreDoc(window.db, 'canteen', 'expenses');
    const docSnap = await window.firestoreGetDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // Return default data if document doesn't exist
      console.log('No existing data found, using defaults');
      return DEFAULT;
    }
  } catch (error) {
    console.error('Error loading state from Firebase:', error);
    throw new Error('Failed to load state from Firebase: ' + error.message);
  }
}

async function saveState(){
  try {
    // Wait for Firebase to be initialized
    while (!window.db) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const docRef = window.firestoreDoc(window.db, 'canteen', 'expenses');
    await window.firestoreSetDoc(docRef, state);
    console.log('State saved to Firebase successfully');
  } catch (error) {
    console.error('Error saving state to Firebase:', error);
    throw new Error('Failed to save state to Firebase: ' + error.message);
  }
}

// because loadState is now async, call and render on ready
(async function init(){
  try{
    state = await loadState()
    render()
    // bind filter listeners after initial render
    try{ bindLedgerFilters() }catch(e){ console.warn('bindLedgerFilters failed', e) }
  }catch(e){
    alert('Failed to load data from server: ' + e.message)
  }
})()

function render(){
  totalFundEl.textContent = `₹${state.fund}`
  remainingEl.textContent = `₹${state.remaining}`
  monthEl.textContent = state.month

  // stats
  // total spent should exclude fund/top-up entries
  const totalSpent = state.expenses.reduce((s,e)=> e && e.type === 'fund' ? s : s + (Number(e.amount)||0), 0)
  if(totalSpentEl) totalSpentEl.textContent = `₹${totalSpent.toFixed(2)}`
  if(expenseCountEl) expenseCountEl.textContent = `${state.expenses.length} expense${state.expenses.length===1?'':'s'}`

  // friends
  friendsList.innerHTML = ''
  state.friends.forEach(f=>{
    const div = document.createElement('div')
    div.className = 'friend'
    div.innerHTML = `<div class="name">${f.name}</div><div class="spent">₹${f.spent}</div>`
    friendsList.appendChild(div)
  })

  // spender options
  spenderSel.innerHTML = ''
  state.friends.forEach(f=>{
    const opt = document.createElement('option')
    opt.value = f.name
    opt.textContent = f.name
    spenderSel.appendChild(opt)
  })

  // ensure filter elements are initialized
  if(!filterSpender) initFilterElements()
  
  // populate filterSpender
  if(filterSpender){
    const currentValue = filterSpender.value || 'all'
    filterSpender.innerHTML = '<option value="all">All spenders</option>'
    state.friends.forEach(f=>{
      const o = document.createElement('option')
      o.value = f.name
      o.textContent = f.name
      filterSpender.appendChild(o)
    })
    filterSpender.value = currentValue
  }

  // ledger with filters applied
  ledgerTable.innerHTML = ''
  // read filters
  const q = ledgerSearch && ledgerSearch.value ? ledgerSearch.value.trim().toLowerCase() : ''
  const spenderFilter = filterSpender && filterSpender.value ? filterSpender.value : 'all'
  const typeFilter = filterType && filterType.value ? filterType.value : 'all'
  const fromDate = filterFrom && filterFrom.value ? filterFrom.value : null
  const toDate = filterTo && filterTo.value ? filterTo.value : null
  
  console.log('Active filters:', { q, spenderFilter, typeFilter, fromDate, toDate })

  state.expenses.slice().reverse().forEach((exp, revIdx)=>{
    const idx = state.expenses.length - 1 - revIdx // original index
    // apply filters
    if(typeFilter !== 'all'){
      if(typeFilter === 'expense' && exp.type === 'fund') return
      if(typeFilter === 'fund' && exp.type !== 'fund') return
    }
    if(spenderFilter !== 'all'){
      if(exp.spender !== spenderFilter) return
    }
    if(fromDate && exp.date < fromDate) return
    if(toDate && exp.date > toDate) return
    if(q){
      const itemsStr = exp.items && exp.items.length ? exp.items.map(i=>`${i.name} x${i.qty} ₹${(i.price).toFixed(2)}`).join('; ') : ''
      const hay = `${exp.date} ${exp.spender || ''} ${exp.description || ''} ${itemsStr} ${exp.amount}`.toLowerCase()
      if(!hay.includes(q)) return
    }
    const tr = document.createElement('tr')
    const itemsText = exp.items && exp.items.length ? exp.items.map(i=>`${i.name} x${i.qty} ₹${(i.price).toFixed(2)}`).join('; ') : ''
    const desc = [exp.description || '', itemsText].filter(Boolean).join(' — ')
    // If this is a fund/top-up entry, render differently
    if(exp.type === 'fund'){
      tr.innerHTML = `<td>${exp.date}</td><td>Top-up</td><td style="color:var(--accent-2);font-weight:700">+₹${(exp.amount).toFixed(2)}</td><td>${desc || 'Added funds'}</td><td><button data-idx="${idx}" class="btn btn-danger delete-exp">Delete</button></td>`
    } else {
      tr.innerHTML = `<td>${exp.date}</td><td>${exp.spender}</td><td>₹${exp.amount}</td><td>${desc}</td><td><button data-idx="${idx}" class="btn btn-danger delete-exp">Delete</button></td>`
    }
    ledgerTable.appendChild(tr)
  })

  // attach delete handler using modal confirmation
  ledgerTable.querySelectorAll('.delete-exp').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const i = Number(e.target.getAttribute('data-idx'))
      showConfirm(`Delete this expense on ${state.expenses[i].date} by ${state.expenses[i].spender || 'Top-up'} for ₹${state.expenses[i].amount}?`, async (ok)=>{
        if(!ok) return
        // perform deletion
        const exp = state.expenses[i]
        state.expenses.splice(i,1)
        if(exp.type === 'fund'){
          state.fund = Math.round((state.fund - exp.amount)*100)/100
          state.remaining = Math.round((state.remaining - exp.amount)*100)/100
        } else {
          state.remaining = Math.round((state.remaining + exp.amount)*100)/100
          const fr = state.friends.find(f=>f.name===exp.spender)
          if(fr) fr.spent = Math.round((fr.spent - exp.amount)*100)/100
        }
        try{
          await saveState()
          render()
        }catch(err){
          alert('Failed to delete: '+err.message)
        }
      })
    })
  })

  // end of render
}

// form defaults
(function setDateDefault(){
  const today = new Date().toISOString().slice(0,10)
  dateInput.value = today
})()

// items state for current form
let currentItems = []

const itemNameInput = document.getElementById('itemName')
const itemQtyInput = document.getElementById('itemQty')
const itemPriceInput = document.getElementById('itemPrice')
const addItemBtn = document.getElementById('addItemBtn')
const itemsListEl = document.getElementById('itemsList')
const subtotalEl = document.getElementById('subtotal')
const amountInput = document.getElementById('amount')

// ensure elements exist
if(!itemsListEl){
  console.warn('itemsList element missing')
}

// override existing addItem and renderItems behavior to handle mobile better
function renderItems(){
  if(!itemsListEl) return
  itemsListEl.innerHTML = ''
  let sum = 0
  currentItems.forEach((it, idx)=>{
    const row = document.createElement('div')
    row.className = 'item-row'
    row.innerHTML = `<div style="flex:1;min-width:0">${escapeHtml(it.name)} x${it.qty} • ₹${(it.price).toFixed(2)}</div><div style="margin-left:8px"><button data-idx="${idx}" class="btn btn-ghost remove-item">Remove</button></div>`
    itemsListEl.appendChild(row)
    sum += it.qty * it.price
  })
  subtotalEl.textContent = `₹${sum.toFixed(2)}`
  amountInput.value = sum ? sum.toFixed(2) : ''
}

function escapeHtml(text){
  return text.replace(/[&<>"']/g, function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]})
}

// handle form reset
expenseForm.addEventListener('reset', ()=>{
  currentItems = []
  renderItems()
})

addItemBtn.addEventListener('click', e=>{
  e.preventDefault()
  const name = itemNameInput.value.trim()
  const qty = parseFloat(itemQtyInput.value) || 0
  const price = parseFloat(itemPriceInput.value) || 0
  if(!name || qty<=0 || price<=0){ return alert('Enter valid item, qty and price') }
  currentItems.push({ name, qty, price })
  itemNameInput.value = ''
  itemQtyInput.value = 1
  itemPriceInput.value = ''
  renderItems()
})

itemsListEl.addEventListener('click', e=>{
  if(e.target.classList.contains('remove-item')){
    const idx = Number(e.target.getAttribute('data-idx'))
    currentItems.splice(idx,1)
    renderItems()
  }
})

// handlers
document.getElementById('expenseForm').addEventListener('submit', e=>{
  e.preventDefault()
  const spender = spenderSel.value
  const amount = parseFloat(amountInput.value)
  const description = document.getElementById('description').value
  const date = dateInput.value
  if(!spender || !amount || amount<=0) return alert('Please provide valid values')

  // create expense object including items
  const expense = { date, spender, amount, description, items: currentItems.slice() }
  state.expenses.push(expense)
  state.remaining = Math.round((state.remaining - amount)*100)/100
  const friend = state.friends.find(f=>f.name===spender)
  if(friend) friend.spent = Math.round((friend.spent + amount)*100)/100
  saveState()
  render()
  // clear items
  currentItems = []
  renderItems()
  e.target.reset()
  dateInput.value = new Date().toISOString().slice(0,10)
})

// start new month
document.getElementById('startMonth').addEventListener('click', ()=>{
  if(!confirm('Start new month? This will reset fund to ₹5000 and clear expenses.')) return
  state.month = new Date().toISOString().slice(0,7)
  state.fund = DEFAULT.fund
  state.remaining = DEFAULT.remaining
  state.expenses = []
  state.friends.forEach(f=> f.spent = 0)
  saveState()
  render()
})

// export JSON
document.getElementById('exportBtn').addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `grocery-ledger-${state.month}.json`
  a.click()
  URL.revokeObjectURL(url)
})

// export XLSX
document.getElementById('exportXlsxBtn').addEventListener('click', ()=>{
  try {
    // Create workbook
    const wb = XLSX.utils.book_new()
    
    // Summary sheet
    const summaryData = [
      ['Month', state.month],
      ['Total Fund', `₹${state.fund}`],
      ['Remaining', `₹${state.remaining}`],
      ['Total Spent', `₹${state.fund - state.remaining}`],
      [''],
      ['Friends Summary', ''],
      ['Name', 'Amount Spent']
    ]
    
    state.friends.forEach(friend => {
      summaryData.push([friend.name, `₹${friend.spent}`])
    })
    
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary')
    
    // Expenses sheet
    const expensesData = [
      ['Date', 'Spender', 'Amount', 'Description', 'Items Details']
    ]
    
    state.expenses.forEach(expense => {
      const itemsText = expense.items && expense.items.length 
        ? expense.items.map(item => `${item.name} x${item.qty} ₹${item.price}`).join('; ')
        : ''
      
      expensesData.push([
        expense.date,
        expense.spender,
        `₹${expense.amount}`,
        expense.description || '',
        itemsText
      ])
    })
    
    const expensesWs = XLSX.utils.aoa_to_sheet(expensesData)
    XLSX.utils.book_append_sheet(wb, expensesWs, 'Expenses')
    
    // Detailed Items sheet
    const itemsData = [
      ['Date', 'Spender', 'Item Name', 'Quantity', 'Price', 'Total', 'Expense Description']
    ]
    
    state.expenses.forEach(expense => {
      if (expense.items && expense.items.length > 0) {
        expense.items.forEach(item => {
          itemsData.push([
            expense.date,
            expense.spender,
            item.name,
            item.qty,
            `₹${item.price}`,
            `₹${item.qty * item.price}`,
            expense.description || ''
          ])
        })
      } else {
        // For expenses without item details
        itemsData.push([
          expense.date,
          expense.spender,
          'General Expense',
          1,
          `₹${expense.amount}`,
          `₹${expense.amount}`,
          expense.description || ''
        ])
      }
    })
    
    const itemsWs = XLSX.utils.aoa_to_sheet(itemsData)
    XLSX.utils.book_append_sheet(wb, itemsWs, 'Item Details')
    
    // Monthly Analysis sheet
    const monthlyData = [
      ['Monthly Analysis', ''],
      ['Total Expenses by Friend', ''],
      ['Friend', 'Amount', 'Percentage of Total']
    ]
    
    const totalSpent = state.fund - state.remaining
    state.friends.forEach(friend => {
      const percentage = totalSpent > 0 ? ((friend.spent / totalSpent) * 100).toFixed(1) : 0
      monthlyData.push([
        friend.name,
        `₹${friend.spent}`,
        `${percentage}%`
      ])
    })
    
    monthlyData.push(['', '', ''])
    monthlyData.push(['Daily Spending Analysis', '', ''])
    monthlyData.push(['Date', 'Total Spent', 'Number of Transactions'])
    
    // Group expenses by date
    const dailySpending = {}
    state.expenses.forEach(expense => {
      if (!dailySpending[expense.date]) {
        dailySpending[expense.date] = { total: 0, count: 0 }
      }
      dailySpending[expense.date].total += expense.amount
      dailySpending[expense.date].count += 1
    })
    
    Object.keys(dailySpending).sort().forEach(date => {
      monthlyData.push([
        date,
        `₹${dailySpending[date].total}`,
        dailySpending[date].count
      ])
    })
    
    const monthlyWs = XLSX.utils.aoa_to_sheet(monthlyData)
    XLSX.utils.book_append_sheet(wb, monthlyWs, 'Analysis')
    
    // Generate and download file
    const filename = `canteen-expenses-${state.month}.xlsx`
    XLSX.writeFile(wb, filename)
    
    // Show success message
    alert(`📊 Excel file "${filename}" has been downloaded successfully!\n\nThe file contains 4 sheets:\n• Summary - Overview and friend totals\n• Expenses - All transactions\n• Item Details - Individual item breakdown\n• Analysis - Monthly spending analysis`)
    
  } catch (error) {
    console.error('XLSX Export Error:', error)
    alert('❌ Failed to export Excel file. Please try again or use JSON export as backup.')
  }
})

// import
document.getElementById('importFile').addEventListener('change', e=>{
  const file = e.target.files[0]
  if(!file) return
  const reader = new FileReader()
  reader.onload = ()=>{
    try{
      const data = JSON.parse(reader.result)
      // basic validation
      if(!data.fund || !Array.isArray(data.friends)) throw new Error('Invalid format')
      state = data
      saveState()
      render()
      alert('Imported successfully')
    }catch(err){
      alert('Failed to import: '+err.message)
    }
  }
  reader.readAsText(file)
})

// Add funds handler (improved UX)
const addFundBtn = document.getElementById('addFundBtn')
const addFundAmount = document.getElementById('addFundAmount')
addFundBtn.addEventListener('click', async ()=>{
  const raw = addFundAmount.value
  const v = parseFloat(raw)
  if(Number.isNaN(v) || v <= 0){
    return alert('Enter a valid amount greater than 0')
  }

  // Round to two decimals
  const amount = Math.round(v * 100) / 100

  // Double-check with user
  const ok = confirm(`Add funds: ₹${amount.toFixed(2)} to total fund?`)
  if(!ok) return

  // Disable button while saving
  addFundBtn.disabled = true
  addFundBtn.textContent = 'Adding...'

  state.fund = Math.round((state.fund + amount)*100)/100
  state.remaining = Math.round((state.remaining + amount)*100)/100
  try{
    // record as a fund/top-up entry so it appears in the ledger
    const fundEntry = { date: new Date().toISOString().slice(0,10), type: 'fund', amount, description: 'Added funds', spender: 'Top-up', items: [] }
    state.expenses.push(fundEntry)
    await saveState()
    render()
    addFundAmount.value = ''
    alert(`✅ Added ₹${amount.toFixed(2)} to fund`)
  }catch(err){
    console.error('Add fund error:', err)
    alert('❌ Failed to add funds: '+err.message)
  }finally{
    addFundBtn.disabled = false
    addFundBtn.textContent = 'Add'
  }
})

// -------------------------
// Reports & Insights wiring
// -------------------------
function isoDateNDaysAgo(n){
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0,10)
}

function renderReportResults(summary, periodText){
  const el = document.getElementById('reportResults')
  if(!el) return
  el.innerHTML = ''
  const wrap = document.createElement('div')
  wrap.className = 'report-summary'
  const text = Analytics.generateTemplateSummary(summary, periodText)
  const pre = document.createElement('pre')
  pre.style.whiteSpace = 'pre-wrap'
  pre.textContent = text
  wrap.appendChild(pre)

  // breakdown by category
  const breakdown = document.createElement('div')
  breakdown.className = 'report-breakdown'
  for(const [cat, amt] of Object.entries(summary.byCategory)){
    const pill = document.createElement('div')
    pill.className = 'report-pill'
    pill.innerHTML = `<strong>${cat}</strong><div>₹${Math.round(amt)}</div>`
    breakdown.appendChild(pill)
  }
  wrap.appendChild(breakdown)
  el.appendChild(wrap)
}

document.getElementById('report7').addEventListener('click', ()=>{
  try{
    const from = isoDateNDaysAgo(6) // last 7 days inclusive
    const to = new Date().toISOString().slice(0,10)
    const ex = Analytics.filterByRange(state.expenses, from, to)
    const summary = Analytics.summarize(ex)
    renderReportResults(summary, `Last 7 days (${from} → ${to})`)
  }catch(err){
    const el = document.getElementById('reportResults')
    if(el) el.textContent = 'Failed to generate report: ' + err.message
    console.error('report7 error', err)
  }
})

document.getElementById('report30').addEventListener('click', ()=>{
  try{
    const from = isoDateNDaysAgo(29)
    const to = new Date().toISOString().slice(0,10)
    const ex = Analytics.filterByRange(state.expenses, from, to)
    const summary = Analytics.summarize(ex)
    renderReportResults(summary, `Last 30 days (${from} → ${to})`)
  }catch(err){
    const el = document.getElementById('reportResults')
    if(el) el.textContent = 'Failed to generate report: ' + err.message
    console.error('report30 error', err)
  }
})

document.getElementById('reportCustom').addEventListener('click', ()=>{
  try{
    const from = document.getElementById('reportFrom').value
    const to = document.getElementById('reportTo').value
    if(!from || !to) return alert('Choose both From and To dates')
    const ex = Analytics.filterByRange(state.expenses, from, to)
    const summary = Analytics.summarize(ex)
    renderReportResults(summary, `${from} → ${to}`)
  }catch(err){
    const el = document.getElementById('reportResults')
    if(el) el.textContent = 'Failed to generate report: ' + err.message
    console.error('reportCustom error', err)
  }
})

// Debug helpers: log focus/click events to help diagnose input issues
if(addFundAmount){
  addFundAmount.addEventListener('focus', ()=>console.log('addFundAmount focused'))
  addFundAmount.addEventListener('click', ()=>console.log('addFundAmount clicked'))
}

// ensure final render and filter binding after DOM is fully ready
setTimeout(()=>{
  try{ 
    // final render to make sure everything is displayed
    render()
    // bind filters after DOM is ready
    if(!filtersBound) {
      bindLedgerFilters()
    }
    // add UI loaded class for animations
    document.documentElement.classList.add('ui-loaded') 
  }catch(e){
    console.warn('Final initialization failed:', e)
  }
}, 100)

// Theme toggle: persist preference in localStorage
const themeToggleBtn = document.getElementById('themeToggle')
function applyTheme(theme){
  if(theme === 'dark'){
    document.documentElement.classList.add('dark')
    if(themeToggleBtn) themeToggleBtn.setAttribute('aria-pressed','true')
    if(themeToggleBtn) themeToggleBtn.textContent = '☀️'
  } else {
    document.documentElement.classList.remove('dark')
    if(themeToggleBtn) themeToggleBtn.setAttribute('aria-pressed','false')
    if(themeToggleBtn) themeToggleBtn.textContent = '🌙'
  }
}

// load saved theme or system preference
(function initTheme(){
  const saved = localStorage.getItem('canteen_theme')
  if(saved){ console.log('initTheme: saved theme', saved); applyTheme(saved); return }
  // No saved preference — default the entire scheme to dark
  const defaultTheme = 'dark'
  console.log('initTheme: no saved theme, defaulting to', defaultTheme)
  applyTheme(defaultTheme)
  try{ localStorage.setItem('canteen_theme', defaultTheme) }catch(e){ console.warn('Could not persist default theme', e) }
})()

if(themeToggleBtn){
  themeToggleBtn.addEventListener('click', ()=>{
    console.log('themeToggle clicked — before:', document.documentElement.className)
    // toggle class directly and apply theme to keep UI in sync
    const nowDark = document.documentElement.classList.toggle('dark')
    const newTheme = nowDark ? 'dark' : 'light'
    console.log('themeToggle result — nowDark:', nowDark)
    applyTheme(newTheme)
    try{ localStorage.setItem('canteen_theme', newTheme) }catch(e){ console.warn('Failed to save theme:', e) }
  })
}

// Confirmation modal helpers
const confirmModal = document.getElementById('confirmModal')
const confirmMessageEl = document.getElementById('confirmMessage')
const confirmOkBtn = document.getElementById('confirmOk')
const confirmCancelBtn = document.getElementById('confirmCancel')

function showConfirm(message, callback){
  if(!confirmModal) return callback(true)
  confirmMessageEl.textContent = message
  confirmModal.setAttribute('aria-hidden','false')
  // temporary handlers
  function ok(){ cleanup(); callback(true) }
  function cancel(){ cleanup(); callback(false) }
  function cleanup(){
    confirmOkBtn.removeEventListener('click', ok)
    confirmCancelBtn.removeEventListener('click', cancel)
    confirmModal.setAttribute('aria-hidden','true')
  }
  confirmOkBtn.addEventListener('click', ok)
  confirmCancelBtn.addEventListener('click', cancel)
}
