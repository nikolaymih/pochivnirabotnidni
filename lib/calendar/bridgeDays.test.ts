import { describe, test, expect } from '@jest/globals';
import { detectBridgeDays, isBridgeDay } from './bridgeDays';
import type { Holiday } from '@/lib/holidays/types';

describe('detectBridgeDays', () => {
  test('Monday holiday suggests Tue, Wed, Thu, Fri (4 days with full-week)', () => {
    const holidays: Holiday[] = [
      {
        date: '2026-01-05', // Monday
        name: 'Monday Holiday',
        type: 'Public Holiday',
      },
    ];

    const bridges = detectBridgeDays(holidays, 2026);

    expect(bridges).toHaveLength(4);
    expect(bridges.map(b => b.date).sort()).toEqual([
      '2026-01-06', // Tuesday
      '2026-01-07', // Wednesday
      '2026-01-08', // Thursday
      '2026-01-09', // Friday
    ]);
    bridges.forEach(bridge => {
      expect(bridge.reason).toBe('full-week');
      expect(bridge.daysOff).toBe(5);
      expect(bridge.relatedHoliday).toBe('Monday Holiday');
    });
  });

  test('Tuesday holiday suggests Mon, Wed, Thu, Fri (4 days with full-week)', () => {
    const holidays: Holiday[] = [
      {
        date: '2026-01-06', // Tuesday
        name: 'Tuesday Holiday',
        type: 'Public Holiday',
      },
    ];

    const bridges = detectBridgeDays(holidays, 2026);

    expect(bridges).toHaveLength(4);
    expect(bridges.map(b => b.date).sort()).toEqual([
      '2026-01-05', // Monday
      '2026-01-07', // Wednesday
      '2026-01-08', // Thursday
      '2026-01-09', // Friday
    ]);
    bridges.forEach(bridge => {
      expect(bridge.reason).toBe('full-week');
      expect(bridge.daysOff).toBe(5);
      expect(bridge.relatedHoliday).toBe('Tuesday Holiday');
    });
  });

  test('Wednesday holiday suggests Mon, Tue, Thu, Fri (4 days with full-week)', () => {
    const holidays: Holiday[] = [
      {
        date: '2026-01-07', // Wednesday
        name: 'Wednesday Holiday',
        type: 'Public Holiday',
      },
    ];

    const bridges = detectBridgeDays(holidays, 2026);

    expect(bridges).toHaveLength(4);
    expect(bridges.map(b => b.date).sort()).toEqual([
      '2026-01-05', // Monday
      '2026-01-06', // Tuesday
      '2026-01-08', // Thursday
      '2026-01-09', // Friday
    ]);
    bridges.forEach(bridge => {
      expect(bridge.reason).toBe('full-week');
      expect(bridge.daysOff).toBe(5);
      expect(bridge.relatedHoliday).toBe('Wednesday Holiday');
    });
  });

  test('Thursday holiday suggests Mon, Tue, Wed, Fri (4 days with full-week)', () => {
    const holidays: Holiday[] = [
      {
        date: '2026-01-08', // Thursday
        name: 'Thursday Holiday',
        type: 'Public Holiday',
      },
    ];

    const bridges = detectBridgeDays(holidays, 2026);

    expect(bridges).toHaveLength(4);
    expect(bridges.map(b => b.date).sort()).toEqual([
      '2026-01-05', // Monday
      '2026-01-06', // Tuesday
      '2026-01-07', // Wednesday
      '2026-01-09', // Friday
    ]);
    bridges.forEach(bridge => {
      expect(bridge.reason).toBe('full-week');
      expect(bridge.daysOff).toBe(5);
      expect(bridge.relatedHoliday).toBe('Thursday Holiday');
    });
  });

  test('Friday holiday suggests Mon, Tue, Wed, Thu (4 days with full-week)', () => {
    const holidays: Holiday[] = [
      {
        date: '2026-01-09', // Friday
        name: 'Friday Holiday',
        type: 'Public Holiday',
      },
    ];

    const bridges = detectBridgeDays(holidays, 2026);

    expect(bridges).toHaveLength(4);
    expect(bridges.map(b => b.date).sort()).toEqual([
      '2026-01-05', // Monday
      '2026-01-06', // Tuesday
      '2026-01-07', // Wednesday
      '2026-01-08', // Thursday
    ]);
    bridges.forEach(bridge => {
      expect(bridge.reason).toBe('full-week');
      expect(bridge.daysOff).toBe(5);
      expect(bridge.relatedHoliday).toBe('Friday Holiday');
    });
  });

  test('Saturday holiday suggests nothing (weekend)', () => {
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

  test('Sunday holiday suggests nothing (weekend)', () => {
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

  test('Two holidays in same week suggest remaining workdays (no duplicates)', () => {
    const holidays: Holiday[] = [
      {
        date: '2026-01-05', // Monday
        name: 'Monday Holiday',
        type: 'Public Holiday',
      },
      {
        date: '2026-01-07', // Wednesday
        name: 'Wednesday Holiday',
        type: 'Public Holiday',
      },
    ];

    const bridges = detectBridgeDays(holidays, 2026);

    // Should suggest: Tue, Thu, Fri (3 days, no duplicates)
    expect(bridges).toHaveLength(3);
    expect(bridges.map(b => b.date).sort()).toEqual([
      '2026-01-06', // Tuesday
      '2026-01-08', // Thursday
      '2026-01-09', // Friday
    ]);
    bridges.forEach(bridge => {
      expect(bridge.reason).toBe('full-week');
      expect(bridge.daysOff).toBe(5);
    });
  });

  test('Holiday on Monday + Friday in same week suggests Tue, Wed, Thu only (3 days)', () => {
    const holidays: Holiday[] = [
      {
        date: '2026-01-05', // Monday
        name: 'Monday Holiday',
        type: 'Public Holiday',
      },
      {
        date: '2026-01-09', // Friday
        name: 'Friday Holiday',
        type: 'Public Holiday',
      },
    ];

    const bridges = detectBridgeDays(holidays, 2026);

    // Should suggest: Tue, Wed, Thu (3 days)
    expect(bridges).toHaveLength(3);
    expect(bridges.map(b => b.date).sort()).toEqual([
      '2026-01-06', // Tuesday
      '2026-01-07', // Wednesday
      '2026-01-08', // Thursday
    ]);
    bridges.forEach(bridge => {
      expect(bridge.reason).toBe('full-week');
      expect(bridge.daysOff).toBe(5);
    });
  });

  test('Year filtering works (only suggests for target year)', () => {
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

    // Should only return bridges for 2026 holiday
    expect(bridges).toHaveLength(4);
    bridges.forEach(bridge => {
      expect(bridge.date.startsWith('2026-')).toBe(true);
      expect(bridge.relatedHoliday).toBe('2026 Holiday');
    });
  });

  test('Holiday in early January (2027) suggests days in late December (2026) - year boundary handling', () => {
    const holidays: Holiday[] = [
      {
        date: '2027-01-01', // Friday, Jan 1, 2027
        name: 'New Year 2027',
        type: 'Public Holiday',
      },
    ];

    // Jan 1, 2027 is Friday. The work week is Mon Dec 28 - Fri Jan 1.
    // When calling detectBridgeDays for 2026, should suggest Mon Dec 28, Tue Dec 29, Wed Dec 30, Thu Dec 31 (all in 2026)
    const bridges2026 = detectBridgeDays(holidays, 2026);
    expect(bridges2026).toHaveLength(4);
    expect(bridges2026.map(b => b.date).sort()).toEqual([
      '2026-12-28', // Monday
      '2026-12-29', // Tuesday
      '2026-12-30', // Wednesday
      '2026-12-31', // Thursday
    ]);
    bridges2026.forEach(bridge => {
      expect(bridge.reason).toBe('full-week');
      expect(bridge.daysOff).toBe(5);
      expect(bridge.relatedHoliday).toBe('New Year 2027');
    });

    // When calling detectBridgeDays for 2027, the work week includes Mon Dec 28 - Thu Dec 31 (2026) and Fri Jan 1 (2027)
    // But the holiday is Jan 1, so no bridge days are suggested (all other workdays are in 2026)
    const bridges2027 = detectBridgeDays(holidays, 2027);
    expect(bridges2027).toHaveLength(0);
  });

  test('Holiday in late December (2026) suggests days in early January (2027) - year boundary handling', () => {
    const holidays: Holiday[] = [
      {
        date: '2026-12-30', // Wednesday, Dec 30, 2026
        name: 'Year End Holiday',
        type: 'Public Holiday',
      },
    ];

    // Dec 30, 2026 is Wednesday. The work week is Mon Dec 28 - Fri Jan 1.
    // When calling detectBridgeDays for 2026, should suggest Mon Dec 28, Tue Dec 29, Thu Dec 31 (2026), Fri Jan 1 (2027)
    // But filtered to only return Mon Dec 28, Tue Dec 29, Thu Dec 31 (2026)
    const bridges2026 = detectBridgeDays(holidays, 2026);
    expect(bridges2026).toHaveLength(3);
    expect(bridges2026.map(b => b.date).sort()).toEqual([
      '2026-12-28', // Monday
      '2026-12-29', // Tuesday
      '2026-12-31', // Thursday
    ]);
    bridges2026.forEach(bridge => {
      expect(bridge.reason).toBe('full-week');
      expect(bridge.daysOff).toBe(5);
      expect(bridge.relatedHoliday).toBe('Year End Holiday');
    });

    // When calling detectBridgeDays for 2027, should suggest Fri Jan 1 (2027)
    const bridges2027 = detectBridgeDays(holidays, 2027);
    expect(bridges2027).toHaveLength(1);
    expect(bridges2027.map(b => b.date).sort()).toEqual([
      '2027-01-01', // Friday
    ]);
    bridges2027.forEach(bridge => {
      expect(bridge.reason).toBe('full-week');
      expect(bridge.daysOff).toBe(5);
      expect(bridge.relatedHoliday).toBe('Year End Holiday');
    });
  });

  test('isBridgeDay lookup works correctly', () => {
    const holidays: Holiday[] = [
      {
        date: '2026-01-06', // Tuesday
        name: 'Test Holiday',
        type: 'Public Holiday',
      },
    ];

    const bridges = detectBridgeDays(holidays, 2026);

    // Monday should be a bridge day
    expect(isBridgeDay('2026-01-05', bridges)).toBe(true);
    // Wednesday should be a bridge day
    expect(isBridgeDay('2026-01-07', bridges)).toBe(true);
    // Thursday should be a bridge day
    expect(isBridgeDay('2026-01-08', bridges)).toBe(true);
    // Friday should be a bridge day
    expect(isBridgeDay('2026-01-09', bridges)).toBe(true);
    // Saturday should NOT be a bridge day
    expect(isBridgeDay('2026-01-10', bridges)).toBe(false);
  });

  test('Days that are already holidays NOT suggested', () => {
    const holidays: Holiday[] = [
      {
        date: '2026-01-05', // Monday
        name: 'Monday Holiday',
        type: 'Public Holiday',
      },
      {
        date: '2026-01-06', // Tuesday (also a holiday)
        name: 'Tuesday Holiday',
        type: 'Public Holiday',
      },
    ];

    const bridges = detectBridgeDays(holidays, 2026);

    // Should suggest: Wed, Thu, Fri (3 days)
    // Should NOT suggest Monday or Tuesday (already holidays)
    expect(bridges).toHaveLength(3);
    expect(bridges.map(b => b.date).sort()).toEqual([
      '2026-01-07', // Wednesday
      '2026-01-08', // Thursday
      '2026-01-09', // Friday
    ]);

    // Verify no bridge day matches the holiday dates
    expect(bridges.find(b => b.date === '2026-01-05')).toBeUndefined();
    expect(bridges.find(b => b.date === '2026-01-06')).toBeUndefined();
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
    const result = isBridgeDay('2026-01-05', bridges); // Monday (should be a bridge)

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
    const result = isBridgeDay('2026-01-13', bridges); // Random day not in bridge

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
