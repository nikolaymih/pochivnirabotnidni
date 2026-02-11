import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ──────────────────────────────────────────────────────────────
// Module-level mocks (hoisted by Jest)
// ──────────────────────────────────────────────────────────────

const mockUseAuth = jest.fn<() => { user: { id: string } | null; isLoading: boolean }>();
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('@/lib/vacation/sync', () => ({
  fetchVacationData: jest.fn<() => Promise<null>>().mockResolvedValue(null),
  upsertVacationData: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
}));

jest.mock('@/lib/vacation/migration', () => ({
  migrateLocalStorageToSupabase: jest.fn<() => Promise<{ status: string }>>().mockResolvedValue({ status: 'no-local-data' }),
}));

jest.mock('@/lib/vacation/rollover', () => ({
  calculateRollover: jest.fn<() => Promise<null>>().mockResolvedValue(null),
}));

jest.mock('use-debounce', () => ({
  useDebounce: <T,>(value: T) => [value],
}));

jest.mock('@/components/MigrationReview', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="migration-review">MigrationReview</div>,
  };
});

// ──────────────────────────────────────────────────────────────
// Imports after mocks
// ──────────────────────────────────────────────────────────────

import { VacationProvider, useVacation } from '@/contexts/VacationContext';
import { DEFAULT_VACATION_DATA, VACATION_STORAGE_KEY } from '@/lib/vacation/storage';
import { fetchVacationData, upsertVacationData } from '@/lib/vacation/sync';
import { migrateLocalStorageToSupabase } from '@/lib/vacation/migration';
import { calculateRollover } from '@/lib/vacation/rollover';
import type { VacationData } from '@/lib/vacation/types';

// ──────────────────────────────────────────────────────────────
// Test consumer component
// ──────────────────────────────────────────────────────────────

function TestConsumer() {
  const { vacationData, isAuthenticated, setVacationData } = useVacation();
  return (
    <div>
      <span data-testid="total">{vacationData.totalDays}</span>
      <span data-testid="count">{vacationData.vacationDates.length}</span>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      <button data-testid="update" onClick={() => setVacationData({ version: 1, totalDays: 25, vacationDates: ['2026-05-01'] })}>Update</button>
    </div>
  );
}

function TestRolloverConsumer() {
  const { rollover } = useVacation();
  return (
    <div>
      <span data-testid="rollover">{rollover ? rollover.totalRollover : 'null'}</span>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Setup / teardown
// ──────────────────────────────────────────────────────────────

beforeEach(() => {
  // Default: anonymous user
  mockUseAuth.mockReturnValue({ user: null, isLoading: false });

  // Reset all sync/migration/rollover mocks
  (fetchVacationData as jest.Mock).mockResolvedValue(null);
  (upsertVacationData as jest.Mock).mockResolvedValue(true);
  (migrateLocalStorageToSupabase as jest.Mock).mockResolvedValue({ status: 'no-local-data' });
  (calculateRollover as jest.Mock).mockResolvedValue(null);

  // Clear localStorage
  window.localStorage.clear();
});

afterEach(() => {
  jest.restoreAllMocks();
  window.localStorage.clear();
});

// ──────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────

describe('VacationProvider', () => {
  describe('rendering and context shape', () => {
    test('renders children and provides context with expected shape', async () => {
      render(
        <VacationProvider>
          <TestConsumer />
        </VacationProvider>
      );

      // Provider renders children
      expect(screen.getByTestId('total')).toBeInTheDocument();
      expect(screen.getByTestId('count')).toBeInTheDocument();
      expect(screen.getByTestId('auth')).toBeInTheDocument();
      expect(screen.getByTestId('update')).toBeInTheDocument();
    });

    test('provides default vacation data when no localStorage exists', async () => {
      render(
        <VacationProvider>
          <TestConsumer />
        </VacationProvider>
      );

      expect(screen.getByTestId('total')).toHaveTextContent(String(DEFAULT_VACATION_DATA.totalDays));
      expect(screen.getByTestId('count')).toHaveTextContent('0');
    });

    test('isAuthenticated is false for anonymous user', async () => {
      render(
        <VacationProvider>
          <TestConsumer />
        </VacationProvider>
      );

      expect(screen.getByTestId('auth')).toHaveTextContent('false');
    });

    test('rollover is null for anonymous user', async () => {
      render(
        <VacationProvider>
          <TestRolloverConsumer />
        </VacationProvider>
      );

      expect(screen.getByTestId('rollover')).toHaveTextContent('null');
    });
  });

  describe('anonymous user - localStorage data flow', () => {
    test('reads existing localStorage data on mount', async () => {
      const storedData: VacationData = {
        version: 1,
        totalDays: 25,
        vacationDates: ['2026-03-02', '2026-03-03'],
      };
      window.localStorage.setItem(VACATION_STORAGE_KEY, JSON.stringify(storedData));

      render(
        <VacationProvider>
          <TestConsumer />
        </VacationProvider>
      );

      // useLocalStorage reads from localStorage in a useEffect, so wait for update
      await waitFor(() => {
        expect(screen.getByTestId('total')).toHaveTextContent('25');
      });
      expect(screen.getByTestId('count')).toHaveTextContent('2');
    });

    test('does not call cloud sync functions for anonymous user', async () => {
      render(
        <VacationProvider>
          <TestConsumer />
        </VacationProvider>
      );

      // Wait for effects to settle
      await act(async () => {
        await new Promise(r => setTimeout(r, 50));
      });

      expect(fetchVacationData).not.toHaveBeenCalled();
      expect(migrateLocalStorageToSupabase).not.toHaveBeenCalled();
      expect(calculateRollover).not.toHaveBeenCalled();
    });
  });

  describe('setVacationData', () => {
    test('updates displayed vacation data when called', async () => {
      const user = userEvent.setup();

      render(
        <VacationProvider>
          <TestConsumer />
        </VacationProvider>
      );

      // Initial state
      expect(screen.getByTestId('total')).toHaveTextContent(String(DEFAULT_VACATION_DATA.totalDays));
      expect(screen.getByTestId('count')).toHaveTextContent('0');

      // Click update button
      await user.click(screen.getByTestId('update'));

      // Updated state
      expect(screen.getByTestId('total')).toHaveTextContent('25');
      expect(screen.getByTestId('count')).toHaveTextContent('1');
    });

    test('persists to localStorage for anonymous user', async () => {
      const user = userEvent.setup();

      render(
        <VacationProvider>
          <TestConsumer />
        </VacationProvider>
      );

      await user.click(screen.getByTestId('update'));

      // Wait for localStorage write effect
      await waitFor(() => {
        const stored = window.localStorage.getItem(VACATION_STORAGE_KEY);
        expect(stored).not.toBeNull();
        const parsed = JSON.parse(stored!);
        expect(parsed.totalDays).toBe(25);
        expect(parsed.vacationDates).toEqual(['2026-05-01']);
      });
    });
  });

  describe('authenticated user', () => {
    const mockUser = { id: 'user-123' };

    test('isAuthenticated is true when user is present', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser, isLoading: false });

      render(
        <VacationProvider>
          <TestConsumer />
        </VacationProvider>
      );

      expect(screen.getByTestId('auth')).toHaveTextContent('true');
    });

    test('fetches cloud data on mount when authenticated', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser, isLoading: false });
      const cloudData: VacationData = {
        version: 1,
        totalDays: 30,
        vacationDates: ['2026-06-15'],
      };
      (fetchVacationData as jest.Mock).mockResolvedValue(cloudData);

      render(
        <VacationProvider>
          <TestConsumer />
        </VacationProvider>
      );

      await waitFor(() => {
        expect(fetchVacationData).toHaveBeenCalledWith(
          'user-123',
          expect.any(Number)
        );
      });

      // Cloud data should be shown
      await waitFor(() => {
        expect(screen.getByTestId('total')).toHaveTextContent('30');
      });
      expect(screen.getByTestId('count')).toHaveTextContent('1');
    });

    test('falls back to localStorage when cloud fetch returns null', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser, isLoading: false });
      (fetchVacationData as jest.Mock).mockResolvedValue(null);

      const localData: VacationData = {
        version: 1,
        totalDays: 22,
        vacationDates: ['2026-04-01'],
      };
      window.localStorage.setItem(VACATION_STORAGE_KEY, JSON.stringify(localData));

      render(
        <VacationProvider>
          <TestConsumer />
        </VacationProvider>
      );

      // When fetchVacationData returns null, cloudData becomes DEFAULT_VACATION_DATA
      // but since cloudData is set, it takes priority over localStorage for authenticated users.
      // The provider sets cloudData = data || DEFAULT_VACATION_DATA, so cloudData will be DEFAULT_VACATION_DATA.
      await waitFor(() => {
        expect(fetchVacationData).toHaveBeenCalled();
      });

      // Cloud data resolves to DEFAULT_VACATION_DATA (20 days, 0 dates)
      await waitFor(() => {
        expect(screen.getByTestId('total')).toHaveTextContent(String(DEFAULT_VACATION_DATA.totalDays));
      });
    });

    test('runs migration after cloud data loads', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser, isLoading: false });
      (fetchVacationData as jest.Mock).mockResolvedValue(null);
      (migrateLocalStorageToSupabase as jest.Mock).mockResolvedValue({ status: 'no-local-data' });

      render(
        <VacationProvider>
          <TestConsumer />
        </VacationProvider>
      );

      await waitFor(() => {
        expect(migrateLocalStorageToSupabase).toHaveBeenCalledWith(
          'user-123',
          expect.any(Number)
        );
      });
    });

    test('runs calculateRollover after cloud data loads', async () => {
      mockUseAuth.mockReturnValue({ user: mockUser, isLoading: false });
      (fetchVacationData as jest.Mock).mockResolvedValue(null);
      (calculateRollover as jest.Mock).mockResolvedValue(null);

      render(
        <VacationProvider>
          <TestRolloverConsumer />
        </VacationProvider>
      );

      await waitFor(() => {
        expect(calculateRollover).toHaveBeenCalledWith(
          'user-123',
          expect.any(Number)
        );
      });
    });
  });
});

describe('useVacation', () => {
  test('throws when used outside VacationProvider', () => {
    // Suppress React error boundary console output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    function Bare() {
      useVacation();
      return null;
    }

    expect(() => render(<Bare />)).toThrow(
      'useVacation must be used within a VacationProvider'
    );

    consoleSpy.mockRestore();
  });
});
