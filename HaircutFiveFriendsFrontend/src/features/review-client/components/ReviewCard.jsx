import { useState } from 'react';

import { deleteReview } from '../../../shared/api/review';

import { StarRating } from './StarRating';

export const ReviewCard = ({
  review,
  clientId,
  onDelete,
}) => {
  const isOwn =
    review.clienteId?._id === clientId ||
    review.clienteId === clientId;

  const [deleting, setDeleting] =
    useState(false);

  const handleDelete = async () => {
    if (
      !window.confirm(
        '¿Eliminar esta reseña?'
      )
    )
      return;

    setDeleting(true);

    try {
      await deleteReview(review._id);

      if (onDelete) {
        onDelete(review._id);
      }
    } catch (error) {
      setDeleting(false);
    }
  };

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
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems:
            'flex-start',
          justifyContent:
            'space-between',
          marginBottom: '10px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
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
              alignItems:
                'center',
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

          <div>
            <div
              style={{
                color: '#E8E4DC',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              {clientName}
            </div>

            <div
              style={{
                color: '#555',
                fontSize: '11px',
              }}
            >
              {date}
            </div>
          </div>
        </div>

        {isOwn && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              background:
                'transparent',
              border:
                '1px solid #2A2A2A',
              borderRadius: '6px',
              padding:
                '4px 8px',
              color: '#555',
              cursor:
                'pointer',
              fontSize: '13px',
            }}
          >
            <i className="ti ti-trash" />
          </button>
        )}
      </div>

      <StarRating
        value={review.score}
        readonly
      />

      <p
        style={{
          color: '#AAA',
          fontSize: '13px',
          margin:
            '8px 0 0',
          lineHeight: 1.6,
        }}
      >
        {review.comment}
      </p>

      <div
        style={{
          marginTop: '10px',
          paddingTop: '10px',
          borderTop:
            '1px solid #222',
          display: 'flex',
          gap: '6px',
          alignItems:
            'center',
        }}
      >
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
