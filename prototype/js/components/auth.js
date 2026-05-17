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
              <button class="auth-tab flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${this.mode === 'login' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}" data-mode="login">${this.t.auth.login}</button>
              <button class="auth-tab flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${this.mode === 'register' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}" data-mode="register">${this.t.auth.register}</button>
            </div>
            ${this.mode === 'login' ? `
              <form class="space-y-4 auth-form">
                <div><label class="text-sm text-gray-600">${this.t.auth.email}</label><input type="email" class="w-full mt-2 px-5 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="email@example.com" /></div>
                <div><label class="text-sm text-gray-600">${this.t.auth.password}</label><input type="password" class="w-full mt-2 px-5 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="••••••••" /></div>
                <button type="submit" class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-base transition-colors">${this.t.auth.login}</button>
              </form>
            ` : `
              <form class="space-y-4 auth-form">
                <div><label class="text-sm text-gray-600">${this.t.auth.name}</label><input type="text" class="w-full mt-2 px-5 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ho ten" /></div>
                <div><label class="text-sm text-gray-600">${this.t.auth.email}</label><input type="email" class="w-full mt-2 px-5 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="email@example.com" /></div>
                <div><label class="text-sm text-gray-600">${this.t.auth.password}</label><input type="password" class="w-full mt-2 px-5 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="••••••••" /></div>
                <div><label class="text-sm text-gray-600">${this.t.auth.inviteCode}</label><input type="text" class="w-full mt-2 px-5 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ma moi (neu co)" /></div>
                <button type="submit" class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-base transition-colors">${this.t.auth.joinClan}</button>
              </form>
            `}
            <div class="mt-6 text-center"><button class="auth-forgot text-sm text-emerald-600 hover:text-emerald-700">${this.t.auth.forgotPassword}</button></div>
          </div>
          <p class="mt-6 text-center text-sm text-gray-400">Gia Phai &copy; 2025</p>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.querySelectorAll('.auth-tab').forEach(tab => tab.addEventListener('click', () => { this.mode = tab.dataset.mode; this.render(); this.bindEvents(); }));
    this.container.querySelector('.auth-form')?.addEventListener('submit', e => { e.preventDefault(); this.store._state._authenticated = true; this.store._notify(); });
    this.container.querySelector('.auth-forgot')?.addEventListener('click', () => alert('Da gui link dat lai (prototype)'));
  }

  updateTranslations(t) { this.t = t; this.render(); this.bindEvents(); }
}

export { AuthComponent };
