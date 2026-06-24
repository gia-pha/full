import { GpComponent } from './base.js';

class GpAuth extends GpComponent {
  get mode() { return this.getAttribute('mode') || 'login'; }
  set mode(v) { this.setAttribute('mode', v); }

  render() {
    this.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div class="w-full max-w-md">
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">GP</div>
            <h1 class="text-2xl font-bold text-gray-800">${this.t.app.title}</h1>
            <p class="text-gray-500 mt-2">${this.t.app.description}</p>
          </div>
          <div class="bg-white rounded-2xl shadow-xl p-8">
            <div class="flex gap-2 mb-6">
              <button class="auth-tab flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${this.mode === 'login' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}" data-mode="login">${this.t.auth.login}</button>
              <button class="auth-tab flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${this.mode === 'register' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}" data-mode="register">${this.t.auth.register}</button>
            </div>
            ${this.mode === 'login' ? `
              <div class="space-y-4">
                <div class="text-center py-8">
                  <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="w-8 h-8"><path d="M48 256c0-114.9 93.1-208 208-208 63.1 0 119.6 28.1 157.8 72.5 8.6 10.1 23.8 11.2 33.8 2.6s11.2-23.8 2.6-33.8C403.3 34.6 333.7 0 256 0 114.6 0 0 114.6 0 256l0 40c0 13.3 10.7 24 24 24s24-10.7 24-24l0-40z"/></svg></div>
                  <p class="text-gray-600 text-sm">${this.t.auth.loginWithPasskey}</p>
                  <p class="text-gray-400 text-xs mt-1">${this.t.auth.tapToUseDeviceOrFingerprint}</p>
                </div>
                <button class="auth-passkey-login w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-base transition-colors">🔐 ${this.t.auth.usePasskey}</button>
              </div>
            ` : `
              <form class="space-y-4 auth-form">
                <div class="text-center py-4">
                  <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="w-8 h-8"><path d="M48 256c0-114.9 93.1-208 208-208 63.1 0 119.6 28.1 157.8 72.5 8.6 10.1 23.8 11.2 33.8 2.6s11.2-23.8 2.6-33.8C403.3 34.6 333.7 0 256 0 114.6 0 0 114.6 0 256l0 40c0 13.3 10.7 24 24 24s24-10.7 24-24l0-40z"/></svg></div>
                  <p class="text-gray-600 text-sm">${this.t.auth.registerWithPasskey}</p>
                  <p class="text-gray-400 text-xs mt-1">${this.t.auth.dataSavedLocally}</p>
                </div>
                <div><label class="text-sm text-gray-600">${this.t.auth.name}</label><input type="text" required class="auth-name w-full mt-2 px-5 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="${this.t.auth.name}" /></div>
                <button type="submit" class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-base transition-colors">🔐 ${this.t.auth.createPasskeyAndJoin}</button>
              </form>
            `}
          </div>
          <p class="mt-6 text-center text-sm text-gray-400">Gia Phả &copy; 2025</p>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.querySelectorAll('.auth-tab').forEach(tab => tab.onclick = () => { this.mode = tab.dataset.mode; this.render(); this.bindEvents(); });
    this.querySelector('.auth-passkey-login')?.addEventListener('click', () => {
      this.store._state._authenticated = true;
      this.store._notify();
    });
    this.querySelector('.auth-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const name = this.querySelector('.auth-name')?.value;
      if (!name) return;
      this.store._state._authenticated = true;
      this.store._notify();
    });
  }
}

customElements.define('gp-auth', GpAuth);
export { GpAuth };
