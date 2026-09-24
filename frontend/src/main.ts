import { html, render } from 'lit';
import './styles/main.css';
import './router/app-router.js';

render(
  html`<app-router class="block min-h-screen"></app-router>`,
  document.getElementById('app')!,
);
