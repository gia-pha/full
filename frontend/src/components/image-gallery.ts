import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';
import type { Image } from '../types/index.js';

export type GalleryVariant = 'grid' | 'strip';

const CELL_CLASSES: Record<GalleryVariant, string> = {
  grid: 'aspect-video bg-gray-100 dark:bg-gray-700 rounded-2xl overflow-hidden',
  strip:
    'w-36 h-24 lg:w-48 lg:h-32 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0',
};

@customElement('app-image-gallery')
export class AppImageGallery extends LitElement {
  @property({ type: Array }) images: Image[] = [];
  @property({ type: String }) variant: GalleryVariant = 'grid';
  @property({ type: String }) alt = '';
  @property({ type: Boolean }) lightbox = true;

  pswp?: PhotoSwipeLightbox;

  override createRenderRoot() {
    return this;
  }

  override updated() {
    if (this.lightbox && !this.pswp) {
      const pswp = new PhotoSwipeLightbox({
        gallery: this,
        children: 'a',
        pswpModule: () => import('photoswipe'),
      });
      pswp.init();
      this.pswp = pswp;
    } else if (!this.lightbox && this.pswp) {
      this.pswp.destroy();
      this.pswp = undefined;
    }
  }

  override disconnectedCallback() {
    this.pswp?.destroy();
    this.pswp = undefined;
    super.disconnectedCallback();
  }

  private renderItem(item: Image): TemplateResult {
    const cell = CELL_CLASSES[this.variant] ?? CELL_CLASSES.grid;
    const content = html`
      <img
        src=${item.thumbnail}
        alt=${item.alt ?? this.alt}
        class="w-full h-full object-cover hover:scale-105 transition-transform"
        loading="lazy"
      />
    `;
    return this.lightbox
      ? html`<a
          href=${item.image}
          data-pswp-width=${item.width}
          data-pswp-height=${item.height}
          class="block ${cell}"
          >${content}</a
        >`
      : html`<div class="${cell}">${content}</div>`;
  }

  override render() {
    if (!this.images || this.images.length === 0) return html``;

    if (this.variant === 'strip') {
      return html`
        <div class="flex gap-3 overflow-x-auto pb-2">
          ${this.images.map((img) => this.renderItem(img))}
        </div>
      `;
    }

    return html`
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        ${this.images.map((img) => this.renderItem(img))}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-image-gallery': AppImageGallery;
  }
}
