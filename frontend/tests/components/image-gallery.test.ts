import { afterEach, describe, expect, it } from 'vitest';
import '../../src/components/image-gallery.js';
import type { AppImageGallery } from '../../src/components/image-gallery.js';
import type { GalleryImage } from '../../src/types/index.js';

const IMAGES: GalleryImage[] = [
  {
    image: 'https://picsum.photos/seed/img1/1500/1000',
    thumbnail: 'https://picsum.photos/seed/img1/300/200',
    width: 1500,
    height: 1000,
  },
  {
    image: 'https://picsum.photos/seed/img2/1500/1000',
    thumbnail: 'https://picsum.photos/seed/img2/300/200',
    width: 1500,
    height: 1000,
  },
  {
    image: 'https://picsum.photos/seed/img3/1500/1000',
    thumbnail: 'https://picsum.photos/seed/img3/300/200',
    width: 1500,
    height: 1000,
  },
];

async function renderComponent(opts?: {
  images?: GalleryImage[];
  variant?: 'grid' | 'strip';
  alt?: string;
  lightbox?: boolean;
}): Promise<AppImageGallery> {
  const el = document.createElement('app-image-gallery');
  if (opts?.images !== undefined) el.images = opts.images;
  if (opts?.variant !== undefined) el.variant = opts.variant;
  if (opts?.alt !== undefined) el.alt = opts.alt;
  if (opts?.lightbox !== undefined) el.lightbox = opts.lightbox;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

afterEach(() => {
  document.querySelectorAll('app-image-gallery').forEach((el) => {
    el.remove();
  });
});

describe('AppImageGallery', () => {
  it('renders nothing when images is empty', async () => {
    const el = await renderComponent({ images: [] });
    expect(el.querySelector('img')).toBeNull();
  });

  it('renders nothing when images is not set', async () => {
    const el = await renderComponent({});
    expect(el.querySelector('img')).toBeNull();
  });

  it('defaults to the grid variant', async () => {
    const el = await renderComponent({ images: IMAGES });
    expect(el.variant).toBe('grid');
    const grid = el.querySelector('.grid');
    expect(grid).not.toBeNull();
    expect(grid!.classList.contains('grid-cols-2')).toBe(true);
    expect(grid!.querySelectorAll('img')).toHaveLength(3);
  });

  it('renders grid items with aspect-video cells', async () => {
    const el = await renderComponent({ images: IMAGES });
    const cells = el.querySelectorAll('.grid > a');
    expect(cells).toHaveLength(3);
    expect(cells[0].classList.contains('aspect-video')).toBe(true);
  });

  it('renders the strip variant as a horizontal scroller', async () => {
    const el = await renderComponent({ images: IMAGES, variant: 'strip' });
    expect(el.querySelector('.grid')).toBeNull();
    const strip = el.querySelector('.flex.overflow-x-auto');
    expect(strip).not.toBeNull();
    expect(strip!.querySelectorAll('img')).toHaveLength(3);
    const cell = strip!.querySelector('a')!;
    expect(cell.classList.contains('w-36')).toBe(true);
    expect(cell.classList.contains('flex-shrink-0')).toBe(true);
  });

  it('sets thumbnail src and lazy loading on every image', async () => {
    const el = await renderComponent({ images: IMAGES });
    el.querySelectorAll('img').forEach((img, i) => {
      expect(img.getAttribute('src')).toBe(IMAGES[i].thumbnail);
      expect(img.getAttribute('loading')).toBe('lazy');
    });
  });

  it('applies the alt text to every image', async () => {
    const el = await renderComponent({ images: IMAGES, alt: 'Family photos' });
    el.querySelectorAll('img').forEach((img) => {
      expect(img.getAttribute('alt')).toBe('Family photos');
    });
  });

  it('prefers the per-image alt over the component alt', async () => {
    const el = await renderComponent({
      images: [{ ...IMAGES[0], alt: 'Wedding 1998' }],
      alt: 'Family photos',
    });
    expect(el.querySelector('img')!.getAttribute('alt')).toBe('Wedding 1998');
  });

  it('wraps every image in a link to the full image', async () => {
    const el = await renderComponent({ images: IMAGES });
    el.querySelectorAll('a').forEach((a, i) => {
      expect(a.getAttribute('href')).toBe(IMAGES[i].image);
    });
  });

  it('sets data-pswp dimensions on every anchor', async () => {
    const el = await renderComponent({ images: IMAGES });
    el.querySelectorAll('a').forEach((a, i) => {
      expect(a.getAttribute('data-pswp-width')).toBe(String(IMAGES[i].width));
      expect(a.getAttribute('data-pswp-height')).toBe(String(IMAGES[i].height));
    });
  });

  it('enables the photoswipe lightbox by default', async () => {
    const el = await renderComponent({ images: IMAGES });
    expect(el.lightbox).toBe(true);
    expect(el.pswp).toBeDefined();
  });

  it('renders plain cells without the lightbox when disabled', async () => {
    const el = await renderComponent({ images: IMAGES, lightbox: false });
    expect(el.pswp).toBeUndefined();
    expect(el.querySelector('a')).toBeNull();
    expect(el.querySelectorAll('.grid > div')).toHaveLength(3);
  });

  it('destroys the lightbox when removed from the DOM', async () => {
    const el = await renderComponent({ images: IMAGES });
    let destroyed = false;
    el.pswp!.destroy = () => {
      destroyed = true;
    };
    el.remove();
    expect(destroyed).toBe(true);
    expect(el.pswp).toBeUndefined();
  });

  it('updates when images change', async () => {
    const el = await renderComponent({ images: IMAGES });
    el.images = [IMAGES[0]];
    await el.updateComplete;
    expect(el.querySelectorAll('img')).toHaveLength(1);
  });

  it('renders without shadow DOM', async () => {
    const el = await renderComponent({ images: IMAGES });
    expect(el.shadowRoot).toBeNull();
  });
});
