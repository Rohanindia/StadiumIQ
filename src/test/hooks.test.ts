/**
 * @fileoverview Tests for the usePageTitle custom hook.
 * Verifies that document.title is correctly set and restored.
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { usePageTitle } from '@/hooks/usePageTitle';

const BASE_TITLE = 'StadiumIQ — FIFA World Cup 2026';

describe('usePageTitle', () => {
  const originalTitle = document.title;

  beforeEach(() => {
    document.title = originalTitle;
  });

  it('sets document.title on mount', () => {
    renderHook(() => usePageTitle('CrowdIQ — Crowd Management'));
    expect(document.title).toBe(`CrowdIQ — Crowd Management | ${BASE_TITLE}`);
  });

  it('updates document.title when pageTitle changes', () => {
    const { rerender } = renderHook(({ title }: { title: string }) => usePageTitle(title), {
      initialProps: { title: 'Page One' },
    });
    expect(document.title).toContain('Page One');
    rerender({ title: 'Page Two' });
    expect(document.title).toContain('Page Two');
  });

  it('restores previous title on unmount', () => {
    document.title = 'Previous Title';
    const { unmount } = renderHook(() => usePageTitle('Test Page'));
    expect(document.title).toContain('Test Page');
    act(() => { unmount(); });
    expect(document.title).toBe('Previous Title');
  });

  it('includes the base title suffix', () => {
    renderHook(() => usePageTitle('Fan Hub'));
    expect(document.title).toContain(BASE_TITLE);
  });
});
