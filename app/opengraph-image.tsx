import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getYear } from 'date-fns';

export const alt = 'Почивни Работни Дни - Календар с български празници';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  const year = getYear(new Date());

  const fontPath = join(process.cwd(), 'app/fonts/nunito-bold.ttf');
  const nunitoFont = await readFile(fontPath);

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
          fontFamily: 'Nunito',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: '#C68E17',
            display: 'flex',
          }}
        />
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
            marginTop: 24,
          }}
        >
          {`Празници и отпуски ${year}`}
        </div>
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 40,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
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
            marginTop: 24,
          }}
        >
          kolkoshtepochivam.com
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Nunito',
          data: nunitoFont,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  );
}
