import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

describe('useLocalStorage', () => {
  let getItemSpy: jest.SpiedFunction<typeof Storage.prototype.getItem>;
  let setItemSpy: jest.SpiedFunction<typeof Storage.prototype.setItem>;

  beforeEach(() => {
    // Spy on the real jsdom localStorage (window.localStorage)
    getItemSpy = jest.spyOn(Storage.prototype, 'getItem');
    setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
    jest.restoreAllMocks();
  });

  describe('Initial value from localStorage', () => {
    test('returns parsed value when key exists', async () => {
      const testData = { vacationDates: ['2026-03-15'], totalDays: 20 };
      window.localStorage.setItem('vacationData', JSON.stringify(testData));
      // Clear spy calls from setup
      getItemSpy.mockClear();
      setItemSpy.mockClear();

      const { result } = renderHook(() =>
        useLocalStorage('vacationData', { vacationDates: [] as string[], totalDays: 0 })
      );

      // Wait for useEffect to read from localStorage and update state
      await waitFor(() => {
        expect(result.current[0]).toEqual(testData);
      });

      expect(getItemSpy).toHaveBeenCalledWith('vacationData');
    });

    test('returns initial value when key is missing', () => {
      const initialValue = { vacationDates: [] as string[], totalDays: 20 };
      const { result } = renderHook(() => useLocalStorage('vacationData', initialValue));

      expect(result.current[0]).toEqual(initialValue);
    });

    test('returns initial value when localStorage contains invalid JSON', () => {
      window.localStorage.setItem('vacationData', 'invalid-json{');

      const initialValue = { vacationDates: [] as string[], totalDays: 20 };
      const { result } = renderHook(() => useLocalStorage('vacationData', initialValue));

      // Should fallback gracefully to initial value
      expect(result.current[0]).toEqual(initialValue);
    });
  });

  describe('setValue updates localStorage', () => {
    test('serializes new value to JSON and stores it', async () => {
      const { result } = renderHook(() => useLocalStorage('vacationDates', [] as string[]));

      act(() => {
        result.current[1](['2026-03-15', '2026-03-16']);
      });

      await waitFor(() => {
        expect(window.localStorage.getItem('vacationDates')).toBe(
          JSON.stringify(['2026-03-15', '2026-03-16'])
        );
      });
    });

    test('calls localStorage.setItem with correct key and value', async () => {
      const { result } = renderHook(() => useLocalStorage('totalDays', 20));

      act(() => {
        result.current[1](25);
      });

      await waitFor(() => {
        expect(window.localStorage.getItem('totalDays')).toBe('25');
      });
    });

    test('state updates trigger re-render', () => {
      const { result } = renderHook(() => useLocalStorage('counter', 0));

      expect(result.current[0]).toBe(0);

      act(() => {
        result.current[1](5);
      });

      expect(result.current[0]).toBe(5);
    });
  });

  describe('SSR safety (typeof window check)', () => {
    test('does not crash when localStorage is unavailable', () => {
      // Simulate broken localStorage by making getItem throw
      getItemSpy.mockImplementation(() => { throw new Error('SecurityError'); });

      const { result } = renderHook(() => useLocalStorage('vacationData', { vacationDates: [] as string[] }));

      // Should return initial value without error
      expect(result.current[0]).toEqual({ vacationDates: [] });
    });

    test('returns initial value when localStorage throws', () => {
      getItemSpy.mockImplementation(() => { throw new Error('SecurityError'); });

      const initialValue = { totalDays: 20, vacationDates: [] as string[] };
      const { result } = renderHook(() => useLocalStorage('vacationData', initialValue));

      expect(result.current[0]).toEqual(initialValue);
    });

    test('handles localStorage errors gracefully', () => {
      getItemSpy.mockImplementation(() => { throw new Error('SecurityError'); });

      expect(() => {
        renderHook(() => useLocalStorage('vacationData', { vacationDates: [] as string[] }));
      }).not.toThrow();
    });
  });

  describe('Edge cases', () => {
    test('stores empty array as "[]"', async () => {
      // Start with non-empty array, then set to empty
      const { result } = renderHook(() => useLocalStorage('vacationDates', ['2026-01-01']));

      act(() => {
        result.current[1]([]);
      });

      await waitFor(() => {
        expect(window.localStorage.getItem('vacationDates')).toBe('[]');
      });
    });

    test('stores different string value', async () => {
      const { result } = renderHook(() => useLocalStorage('name', 'initial'));

      act(() => {
        result.current[1]('updated');
      });

      await waitFor(() => {
        expect(window.localStorage.getItem('name')).toBe('"updated"');
      });
    });

    test('stores null value as "null"', async () => {
      const { result } = renderHook(() => useLocalStorage<string | null>('data', 'initial'));

      act(() => {
        result.current[1](null);
      });

      await waitFor(() => {
        expect(window.localStorage.getItem('data')).toBe('null');
      });
    });

    test('handles complex objects with vacation dates array', async () => {
      const { result } = renderHook(() =>
        useLocalStorage('vacationData', { year: 0, totalDays: 0, vacationDates: [] as string[] })
      );

      const vacationData = {
        year: 2026,
        totalDays: 20,
        vacationDates: ['2026-03-15', '2026-03-16', '2026-03-17'],
      };

      act(() => {
        result.current[1](vacationData);
      });

      await waitFor(() => {
        expect(window.localStorage.getItem('vacationData')).toBe(JSON.stringify(vacationData));
      });
    });

    test('handles ISO date strings correctly', async () => {
      const { result } = renderHook(() => useLocalStorage('dates', [] as string[]));

      const dates = ['2026-03-15', '2026-12-31', '2026-01-01'];

      act(() => {
        result.current[1](dates);
      });

      await waitFor(() => {
        const stored = window.localStorage.getItem('dates');
        expect(stored).not.toBeNull();
        expect(JSON.parse(stored!)).toEqual(dates);
      });
    });
  });

  describe('Error handling', () => {
    test('handles QuotaExceededError gracefully', () => {
      setItemSpy.mockImplementation(() => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      });

      const { result } = renderHook(() => useLocalStorage('data', 'test'));

      expect(() => {
        act(() => {
          result.current[1]('large-data');
        });
      }).not.toThrow();
    });

    test('handles SecurityError in private browsing mode', () => {
      setItemSpy.mockImplementation(() => {
        throw new DOMException('SecurityError', 'SecurityError');
      });

      const { result } = renderHook(() => useLocalStorage('data', 'test'));

      expect(() => {
        act(() => {
          result.current[1]('new-data');
        });
      }).not.toThrow();
    });
  });
});
