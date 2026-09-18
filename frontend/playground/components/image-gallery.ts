import type { TemplateResult } from 'lit';
import { html } from 'lit';
import type { GalleryVariant } from '../../src/components/image-gallery.js';
import { notify, state } from '../state.js';

const VARIANTS: GalleryVariant[] = ['grid', 'strip'];

function galleryImages(count: number): string[] {
  return Array.from(
    { length: count },
    (_, i) => `https://picsum.photos/seed/gallery${i + 1}/600/400`,
  );
}

export function imageGallerySection(): TemplateResult {
  const images = galleryImages(state.galleryCount);
  return html`
    <section
      class="bg-white os-dark:bg-gray-800 lg:col-span-2 rounded-xl shadow p-6 space-y-6"
    >
      <h2
        class="text-lg font-semibold text-gray-800 os-dark:text-gray-100 border-b border-gray-200 os-dark:border-gray-700 pb-2"
      >
        &lt;app-image-gallery&gt;
      </h2>

      <div class="flex flex-wrap gap-4">
        <div>
          <label
            class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Variant</label
          >
          <select
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value=${state.galleryVariant}
            @change=${(e: Event) => {
              state.galleryVariant = (e.target as HTMLSelectElement)
                .value as GalleryVariant;
              notify();
            }}
          >
            ${VARIANTS.map((v) => html`<option value=${v}>${v}</option>`)}
          </select>
        </div>
        <div>
          <label
            class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Image count</label
          >
          <input
            type="number"
            min="0"
            max="12"
            class="w-24 px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value=${state.galleryCount}
            @change=${(e: Event) => {
              const n = Number((e.target as HTMLInputElement).value);
              state.galleryCount = Number.isNaN(n)
                ? 0
                : Math.min(12, Math.max(0, n));
              notify();
            }}
          />
        </div>
      </div>

      <div class="space-y-3">
        <p class="text-sm text-gray-500 os-dark:text-gray-400">
          ${state.galleryVariant} · ${images.length} image${
            images.length === 1 ? '' : 's'
          }
        </p>
        <app-image-gallery
          .images=${images}
          variant=${state.galleryVariant}
          alt="Family photos"
        ></app-image-gallery>
        ${
          images.length === 0
            ? html`<p
                class="text-sm text-gray-400 os-dark:text-gray-500 italic"
              >
                (renders nothing when images is empty)
              </p>`
            : html``
        }
      </div>
    </section>
  `;
}
