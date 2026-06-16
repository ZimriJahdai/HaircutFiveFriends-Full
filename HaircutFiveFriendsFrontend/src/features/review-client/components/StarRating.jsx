import { useState } from 'react';

const STARS = [1, 2, 3, 4, 5];

export const StarRating = ({
  value,
  onChange,
  readonly = false,
}) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div
      style={{
        display: 'flex',
        gap: '3px',
      }}
    >
      {STARS.map((star) => (
        <span
          key={star}
          onClick={() =>
            !readonly &&
            onChange &&
            onChange(star)
          }
          onMouseEnter={() =>
            !readonly &&
            setHovered(star)
          }
          onMouseLeave={() =>
            !readonly &&
            setHovered(0)
          }
          style={{
            fontSize: readonly
              ? '16px'
              : '22px',
            cursor: readonly
              ? 'default'
              : 'pointer',
            color:
              star <= (hovered || value)
                ? '#C9A84C'
                : '#2A2A2A',
            transition: 'color 0.1s',
            userSelect: 'none',
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
};
