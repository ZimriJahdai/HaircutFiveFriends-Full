import { useReviewStats } from '../hooks/useReviewStats';


export const ReviewsStats = ({
  reviews
}) => {


  const {
    totalReviews,
    averageScore,
    totalBarbers,
    serviceReviews,

  } = useReviewStats(reviews);



  const stats = [

    {
      label: 'Total reseñas',
      value: totalReviews,
      icon: 'ti-message',
    },

    {
      label: 'Calificación promedio',
      value: `${averageScore} ★`,
      icon: 'ti-star',
    },

    {
      label: 'Barberos evaluados',
      value: totalBarbers,
      icon: 'ti-id-badge',
    },

    {
      label: 'Reseñas de servicio',
      value: serviceReviews,
      icon: 'ti-scissors',
    },

  ];



  return (

    <div
      style={{
        display:
          'grid',

        gridTemplateColumns:
          'repeat(auto-fit,minmax(160px,1fr))',

        gap: '10px',

        marginBottom: '1.5rem',
      }}
    >


      {
        stats.map(stat => (

          <div
            key={stat.label}

            style={{
              background: '#1A1A1A',

              borderLeft:
                '3px solid #C9A84C',

              borderRadius:
                '0 8px 8px 0',

              padding:
                '14px 16px',
            }}
          >


            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',

                marginBottom: '6px',
              }}
            >

              <span
                style={{
                  fontSize: '11px',
                  color: '#5A5A5A',
                }}
              >
                {stat.label}
              </span>


              <i
                className={`ti ${stat.icon}`}

                style={{
                  color: '#C9A84C',
                  opacity: .5,
                }}
              />

            </div>



            <div
              style={{
                fontFamily:
                  "'Bebas Neue',sans-serif",

                fontSize: '26px',

                color: '#E8E4DC',

                lineHeight: 1,
              }}
            >
              {stat.value}
            </div>


          </div>

        ))
      }


    </div>

  );
};
