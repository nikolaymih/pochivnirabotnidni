import { ImageResponse } from 'next/og';
import { getYear } from 'date-fns';

export const runtime = 'edge';
export const alt = 'Почивни Работни Дни - Календар с български празници';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  const year = getYear(new Date());

  return new ImageResponse(
    (
      <div
        style={{
          background: '#FAF8F5',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: '#C68E17',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: '#3E2723',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            Почивни Работни Дни
          </div>

          <div
            style={{
              fontSize: 36,
              color: '#6F4E37',
              textAlign: 'center',
            }}
          >
            Празнични и неработни дни през {year} година
          </div>

          <div
            style={{
              display: 'flex',
              gap: 16,
              marginTop: 16,
            }}
          >
            {/* Color legend chips */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#6F4E37',
                color: 'white',
                padding: '8px 20px',
                borderRadius: 12,
                fontSize: 20,
              }}
            >
              Празници
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#BDD7DE',
                color: '#3E2723',
                padding: '8px 20px',
                borderRadius: 12,
                fontSize: 20,
              }}
            >
              Отпуска
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#EB9605',
                color: 'white',
                padding: '8px 20px',
                borderRadius: 12,
                fontSize: 20,
              }}
            >
              Мостове
            </div>
          </div>

          <div
            style={{
              fontSize: 22,
              color: '#8D6E63',
              marginTop: 8,
            }}
          >
            kolkoshtepochivam.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
