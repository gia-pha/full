import { formatCurrency, getYearMonthKey } from '../utils/format.js';

class FundComponent {
  constructor(container, store, t) {
    this.container = container;
    this.store = store;
    this.t = t;
    this.render();
    this.bindEvents();
  }

  render() {
    const fund = this.store.getClanFund(this.store.state.currentClanId);
    if (!fund) { this.container.innerHTML = '<div class="p-6 text-center text-gray-400 text-sm">Khong co du lieu</div>'; return; }
    const allPersons = this.store.state.data?.persons || [];
    const allEvents = this.store.state.data?.events || [];
    const canManage = this.store.getCurrentPerson()?.role === 'treasurer' || this.store.getCurrentPerson()?.role === 'admin';
    const totalContrib = fund.transactions.filter(t => t.type === 'contribution').reduce((s, t) => s + t.amount, 0);
    const totalExpense = fund.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const monthly = {};
    fund.transactions.forEach(tx => {
      const k = getYearMonthKey(tx.date);
      if (!monthly[k]) monthly[k] = { contributions: 0, expenses: 0, label: k };
      if (tx.type === 'contribution') monthly[k].contributions += tx.amount;
      else monthly[k].expenses += tx.amount;
    });
    const monthlyData = Object.values(monthly).sort((a, b) => a.label.localeCompare(b.label));
    const maxVal = Math.max(...monthlyData.map(d => Math.max(d.contributions, d.expenses)), 1);

    this.container.innerHTML = `
      <div class="h-full overflow-y-auto bg-white pb-20 lg:pb-6">
        <div class="p-4 sm:p-6 border-b flex items-center justify-between">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-800">${this.t.fund.title}</h2>
          ${canManage ? `
            <div class="flex gap-2">
              <button class="fund-add-contrib px-3 py-2 bg-emerald-600 active:bg-emerald-700 text-white rounded-lg text-xs font-medium">+ Dong gap</button>
              <button class="fund-add-expense px-3 py-2 bg-red-600 active:bg-red-700 text-white rounded-lg text-xs font-medium">- Chi tieu</button>
            </div>
          ` : ''}
        </div>
        <div class="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div class="grid grid-cols-3 gap-2 sm:gap-4">
            <div class="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-3 sm:p-5 text-white">
              <p class="text-[10px] sm:text-sm opacity-80">${this.t.fund.balance}</p>
              <p class="text-sm sm:text-2xl font-bold truncate">${formatCurrency(fund.balance)}</p>
            </div>
            <div class="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-3 sm:p-5 text-white">
              <p class="text-[10px] sm:text-sm opacity-80">${this.t.fund.contributions}</p>
              <p class="text-sm sm:text-2xl font-bold truncate">${formatCurrency(totalContrib)}</p>
            </div>
            <div class="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-3 sm:p-5 text-white">
              <p class="text-[10px] sm:text-sm opacity-80">${this.t.fund.expenses}</p>
              <p class="text-sm sm:text-2xl font-bold truncate">${formatCurrency(totalExpense)}</p>
            </div>
          </div>
          ${monthlyData.length > 0 ? `
            <div>
              <h3 class="text-base sm:text-lg font-semibold text-gray-700 mb-3">${this.t.fund.chartTitle}</h3>
              <div class="bg-gray-50 rounded-xl p-3 border overflow-x-auto">
                <div class="min-w-fit">
                  <div class="flex items-end gap-1 sm:gap-3" style="height: 150px;">
                    ${monthlyData.map(d => {
                      const ch = (d.contributions / maxVal) * 120;
                      const eh = (d.expenses / maxVal) * 120;
                      return `
                        <div class="flex flex-col items-center gap-1 flex-1 min-w-[30px]">
                          <div class="flex items-end gap-0.5 sm:gap-1 flex-1" style="height:120px">
                            <div class="flex-1 bg-emerald-400 rounded-t active:bg-emerald-500 relative group" style="height:${ch}px">
                              <div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">${(d.contributions / 1e6).toFixed(0)}tr</div>
                            </div>
                            <div class="flex-1 bg-red-400 rounded-t active:bg-red-500 relative group" style="height:${eh}px">
                              <div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">${(d.expenses / 1e6).toFixed(0)}tr</div>
                            </div>
                          </div>
                          <span class="text-[9px] text-gray-400 truncate w-full text-center">${d.label.split('-').slice(1).join('/')}</span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                  <div class="flex items-center gap-4 mt-3 justify-center">
                    <div class="flex items-center gap-1"><div class="w-2.5 h-2.5 bg-emerald-400 rounded"></div><span class="text-[10px] text-gray-500">Dong gap</span></div>
                    <div class="flex items-center gap-1"><div class="w-2.5 h-2.5 bg-red-400 rounded"></div><span class="text-[10px] text-gray-500">Chi tieu</span></div>
                  </div>
                </div>
              </div>
            </div>
          ` : ''}
          <div>
            <h3 class="text-base sm:text-lg font-semibold text-gray-700 mb-3">${this.t.fund.transactions}</h3>
            <div class="border rounded-xl overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-xs sm:text-sm">
                  <thead class="bg-gray-50 border-b">
                    <tr>
                      <th class="text-left px-3 py-2 text-gray-500 font-medium">${this.t.fund.date}</th>
                      <th class="text-left px-3 py-2 text-gray-500 font-medium">${this.t.fund.description}</th>
                      <th class="text-right px-3 py-2 text-gray-500 font-medium">${this.t.fund.amount}</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${fund.transactions.slice().reverse().map(tx => {
                      const person = allPersons.find(p => p.id === tx.personId);
                      return `
                        <tr class="border-b border-gray-100 active:bg-gray-50">
                          <td class="px-3 py-2.5 text-gray-500 whitespace-nowrap">${tx.date}</td>
                          <td class="px-3 py-2.5">
                            <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium mr-1.5 ${tx.type === 'contribution' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}">${tx.type === 'contribution' ? '↗' : '↘'}</span>
                            <span class="truncate inline-block max-w-[150px] sm:max-w-none">${tx.description}</span>
                          </td>
                          <td class="px-3 py-2.5 text-right font-medium whitespace-nowrap ${tx.type === 'contribution' ? 'text-emerald-600' : 'text-red-600'}">${tx.type === 'contribution' ? '+' : '-'}${formatCurrency(tx.amount)}</td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.querySelector('.fund-add-contrib')?.addEventListener('click', () => {
      this.store.openModal('add-fund-transaction', { type: 'contribution', clanId: this.store.state.currentClanId });
    });
    this.container.querySelector('.fund-add-expense')?.addEventListener('click', () => {
      this.store.openModal('add-fund-transaction', { type: 'expense', clanId: this.store.state.currentClanId });
    });
  }

  updateTranslations(t) { this.t = t; this.render(); this.bindEvents(); }
}

export { FundComponent };
