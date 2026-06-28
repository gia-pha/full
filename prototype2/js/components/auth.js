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
      <div class="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-amber-50 flex items-center justify-center p-4">
        <div class="w-full max-w-md">
          <!-- Decorative header -->
          <div class="text-center mb-8">
            <div class="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-xl shadow-purple-200">
              GP
            </div>
            <h1 class="text-3xl font-bold font-serif text-gray-800">${this.t.app.title}</h1>
            <p class="text-gray-500 mt-2">${this.t.app.description}</p>
            <div class="ornament-divider mt-4 text-purple-300">✦</div>
          </div>

          <div class="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
            <div class="flex gap-2 mb-6">
              <button class="auth-tab flex-1 py-3 rounded-xl text-sm font-medium transition-all ${this.mode === 'login' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}" data-mode="login">${this.t.auth.login}</button>
              <button class="auth-tab flex-1 py-3 rounded-xl text-sm font-medium transition-all ${this.mode === 'register' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}" data-mode="register">${this.t.auth.register}</button>
            </div>
            ${this.mode === 'login' ? `
              <div class="space-y-4">
                <div class="text-center py-8">
                  <div class="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                  </div>
                  <p class="text-gray-600 text-sm">${this.t.auth.loginWithPasskey}</p>
                  <p class="text-gray-400 text-xs mt-1">${this.t.auth.tapToUseDeviceOrFingerprint}</p>
                </div>
                <button class="auth-passkey-login w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-medium text-base transition-all shadow-md shadow-purple-200">
                  <svg class="inline w-5 h-5 mr-2 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                  ${this.t.auth.usePasskey}
                </button>
              </div>
            ` : `
              <form class="space-y-4 auth-form">
                <div class="text-center py-4">
                  <div class="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                  </div>
                  <p class="text-gray-600 text-sm">${this.t.auth.registerWithPasskey}</p>
                  <p class="text-gray-400 text-xs mt-1">${this.t.auth.dataSavedLocally}</p>
                </div>
                <div><label class="text-sm text-gray-600 font-medium">${this.t.auth.name}</label><input type="text" required class="auth-name w-full mt-2 px-5 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-purple-500 bg-amber-50/30" placeholder="${this.t.auth.name}" /></div>
                <button type="submit" class="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-medium text-base transition-all shadow-md shadow-purple-200">
                  <svg class="inline w-5 h-5 mr-2 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                  ${this.t.auth.createPasskeyAndJoin}
                </button>
              </form>
            `}
          </div>
          <p class="mt-6 text-center text-sm text-gray-400 font-serif">Gia Phả &copy; 2025</p>
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
