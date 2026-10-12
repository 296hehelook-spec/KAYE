import React from 'react';

interface KayeLogoProps {
  className?: string;
  size?: number;
  color?: string;
}

export const KayeLogo: React.FC<KayeLogoProps> = ({
  className = '',
  size = 36,
  color,
}) => {
  return (
    <svg
      width={size}
      height={(size * 280) / 240}
      viewBox="0 0 240 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-150 ${className}`}
      aria-label="Kaye Logo Emblem"
    >
      {/* 
        Exact reproduction of the Kaye emblem from the uploaded screenshot.
        Composed of:
        1. Top rounded diamond / apex loop with hollow center
        2. Bottom interlaced infinity/Mobius ribbon base with crossing weave
      */}

      {/* Top Diamond Apex Loop */}
      <path
        d="M 120 16
           C 134 16, 174 54, 174 80
           C 174 106, 134 140, 120 140
           C 106 140, 66 106, 66 80
           C 66 54, 106 16, 120 16 Z
           M 120 44
           C 112 44, 94 68, 94 80
           C 94 92, 112 114, 120 114
           C 128 114, 146 92, 146 80
           C 146 68, 128 44, 120 44 Z"
        fill={color || 'currentColor'}
        fillRule="evenodd"
        strokeLinejoin="round"
      />

      {/* Bottom Knot: Left-to-Right diagonal and outer curve */}
      <path
        d="M 64 126
           C 90 126, 114 148, 120 156
           C 126 148, 150 126, 176 126
           C 214 126, 244 160, 244 204
           C 244 238, 218 266, 182 266
           C 142 266, 108 234, 76 196
           L 96 178
           C 124 212, 152 242, 182 242
           C 206 242, 222 222, 222 202
           C 222 172, 198 148, 174 148
           C 154 148, 134 168, 120 186
           C 106 168, 86 148, 66 148
           C 42 148, 18 172, 18 202
           C 18 222, 34 242, 58 242
           C 88 242, 116 212, 144 178
           L 164 196
           C 132 234, 98 266, 58 266
           C 22 266, -4 238, -4 204
           C -4 160, 26 126, 64 126 Z"
        fill={color || 'currentColor'}
        fillRule="evenodd"
        strokeLinejoin="round"
      />

      {/* Foreground Crossing Band (Creates the crisp weave overlap) */}
      <path
        d="M 64 126
           C 78 126, 94 136, 108 150
           L 182 242
           C 176 248, 168 254, 158 258
           L 84 168
           C 76 156, 68 148, 58 148
           C 42 148, 18 172, 18 202
           C 18 214, 24 228, 36 238
           L 24 250
           C 6 238, -4 220, -4 202
           C -4 160, 26 126, 64 126 Z"
        fill={color || 'currentColor'}
        fillRule="evenodd"
        strokeLinejoin="round"
      />
    </svg>
  );
};
