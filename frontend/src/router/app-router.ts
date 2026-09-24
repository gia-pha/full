import { Router } from '@lit-labs/router';
import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import '../pages/login-page.js';
import '../pages/register-page.js';

@customElement('app-router')
export class AppRouter extends LitElement {
  private readonly router = new Router(
    this,
    [
      { path: '/login', render: () => html`<login-page></login-page>` },
      {
        path: '/register',
        render: () => html`<register-page></register-page>`,
      },
    ],
    {
      fallback: {
        enter: () => {
          this.router.goto('/login');
          return false;
        },
      },
    },
  );

  override createRenderRoot() {
    return this;
  }

  override render() {
    return this.router.outlet();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-router': AppRouter;
  }
}
