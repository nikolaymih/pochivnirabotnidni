'use client';

import { useRef, useState, useEffect, type ReactNode } from 'react';

interface StickyBottomSidebarProps {
  children: ReactNode;
}

export default function StickyBottomSidebar({ children }: StickyBottomSidebarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [stickyTop, setStickyTop] = useState(16);

  useEffect(() => {
    const update = () => {
      if (ref.current) {
        const sidebarHeight = ref.current.offsetHeight;
        const viewportHeight = window.innerHeight;
        if (sidebarHeight > viewportHeight - 32) {
          // Sidebar taller than viewport: scroll until bottom is visible, then stick
          setStickyTop(-(sidebarHeight - viewportHeight + 16));
        } else {
          // Sidebar fits in viewport: stick at top normally
          setStickyTop(16);
        }
      }
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div ref={ref} className="sticky" style={{ top: stickyTop }}>
      {children}
    </div>
  );
}
