import { describe, test, expect } from '@jest/globals';
import { detectBridgeDays, isBridgeDay } from './bridgeDays';
import type { Holiday } from '@/lib/holidays/types';

describe('detectBridgeDays', () => {
  test('Tuesday holiday creates Monday bridge', () => {
    const holidays: Holiday[] = [
      {
        date: '2026-01-06', // Tuesday
        name: 'Test Holiday',
        type: 'Public Holiday',
      },
    ];

    const bridges = detectBridgeDays(holidays, 2026);

    expect(bridges).toHaveLength(1);
    expect(bridges[0].date).toBe('2026-01-05'); // Monday
    expect(bridges[0].reason).toBe('holiday-after');
    expect(bridges[0].relatedHoliday).toBe('Test Holiday');
    expect(bridges[0].daysOff).toBe(4);
  });

  test('Thursday holiday creates Friday bridge', () => {
    const holidays: Holiday[] = [
      {
        date: '2026-01-08', // Thursday
        name: 'Test Thursday Holiday',
        type: 'Public Holiday',
      },
    ];

    const bridges = detectBridgeDays(holidays, 2026);

    expect(bridges).toHaveLength(1);
    expect(bridges[0].date).toBe('2026-01-09'); // Friday
    expect(bridges[0].reason).toBe('holiday-before');
    expect(bridges[0].relatedHoliday).toBe('Test Thursday Holiday');
    expect(bridges[0].daysOff).toBe(4);
  });

  test('Monday holiday creates Friday bridge', () => {
    const holidays: Holiday[] = [
      {
        date: '2026-01-05', // Monday
        name: 'Monday Holiday',
        type: 'Public Holiday',
      },
    ];

    const bridges = detectBridgeDays(holidays, 2026);

    expect(bridges).toHaveLength(1);
    expect(bridges[0].date).toBe('2026-01-02'); // Friday before
    expect(bridges[0].reason).toBe('holiday-after');
    expect(bridges[0].daysOff).toBe(4);
  });

  test('Friday holiday creates Monday bridge', () => {
    const holidays: Holiday[] = [
      {
        date: '2026-01-02', // Friday
        name: 'Friday Holiday',
        type: 'Public Holiday',
      },
    ];

    const bridges = detectBridgeDays(holidays, 2026);

    expect(bridges).toHaveLength(1);
    expect(bridges[0].date).toBe('2026-01-05'); // Monday after
    expect(bridges[0].reason).toBe('holiday-before');
    expect(bridges[0].daysOff).toBe(4);
  });

  test('Wednesday holiday creates no bridge', () => {
    const holidays: Holiday[] = [
      {
        date: '2026-01-07', // Wednesday
        name: 'Wednesday Holiday',
        type: 'Public Holiday',
      },
    ];

    const bridges = detectBridgeDays(holidays, 2026);

    expect(bridges).toHaveLength(0);
  });

  test('Saturday holiday creates no bridge', () => {
    const holidays: Holiday[] = [
      {
        date: '2026-01-03', // Saturday
        name: 'Saturday Holiday',
        type: 'Public Holiday',
      },
    ];

    const bridges = detectBridgeDays(holidays, 2026);

    expect(bridges).toHaveLength(0);
  });

  test('Sunday holiday creates no bridge', () => {
    const holidays: Holiday[] = [
      {
        date: '2026-01-04', // Sunday
        name: 'Sunday Holiday',
        type: 'Public Holiday',
      },
    ];

    const bridges = detectBridgeDays(holidays, 2026);

    expect(bridges).toHaveLength(0);
  });

  test('no duplicate bridges if adjacent day is also holiday', () => {
    const holidays: Holiday[] = [
      {
        date: '2026-01-05', // Monday
        name: 'Monday Holiday',
        type: 'Public Holiday',
      },
      {
        date: '2026-01-06', // Tuesday
        name: 'Tuesday Holiday',
        type: 'Public Holiday',
      },
    ];

    const bridges = detectBridgeDays(holidays, 2026);

    // Monday's Friday bridge: 2026-01-02 (Friday)
    // Tuesday would suggest Monday (2026-01-05), but Monday is already a holiday
    expect(bridges).toHaveLength(1);
    expect(bridges[0].date).toBe('2026-01-02'); // Only Friday before Monday
  });

  test('year filtering works correctly', () => {
    const holidays: Holiday[] = [
      {
        date: '2025-01-06', // Tuesday in 2025
        name: '2025 Holiday',
        type: 'Public Holiday',
      },
      {
        date: '2026-01-06', // Tuesday in 2026
        name: '2026 Holiday',
        type: 'Public Holiday',
      },
      {
        date: '2027-01-05', // Tuesday in 2027
        name: '2027 Holiday',
        type: 'Public Holiday',
      },
    ];

    const bridges = detectBridgeDays(holidays, 2026);

    // Should only return bridge for 2026 holiday
    expect(bridges).toHaveLength(1);
    expect(bridges[0].date).toBe('2026-01-05'); // Monday before 2026-01-06
    expect(bridges[0].relatedHoliday).toBe('2026 Holiday');
  });

  test('detects holiday clusters within 3 days', () => {
    const holidays: Holiday[] = [
      {
        date: '2026-01-06', // Tuesday
        name: 'First Holiday',
        type: 'Public Holiday',
      },
      {
        date: '2026-01-08', // Thursday (2 days later)
        name: 'Second Holiday',
        type: 'Public Holiday',
      },
    ];

    const bridges = detectBridgeDays(holidays, 2026);

    // Should suggest:
    // - Monday 2026-01-05 (before Tuesday)
    // - Wednesday 2026-01-07 (between Tuesday and Thursday)
    // - Friday 2026-01-09 (after Thursday)
    expect(bridges.length).toBeGreaterThanOrEqual(3);

    // Check for cluster connector
    const clusterBridge = bridges.find(b => b.reason === 'cluster-connector');
    expect(clusterBridge).toBeDefined();
    expect(clusterBridge?.date).toBe('2026-01-07'); // Wednesday between them
  });

  test('handles multiple holidays across the year', () => {
    const holidays: Holiday[] = [
      {
        date: '2026-03-03', // Tuesday (March 3rd Liberation Day)
        name: 'Liberation Day',
        type: 'Public Holiday',
      },
      {
        date: '2026-05-01', // Friday (Labour Day)
        name: 'Labour Day',
        type: 'Public Holiday',
      },
      {
        date: '2026-12-24', // Thursday (Christmas Eve)
        name: 'Christmas Eve',
        type: 'Public Holiday',
      },
    ];

    const bridges = detectBridgeDays(holidays, 2026);

    // March 3 (Tue) → suggest Monday March 2
    const marchBridge = bridges.find(b => b.date === '2026-03-02');
    expect(marchBridge).toBeDefined();
    expect(marchBridge?.reason).toBe('holiday-after');

    // May 1 (Fri) → suggest Monday May 4
    const mayBridge = bridges.find(b => b.date === '2026-05-04');
    expect(mayBridge).toBeDefined();
    expect(mayBridge?.reason).toBe('holiday-before');

    // December 24 (Thu) → suggest Friday December 25
    const decBridge = bridges.find(b => b.date === '2026-12-25');
    expect(decBridge).toBeDefined();
    expect(decBridge?.reason).toBe('holiday-before');
  });
});

describe('isBridgeDay', () => {
  test('returns true for existing bridge day', () => {
    const holidays: Holiday[] = [
      {
        date: '2026-01-06', // Tuesday
        name: 'Test Holiday',
        type: 'Public Holiday',
      },
    ];

    const bridges = detectBridgeDays(holidays, 2026);
    const result = isBridgeDay('2026-01-05', bridges); // Monday

    expect(result).toBe(true);
  });

  test('returns false for non-bridge day', () => {
    const holidays: Holiday[] = [
      {
        date: '2026-01-06', // Tuesday
        name: 'Test Holiday',
        type: 'Public Holiday',
      },
    ];

    const bridges = detectBridgeDays(holidays, 2026);
    const result = isBridgeDay('2026-01-10', bridges); // Saturday

    expect(result).toBe(false);
  });

  test('handles empty bridge days array', () => {
    const result = isBridgeDay('2026-01-05', []);

    expect(result).toBe(false);
  });

  test('returns false for holiday date itself', () => {
    const holidays: Holiday[] = [
      {
        date: '2026-01-06', // Tuesday
        name: 'Test Holiday',
        type: 'Public Holiday',
      },
    ];

    const bridges = detectBridgeDays(holidays, 2026);
    const result = isBridgeDay('2026-01-06', bridges); // The holiday itself

    expect(result).toBe(false);
  });
});
