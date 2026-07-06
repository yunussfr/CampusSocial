import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';

/**
 * Tutarlı bir arama ikonu — react-native-svg ile çizilir.
 * Tüm ekranlarda bu component kullanılmalı.
 *
 * @param {number} size   - İkon boyutu (default: 20)
 * @param {string} color  - İkon rengi (default: '#64748B')
 * @param {number} strokeWidth - Çizgi kalınlığı (default: 2)
 */
export function SearchIcon({ size = 20, color = '#64748B', strokeWidth = 2 }) {
  const r = size * 0.32;
  const cx = size * 0.42;
  const cy = size * 0.42;
  const lineStart = size * 0.65;
  const lineEnd = size * 0.88;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Line
        x1={lineStart}
        y1={lineStart}
        x2={lineEnd}
        y2={lineEnd}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
