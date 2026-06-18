import { useState } from 'react';

const STARS = [1, 2, 3, 4, 5];

export const StarRating = ({
  value,
  onChange,
  readonly = false,
}) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-[3px]">
      {STARS.map((star) => (
        <span
          key={star}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`${readonly ? 'text-base' : 'text-[22px] cursor-pointer'} select-none transition-[color] duration-100`}
          style={{ color: star <= (hovered || value) ? '#C9A84C' : '#2A2A2A' }}
        >
          ★
        </span>
      ))}
    </div>
  );
};
