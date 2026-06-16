import { useState } from 'react';

import { deleteReview } from '../../../shared/api/review';

import { StarDisplay } from './StarDisplay';

export const ReviewCard = ({
  review,
  isAdmin = false,
}) => {

  const [deleting, setDeleting] =
    useState(false);

  const targetName =
    review.barberoId?.name ||
    review.servicioId?.name ||
    'General';

  const targetType =
    review.barberoId
      ? 'Barbero'
      : 'Servicio';

  const clientName =
    review.clienteId?.name ||
    'Cliente';

  const initials = clientName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const date = new Date(
    review.createdAt
  ).toLocaleDateString('es-GT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      style={{
        background: '#1A1A1A',
        border:
          '1px solid #2A2A2A',
        borderRadius: '10px',
        padding: '1rem',
        display: 'flex',
        gap: '14px',
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background:
            '#C9A84C22',
          border:
            '1px solid #C9A84C44',
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            'center',
          fontSize: '12px',
          fontWeight: 500,
          color: '#C9A84C',
          flexShrink: 0,
        }}
      >
        {initials}
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '4px',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              color: '#E8E4DC',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            {clientName}
          </span>

          <StarDisplay
            value={review.score}
          />

          <span
            style={{
              fontSize: '11px',
              color: '#555',
              marginLeft: 'auto',
            }}
          >
            {date}
          </span>
        </div>

        <p
          style={{
            color: '#888',
            fontSize: '12px',
            margin:
              '0 0 8px',
            lineHeight: 1.6,
          }}
        >
          {review.comment}
        </p>

        <span
          style={{
            fontSize: '11px',
            color: '#555',
          }}
        >
          <i
            className={`ti ${
              review.barberoId
                ? 'ti-id-badge'
                : 'ti-scissors'
            }`}
            style={{
              marginRight: '4px',
            }}
          />

          {targetType}:{' '}
          <span
            style={{
              color: '#777',
            }}
          >
            {targetName}
          </span>
        </span>
      </div>
    </div>
  );
};
