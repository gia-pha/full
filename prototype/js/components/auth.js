class AuthComponent {
  constructor(container, store, t) {
    this.container = container;
    this.store = store;
    this.t = t;
    this.mode = 'login';
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div class="w-full max-w-md">
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">GP</div>
            <h1 class="text-2xl font-bold text-gray-800">${this.t.app.title}</h1>
            <p class="text-gray-500 mt-2">He thong quan ly ho toc Vi Viet</p>
          </div>
          <div class="bg-white rounded-2xl shadow-xl p-8">
            <div class="flex gap-2 mb-6">
              <button class="auth-tab flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${this.mode === 'login' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}" data-mode="login">Dang nhap</button>
              <button class="auth-tab flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${this.mode === 'register' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}" data-mode="register">Dang ky</button>
            </div>
            ${this.mode === 'login' ? `
              <div class="space-y-4">
                <div class="text-center py-8">
                  <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 11c0-3.5 3-3.5 3-3.5S18 7.5 18 11s-3 3.5-3 3.5V18m0 0h-4m4 0H8m4 0v-4"/></svg>
                  </div>
                  <p class="text-gray-600 text-sm">Dang nhap bang Passkey</p>
                  <p class="text-gray-400 text-xs mt-1">Van an de dunng vat nang hoac quet san tat</p>
                </div>
                <button class="auth-passkey-login w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-base transition-colors">🔐 Dung Passkey</button>
              </div>
            ` : `
              <form class="space-y-4 auth-form">
                <div class="text-center py-4">
                  <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 11c0-3.5 3-3.5 3-3.5S18 7.5 18 11s-3 3.5-3 3.5V18m0 0h-4m4 0H8m4 0v-4"/></svg>
                  </div>
                  <p class="text-gray-600 text-sm">Dang ky bang Passkey</p>
                  <p class="text-gray-400 text-xs mt-1">Tai lieu se dugc luu tru local tren thiet bi cua ban</p>
                </div>
                <div><label class="text-sm text-gray-600">${this.t.auth.name}</label><input type="text" required class="auth-name w-full mt-2 px-5 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ho ten" /></div>
                <button type="submit" class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-base transition-colors">🔐 Tao Passkey & Tham gia</button>
              </form>
            `}
          </div>
          <p class="mt-6 text-center text-sm text-gray-400">Gia Phai &copy; 2025</p>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.querySelectorAll('.auth-tab').forEach(tab => tab.addEventListener('click', () => { this.mode = tab.dataset.mode; this.render(); this.bindEvents(); }));
    this.container.querySelector('.auth-passkey-login')?.addEventListener('click', () => {
      this.store._state._authenticated = true;
      this.store._notify();
    });
    this.container.querySelector('.auth-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const name = this.container.querySelector('.auth-name')?.value;
      if (!name) return;
      this.store._state._authenticated = true;
      this.store._notify();
    });
  }

  updateTranslations(t) { this.t = t; this.render(); this.bindEvents(); }
}

export { AuthComponent };
