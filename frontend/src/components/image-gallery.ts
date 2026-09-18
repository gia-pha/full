import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type GalleryVariant = 'grid' | 'strip';

@customElement('app-image-gallery')
export class AppImageGallery extends LitElement {
  @property({ type: Array }) images: string[] = [];
  @property({ type: String }) variant: GalleryVariant = 'grid';
  @property({ type: String }) alt = '';

  override createRenderRoot() {
    return this;
  }

  override render() {
    if (!this.images || this.images.length === 0) return html``;

    if (this.variant === 'strip') {
      return html`
        <div class="flex gap-3 overflow-x-auto pb-2">
          ${this.images.map(
            (img) => html`
              <div
                class="w-36 h-24 lg:w-48 lg:h-32 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0"
              >
                <img
                  src=${img}
                  alt=${this.alt}
                  class="w-full h-full object-cover hover:scale-105 transition-transform"
                  loading="lazy"
                />
              </div>
            `,
          )}
        </div>
      `;
    }

    return html`
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        ${this.images.map(
          (img) => html`
            <div
              class="aspect-video bg-gray-100 dark:bg-gray-700 rounded-2xl overflow-hidden"
            >
              <img
                src=${img}
                alt=${this.alt}
                class="w-full h-full object-cover hover:scale-105 transition-transform"
                loading="lazy"
              />
            </div>
          `,
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-image-gallery': AppImageGallery;
  }
}
