import { beforeEach, describe, expect, it, vi } from 'vitest';

const { cardMock, chartMock, createChartMock, editTreeMock } = vi.hoisted(
  () => {
    const cardMock = {
      setCardDisplay: vi.fn(),
      setDefaultPersonIcon: vi.fn(),
      setOnCardClick: vi.fn(),
      setOnCardUpdate: vi.fn(),
    };
    cardMock.setCardDisplay.mockReturnValue(cardMock);
    cardMock.setDefaultPersonIcon.mockReturnValue(cardMock);
    cardMock.setOnCardClick.mockReturnValue(cardMock);
    cardMock.setOnCardUpdate.mockReturnValue(cardMock);

    const editTreeMock = {
      fixed: vi.fn(),
      setFields: vi.fn(),
      setEditFirst: vi.fn(),
      setEdit: vi.fn(),
      setOnChange: vi.fn(),
      setOnFormCreation: vi.fn(),
      open: vi.fn(),
      closeForm: vi.fn(),
      destroy: vi.fn(),
      exportData: vi.fn((): unknown[] => []),
      isAddingRelative: vi.fn(() => false),
      isRemovingRelative: vi.fn(() => false),
      addRelativeInstance: { onCancel: vi.fn() },
    };
    editTreeMock.fixed.mockReturnValue(editTreeMock);
    editTreeMock.setFields.mockReturnValue(editTreeMock);
    editTreeMock.setEditFirst.mockReturnValue(editTreeMock);

    const chartMock = {
      setTransitionTime: vi.fn(),
      setCardXSpacing: vi.fn(),
      setCardYSpacing: vi.fn(),
      setCardHtml: vi.fn(() => cardMock),
      editTree: vi.fn(() => editTreeMock),
      updateTree: vi.fn(),
      updateData: vi.fn(),
      updateMainId: vi.fn(),
      svg: document.createElement('svg'),
    };
    chartMock.setTransitionTime.mockReturnValue(chartMock);
    chartMock.setCardXSpacing.mockReturnValue(chartMock);
    chartMock.setCardYSpacing.mockReturnValue(chartMock);

    return {
      cardMock,
      chartMock,
      createChartMock: vi.fn((..._args: unknown[]) => chartMock),
      editTreeMock,
    };
  },
);

vi.mock('family-chart', () => ({
  createChart: createChartMock,
}));

import '../../src/components/family-tree.js';
import type { AppFamilyTree } from '../../src/components/family-tree.js';
import type { Person } from '../../src/types/index.js';
import type { FamilyChartDatum } from '../../src/utils/tree.js';

const makePerson = (
  id: string,
  firstName: string,
  gender: 'M' | 'F',
  clanId?: string,
): Person => ({
  id,
  data: {
    firstName,
    lastName: 'Nguyễn',
    gender,
    birthYear: '1980',
    generation: 1,
    ...(clanId ? { clanId } : {}),
  },
  rels: { parents: [], spouses: [], children: [] },
});

const people = [
  makePerson('p1', 'Văn A', 'M', 'c1'),
  makePerson('p2', 'Thị B', 'F', 'c1'),
  makePerson('p3', 'Văn C', 'M', 'c2'),
];

async function renderComponent(opts?: {
  persons?: Person[];
  clanId?: string;
  mainPersonId?: string;
  editable?: boolean;
}): Promise<AppFamilyTree> {
  const el = document.createElement('app-family-tree');
  if (opts?.persons !== undefined) el.persons = opts.persons;
  if (opts?.clanId !== undefined) el.clanId = opts.clanId;
  if (opts?.mainPersonId !== undefined) el.mainPersonId = opts.mainPersonId;
  if (opts?.editable !== undefined) el.editable = opts.editable;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

beforeEach(() => {
  document.querySelectorAll('app-family-tree').forEach((el) => {
    el.remove();
  });
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe('AppFamilyTree', () => {
  it('renders the toolbar with search input and reset button', async () => {
    const el = await renderComponent({ persons: people });
    expect(el.querySelector('input[placeholder]')).toBeTruthy();
    expect(el.querySelector('.tree-reset')).toBeTruthy();
    expect(el.querySelector('.tree-toggle-search')).toBeTruthy();
  });

  it('creates the chart with mapped data when persons are provided', async () => {
    await renderComponent({ persons: people, clanId: 'c1' });
    expect(createChartMock).toHaveBeenCalledTimes(1);
    const data = createChartMock.mock.calls[0][1] as FamilyChartDatum[];
    expect(data).toHaveLength(2);
    expect(data[0].id).toBe('p1');
    expect(data[0].data.clanId).toBeUndefined();
    expect(cardMock.setCardDisplay).toHaveBeenCalled();
    expect(chartMock.updateTree).toHaveBeenCalledWith({ initial: true });
  });

  it('calls updateMainId when a main person is set', async () => {
    await renderComponent({ persons: people, mainPersonId: 'p2' });
    expect(chartMock.updateMainId).toHaveBeenCalledWith('p2');
  });

  it('renders the empty state and skips chart creation with no persons', async () => {
    const el = await renderComponent({ persons: [] });
    expect(el.querySelector('app-empty-state')).toBeTruthy();
    expect(el.querySelector('.tree-chart')).toBeNull();
    expect(createChartMock).not.toHaveBeenCalled();
  });

  it('filters by clan id and shows empty state when nothing matches', async () => {
    const el = await renderComponent({ persons: people, clanId: 'nope' });
    expect(el.querySelector('app-empty-state')).toBeTruthy();
    expect(createChartMock).not.toHaveBeenCalled();
  });

  it('dispatches person-click when a card is clicked', async () => {
    const el = await renderComponent({ persons: people });
    const handler = cardMock.setOnCardClick.mock.calls[0][0] as (
      e: MouseEvent,
      d: { data: { id: string } },
    ) => void;
    let detail: { person: Person } | undefined;
    el.addEventListener('person-click', (e) => {
      detail = (e as CustomEvent<{ person: Person }>).detail;
    });
    handler(new MouseEvent('click'), { data: { id: 'p1' } });
    expect(detail?.person.id).toBe('p1');
  });

  it('centers the tree on the first search match after debounce', async () => {
    vi.useFakeTimers();
    const el = await renderComponent({ persons: people });
    const input = el.querySelector(
      '.tree-search',
    ) as unknown as HTMLInputElement;
    input.value = 'Thị B';
    input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(300);
    await el.updateComplete;
    expect(chartMock.updateMainId).toHaveBeenCalledWith('p2');
    expect(chartMock.updateTree).toHaveBeenCalledWith({
      tree_position: 'main_to_middle',
    });
  });

  it('clears the query and fits the chart on reset', async () => {
    const el = await renderComponent({ persons: people });
    const input = el.querySelector(
      '.tree-search',
    ) as unknown as HTMLInputElement;
    input.value = 'abc';
    input.dispatchEvent(new Event('input'));
    await el.updateComplete;
    (el.querySelector('.tree-reset') as HTMLElement).click();
    await el.updateComplete;
    expect(el.query).toBe('');
    expect((el.querySelector('.tree-search') as HTMLInputElement).value).toBe(
      '',
    );
    expect(chartMock.updateTree).toHaveBeenCalledWith({
      tree_position: 'fit',
    });
  });

  it('does not set up editing by default', async () => {
    await renderComponent({ persons: people });
    expect(chartMock.editTree).not.toHaveBeenCalled();
    expect(cardMock.setOnCardUpdate).not.toHaveBeenCalled();
  });

  it('sets up the edit tree when editable', async () => {
    await renderComponent({ persons: people, editable: true });
    expect(chartMock.editTree).toHaveBeenCalledTimes(1);
    expect(editTreeMock.setFields).toHaveBeenCalledWith([
      'firstName',
      'lastName',
      'birthYear',
      'deathYear',
      'gender',
      'notes',
    ]);
    expect(editTreeMock.setEdit).toHaveBeenCalled();
    expect(cardMock.setOnCardUpdate).toHaveBeenCalled();
  });

  it('dispatches tree-changed when the edit tree data changes', async () => {
    editTreeMock.exportData.mockReturnValueOnce([
      { id: 'p1', data: { gender: 'M' }, rels: {} },
    ]);
    const el = await renderComponent({ persons: people, editable: true });
    const onChange = editTreeMock.setOnChange.mock.calls[0][0] as () => void;
    let detail: { persons: Person[] } | undefined;
    el.addEventListener('tree-changed', (e) => {
      detail = (e as CustomEvent<{ persons: Person[] }>).detail;
    });
    onChange();
    expect(detail?.persons[0]?.id).toBe('p1');
  });

  it('opens the add form for pending relative cards instead of person-click', async () => {
    editTreeMock.isAddingRelative.mockReturnValueOnce(true);
    const el = await renderComponent({ persons: people, editable: true });
    const handler = cardMock.setOnCardClick.mock.calls[0][0] as (
      e: MouseEvent,
      d: { data: { id: string; _new_rel_data?: boolean } },
    ) => void;
    let clicked = false;
    el.addEventListener('person-click', () => {
      clicked = true;
    });
    handler(new MouseEvent('click'), {
      data: { id: 'new1', _new_rel_data: true },
    });
    expect(editTreeMock.open).toHaveBeenCalledWith(
      expect.objectContaining({ _new_rel_data: true }),
    );
    expect(clicked).toBe(false);
  });

  it('cancels add relative mode when clicking an existing card', async () => {
    editTreeMock.isAddingRelative.mockReturnValueOnce(true);
    const el = await renderComponent({ persons: people, editable: true });
    const handler = cardMock.setOnCardClick.mock.calls[0][0] as (
      e: MouseEvent,
      d: { data: { id: string } },
    ) => void;
    let clicked = false;
    el.addEventListener('person-click', () => {
      clicked = true;
    });
    handler(new MouseEvent('click'), { data: { id: 'p1' } });
    expect(editTreeMock.addRelativeInstance.onCancel).toHaveBeenCalled();
    expect(editTreeMock.closeForm).toHaveBeenCalled();
    expect(clicked).toBe(true);
  });

  it('opens the edit form when removing a relative', async () => {
    editTreeMock.isRemovingRelative.mockReturnValueOnce(true);
    const el = await renderComponent({ persons: people, editable: true });
    const handler = cardMock.setOnCardClick.mock.calls[0][0] as (
      e: MouseEvent,
      d: { data: { id: string } },
    ) => void;
    let clicked = false;
    el.addEventListener('person-click', () => {
      clicked = true;
    });
    handler(new MouseEvent('click'), { data: { id: 'p1' } });
    expect(editTreeMock.open).toHaveBeenCalled();
    expect(clicked).toBe(false);
  });
});
