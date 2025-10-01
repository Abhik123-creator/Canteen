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
const friendsList = document.getElementById('friendsList')
const spenderSel = document.getElementById('spender')
const dateInput = document.getElementById('date')
const ledgerTable = document.getElementById('ledgerTable').querySelector('tbody')

const API_URL = 'https://canteen-kru3.onrender.com/api/data'

// init
async function loadState(){
  try {
    const resp = await fetch(API_URL)
    if(resp.ok){
      const j = await resp.json()
      return j
    }
    throw new Error(`Server responded with status ${resp.status}`)
  } catch (error) {
    console.error('Error loading state:', error)
    throw new Error('Failed to load state from server')
  }
}

async function saveState(){
  try {
    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    })
    if(!resp.ok){
      throw new Error(`Server responded with status ${resp.status}`)
    }
  } catch (error) {
    console.error('Error saving state:', error)
    throw new Error('Failed to save state to server')
  }
}

// because loadState is now async, call and render on ready
(async function init(){
  try{
    state = await loadState()
    render()
  }catch(e){
    alert('Failed to load data from server: ' + e.message)
  }
})()

function render(){
  totalFundEl.textContent = `₹${state.fund}`
  remainingEl.textContent = `₹${state.remaining}`
  monthEl.textContent = state.month

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

  // ledger
  ledgerTable.innerHTML = ''
  state.expenses.slice().reverse().forEach(exp=>{
    const tr = document.createElement('tr')
    const itemsText = exp.items && exp.items.length ? exp.items.map(i=>`${i.name} x${i.qty} ₹${(i.price).toFixed(2)}`).join('; ') : ''
    const desc = [exp.description || '', itemsText].filter(Boolean).join(' — ')
    tr.innerHTML = `<td>${exp.date}</td><td>${exp.spender}</td><td>₹${exp.amount}</td><td>${desc}</td>`
    ledgerTable.appendChild(tr)
  })
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

// export
document.getElementById('exportBtn').addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `grocery-ledger-${state.month}.json`
  a.click()
  URL.revokeObjectURL(url)
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

// initial render
render()
