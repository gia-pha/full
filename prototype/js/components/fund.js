import { GpComponent } from './base.js';
import { formatCurrency, formatDate, getYearMonthKey } from '../utils/format.js';

class GpFund extends GpComponent {
  render() {
    const fund = this.store.getClanFund(this.store.state.currentClanId);
    if (!fund) { this.innerHTML = '<div class="p-8 text-center text-gray-400">Khong co du lieu</div>'; return; }
    const allPersons = this.store.state.data?.persons || [];
    const allEvents = this.store.state.data?.events || [];
    const canManage = this.store.getCurrentPerson()?.data.role === 'treasurer' || this.store.getCurrentPerson()?.data.role === 'admin';
    const totalContrib = fund.transactions.filter(t => t.type === 'contribution').reduce((s, t) => s + t.amount, 0);
    const totalExpense = fund.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const monthly = {};
    fund.transactions.forEach(tx => { const k = getYearMonthKey(tx.date); if (!monthly[k]) monthly[k] = { contributions: 0, expenses: 0, label: k }; if (tx.type === 'contribution') monthly[k].contributions += tx.amount; else monthly[k].expenses += tx.amount; });
    const monthlyData = Object.values(monthly).sort((a, b) => a.label.localeCompare(b.label));
    const maxVal = Math.max(...monthlyData.map(d => Math.max(d.contributions, d.expenses)), 1);

    this.innerHTML = `
      <div class="h-full overflow-y-auto bg-white">
        <div class="p-4 sm:p-6 lg:p-8 border-b border-gray-200 flex items-center justify-between">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-800">${this.t.fund.title}</h2>
          ${canManage ? `<div class="flex gap-3"><button class="fund-add-contrib px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">+ ${this.t.fund.addContribution}</button><button class="fund-add-expense px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">- ${this.t.fund.addExpense}</button></div>` : ''}
        </div>
        <div class="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            <div class="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white"><p class="text-sm opacity-80 mb-2">${this.t.fund.balance}</p><p class="text-2xl lg:text-3xl font-bold">${formatCurrency(fund.balance)}</p></div>
            <div class="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white"><p class="text-sm opacity-80 mb-2">${this.t.fund.totalContributions}</p><p class="text-2xl lg:text-3xl font-bold">${formatCurrency(totalContrib)}</p></div>
            <div class="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-6 text-white"><p class="text-sm opacity-80 mb-2">${this.t.fund.totalExpenses}</p><p class="text-2xl lg:text-3xl font-bold">${formatCurrency(totalExpense)}</p></div>
          </div>
          ${monthlyData.length > 0 ? `<div><h3 class="text-lg font-semibold text-gray-700 mb-4">${this.t.fund.chartTitle}</h3><div class="bg-gray-50 rounded-2xl p-4 lg:p-6 border border-gray-200 overflow-x-auto"><div class="min-w-fit"><div class="flex items-end gap-3 lg:gap-6" style="height: 200px;">${monthlyData.map(d => { const ch = (d.contributions / maxVal) * 170; const eh = (d.expenses / maxVal) * 170; return `<div class="flex flex-col items-center gap-2 w-[50px] min-w-[50px]"><div class="flex items-end gap-1" style="height:170px"><div class="bg-emerald-400 rounded-t hover:bg-emerald-500 relative group cursor-pointer transition-colors" style="height:${ch}px;width:22px"><div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">${formatCurrency(d.contributions)}</div></div><div class="bg-red-400 rounded-t hover:bg-red-500 relative group cursor-pointer transition-colors" style="height:${eh}px;width:22px"><div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">${formatCurrency(d.expenses)}</div></div></div><span class="text-xs text-gray-500">${d.label}</span></div>`; }).join('')}</div><div class="flex items-center gap-6 mt-4 justify-center"><div class="flex items-center gap-2"><div class="w-3 h-3 bg-emerald-400 rounded"></div><span class="text-sm text-gray-500">${this.t.fund.contributions}</span></div><div class="flex items-center gap-2"><div class="w-3 h-3 bg-red-400 rounded"></div><span class="text-sm text-gray-500">${this.t.fund.expenses}</span></div></div></div></div></div>` : ''}
          <div><h3 class="text-lg font-semibold text-gray-700 mb-4">${this.t.fund.transactions}</h3><div class="border border-gray-200 rounded-2xl overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm"><thead class="bg-gray-50 border-b border-gray-200"><tr><th class="text-left px-4 lg:px-6 py-3 text-gray-500 font-medium">${this.t.fund.date}</th><th class="text-left px-4 lg:px-6 py-3 text-gray-500 font-medium">${this.t.fund.description}</th><th class="text-left px-4 lg:px-6 py-3 text-gray-500 font-medium hidden sm:table-cell">${this.t.fund.person}</th><th class="text-right px-4 lg:px-6 py-3 text-gray-500 font-medium">${this.t.fund.amount}</th></tr></thead><tbody>${fund.transactions.slice().reverse().map(tx => { const person = allPersons.find(p => p.id === tx.personId); const event = allEvents.find(e => e.id === tx.eventId); return `<tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors"><td class="px-4 lg:px-6 py-4 text-gray-500 whitespace-nowrap">${formatDate(tx.date)}</td><td class="px-4 lg:px-6 py-4"><span class="inline-block px-2 py-0.5 rounded text-xs font-medium mr-2 ${tx.type === 'contribution' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}">${tx.type === 'contribution' ? '↗' : '↘'}</span>${tx.description}${event ? ` <span class="text-xs text-gray-400">(${event.title})</span>` : ''}</td><td class="px-4 lg:px-6 py-4 text-gray-600 hidden sm:table-cell">${person ? person.data['first name'] + ' ' + person.data['last name'] : '-'}</td><td class="px-4 lg:px-6 py-4 text-right font-medium whitespace-nowrap ${tx.type === 'contribution' ? 'text-emerald-600' : 'text-red-600'}">${tx.type === 'contribution' ? '+' : '-'}${formatCurrency(tx.amount)}</td></tr>`; }).join('')}</tbody></table></div></div></div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.querySelector('.fund-add-contrib')?.addEventListener('click', () => this.store.openModal('add-fund-transaction', { type: 'contribution', clanId: this.store.state.currentClanId }));
    this.querySelector('.fund-add-expense')?.addEventListener('click', () => this.store.openModal('add-fund-transaction', { type: 'expense', clanId: this.store.state.currentClanId }));
  }
}

customElements.define('gp-fund', GpFund);
export { GpFund };
