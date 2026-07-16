import { html, render } from 'lit';
import './styles/main.css';

const template = () => html`
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <h1 class="text-2xl font-bold text-center py-4">Gia Phả</h1>
    </header>
    <main class="container mx-auto p-4">
      <p class="text-gray-600">Welcome</p>
    </main>
  </div>
`;

render(template(), document.getElementById('app')!);
