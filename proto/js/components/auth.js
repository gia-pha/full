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
        <div class="w-full max-w-sm sm:max-w-md">
          <div class="text-center mb-6 sm:mb-8">
            <div class="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4">GP</div>
            <h1 class="text-xl sm:text-2xl font-bold text-gray-800">${this.t.app.title}</h1>
            <p class="text-gray-500 mt-1.5 text-sm">He thong quan ly ho toc Vi Viet</p>
          </div>
          <div class="bg-white rounded-2xl shadow-xl p-5 sm:p-8">
            <div class="flex gap-2 mb-5 sm:mb-6">
              <button class="auth-tab flex-1 py-2.5 rounded-lg text-sm font-medium transition ${this.mode === 'login' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}" data-mode="login">${this.t.auth.login}</button>
              <button class="auth-tab flex-1 py-2.5 rounded-lg text-sm font-medium transition ${this.mode === 'register' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}" data-mode="register">${this.t.auth.register}</button>
            </div>
            ${this.mode === 'login' ? `
              <form class="space-y-4 auth-form">
                <div><label class="text-sm text-gray-600">${this.t.auth.email}</label><input type="email" class="w-full mt-1 px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="email@example.com" /></div>
                <div><label class="text-sm text-gray-600">${this.t.auth.password}</label><input type="password" class="w-full mt-1 px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="••••••••" /></div>
                <button type="submit" class="w-full py-3 bg-emerald-600 active:bg-emerald-700 text-white rounded-lg font-medium text-sm">${this.t.auth.login}</button>
              </form>
            ` : `
              <form class="space-y-4 auth-form">
                <div><label class="text-sm text-gray-600">${this.t.auth.name}</label><input type="text" class="w-full mt-1 px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ho ten" /></div>
                <div><label class="text-sm text-gray-600">${this.t.auth.email}</label><input type="email" class="w-full mt-1 px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="email@example.com" /></div>
                <div><label class="text-sm text-gray-600">${this.t.auth.password}</label><input type="password" class="w-full mt-1 px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="••••••••" /></div>
                <div><label class="text-sm text-gray-600">${this.t.auth.inviteCode}</label><input type="text" class="w-full mt-1 px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ma moi (neu co)" /></div>
                <button type="submit" class="w-full py-3 bg-emerald-600 active:bg-emerald-700 text-white rounded-lg font-medium text-sm">${this.t.auth.joinClan}</button>
              </form>
            `}
            <div class="mt-5 text-center"><button class="auth-forgot text-xs text-emerald-600 active:text-emerald-700">${this.t.auth.forgotPassword}</button></div>
          </div>
          <p class="mt-5 text-center text-xs text-gray-400">Gia Phai &copy; 2025</p>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => { this.mode = tab.dataset.mode; this.render(); this.bindEvents(); });
    });
    this.container.querySelector('.auth-form')?.addEventListener('submit', e => {
      e.preventDefault();
      this.store._state._authenticated = true;
      this.store._notify();
    });
    this.container.querySelector('.auth-forgot')?.addEventListener('click', () => alert('Da gui link dat lai (prototype)'));
  }

  updateTranslations(t) { this.t = t; this.render(); this.bindEvents(); }
}

export { AuthComponent };
