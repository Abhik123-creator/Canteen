// analytics.js
// Client-side analytics utilities for Canteen expense tracker

(function(global){
  function normalizeText(s){
    if(!s) return ''
    return s.toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim()
  }

  // Very small keyword-based category mapping as fallback
  const CATEGORY_MAP = {
    food: ['restaurant','dinner','lunch','breakfast','coffee','pizza','burger','cafe','canteen','tea','snack','snacks'],
    groceries: ['grocery','groceries','supermarket','veg','vegetables','fruits'],
    transport: ['uber','ola','taxi','bus','fuel','petrol','diesel','train','metro','auto'],
    bills: ['electricity','internet','phone','bill','rent','subscription'],
    entertainment: ['movie','netflix','concert','party','games','game'],
    shopping: ['amazon','flipkart','shop','shopping','clothes'],
    other: []
  }

  function guessCategory(description){
    const txt = normalizeText(description)
    if(!txt) return 'other'
    for(const [cat, words] of Object.entries(CATEGORY_MAP)){
      for(const w of words){
        if(txt.includes(w)) return cat
      }
    }
    return 'other'
  }

  // Aggregate expenses in a date range (inclusive)
  function filterByRange(expenses, startDate, endDate){
    if(!startDate && !endDate) return expenses.slice()
    const s = startDate ? new Date(startDate) : null
    const e = endDate ? new Date(endDate) : null
    return expenses.filter(ex=>{
      const d = new Date(ex.date)
      if(s && d < s) return false
      if(e && d > e) return false
      return true
    })
  }

  function summarize(expenses){
    // expenses assumed to be array of { amount, date, spender, description, items, type }
    const result = {
      total: 0,
      byCategory: {},
      bySpender: {},
      count: expenses.length,
      topExpenses: [],
    }

    expenses.forEach(ex=>{
      const amt = Number(ex.amount) || 0
      result.total += amt
      const cat = ex.type === 'fund' ? 'funds' : (ex.category || guessCategory(ex.description || (ex.items && ex.items.map(i=>i.name).join(' ')) || 'other'))
      result.byCategory[cat] = (result.byCategory[cat]||0) + amt
      result.bySpender[ex.spender || 'Unknown'] = (result.bySpender[ex.spender]||0) + amt
    })

    // top expenses
    result.topExpenses = expenses.slice().sort((a,b)=>b.amount - a.amount).slice(0,5)

    // compute averages and simple anomalies (anything > mean + 2*stddev per category)
    result.categoryStats = {}
    for(const [cat, total] of Object.entries(result.byCategory)){
      // find expenses in category
      const catEx = expenses.filter(e => ((e.category || guessCategory(e.description||'')) === cat))
      const amounts = catEx.map(e=>Number(e.amount)||0)
      const mean = amounts.reduce((s,a)=>s+a,0)/Math.max(1,amounts.length)
      const variance = amounts.reduce((s,a)=>s + Math.pow(a-mean,2),0)/Math.max(1,amounts.length)
      const stddev = Math.sqrt(variance)
      result.categoryStats[cat] = { total, mean, stddev }
    }

    return result
  }

  function generateTemplateSummary(summary, periodText){
    const total = Math.round(summary.total)
    const topCategory = Object.entries(summary.byCategory).sort((a,b)=>b[1]-a[1])[0]
    const topSpender = Object.entries(summary.bySpender).sort((a,b)=>b[1]-a[1])[0]

    let lines = []
    lines.push(`Summary for ${periodText}:`)
    lines.push(`• Total spent: ₹${total}`)
    if(topCategory) lines.push(`• Top category: ${topCategory[0]} (₹${Math.round(topCategory[1])})`)
    if(topSpender) lines.push(`• Top spender: ${topSpender[0]} (₹${Math.round(topSpender[1])})`)
    lines.push(`• Number of transactions: ${summary.count}`)

    // simple anomalies
    const anomalies = []
    for(const [cat, stats] of Object.entries(summary.categoryStats)){
      if(stats.mean + 2*stats.stddev < (summary.byCategory[cat]||0)){
        anomalies.push(`${cat} looks elevated vs average`)
      }
    }
    if(anomalies.length) lines.push(`• Quick insights: ${anomalies.join('; ')}`)

    return lines.join('\n')
  }

  // expose API
  global.Analytics = {
    guessCategory,
    filterByRange,
    summarize,
    generateTemplateSummary
  }
})(window);