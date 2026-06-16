export const ReviewsStats = ({
  reviews
}) => {


  const total =
    reviews.length;



  const average =
    total > 0
      ? (
          reviews.reduce(
            (sum, review) =>
              sum + review.score,
            0
          ) / total
        ).toFixed(1)

      : '—';




  return (

    <div
      style={{
        display: 'flex',

        gap: '12px',

        marginBottom: '1.25rem',

        flexWrap: 'wrap',
      }}
    >


      <StatCard

        value={total}

        label="reseñas"

      />


      <StatCard

        value={average}

        label="promedio ★"

      />


    </div>

  );

};




const StatCard = ({
  value,
  label
}) => (

  <div
    style={{
      background: '#1A1A1A',

      border:
        '1px solid #2A2A2A',

      borderRadius: '8px',

      padding:
        '10px 16px',

      display: 'flex',

      alignItems: 'center',

      gap: '10px',
    }}
  >

    <span
      style={{
        fontFamily:
          "'Bebas Neue',sans-serif",

        fontSize: '24px',

        color: '#C9A84C',
      }}
    >
      {value}
    </span>


    <span
      style={{
        fontSize: '12px',

        color: '#555',
      }}
    >
      {label}
    </span>


  </div>

);
