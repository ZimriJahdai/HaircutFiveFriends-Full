import { useMemo, useState } from 'react';
import { useReviews } from '../hooks/useReviews';
import { ReviewCard } from '../components/ReviewCard';
import { ReviewEmptyState } from '../components/ReviewEmptyState';
import { ReviewsStats } from '../components/ReviewsStats';
import { ReviewsCharts } from '../components/ReviewsCharts';
import { ReviewsFilter } from '../components/ReviewsFilter';


export const ReviewAdmin = () => {

  const { reviews, loading, error } = useReviews();

  const [filter, setFilter] = useState('todos');


  const filteredReviews = useMemo(() => {

    switch (filter) {

      case 'barbero':
        return reviews.filter(
          review => review.barberoId
        );


      case 'servicio':
        return reviews.filter(
          review => review.servicioId
        );


      default:
        return reviews;
    }

  }, [reviews, filter]);



  return (
    <div
      className="
        font-sans
        text-[#E8E4DC]
        w-full
      "
    >

      {/* Fuentes e iconos */}

      <link

        href="
        https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500&display=swap
        "

        rel="stylesheet"

      />


      <link

        rel="
        stylesheet
        "

        href="
        https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css
        "

      />



      {/* Header */}

      <div
        style={{
          marginBottom: '1.5rem',
        }}
      >

        <h1

          style={{

            fontFamily:
              "'Bebas Neue', sans-serif",

            fontSize: '38px',

            letterSpacing: '3px',

            color: '#E8E4DC',

            margin: 0,

          }}

        >

          Reseñas

        </h1>


        <p
          style={{
            color: '#5A5A5A',

            fontSize: '13px',

            marginTop: '5px',
          }}
        >

          Vista general de las calificaciones recibidas.

        </p>


      </div>



      <div
        style={{

          height: '1px',

          background:
            '#C9A84C33',

          marginBottom: '1.5rem',

        }}
      />




      {
        error && (

          <div

            style={{

              background: '#2A1515',

              border:
                '1px solid #5A2020',

              color: '#E88',

              padding: '12px',

              borderRadius: '8px',

              marginBottom: '15px',

            }}

          >

            {error}

          </div>

        )
      }


      {
        loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '3rem',
              color: '#555',
            }}
          >
            Cargando reseñas...
          </div>
        ) : (
          <div>
            {/* Estadísticas */}
            <ReviewsStats
              reviews={reviews}
            />

            {/* Gráficas */}
            <ReviewsCharts
              reviews={reviews}
            />

            {/* Filtro */}
            <ReviewsFilter
              filter={filter}
              setFilter={setFilter}
              total={
                filteredReviews.length
              }
            />

            {/* Lista */}
            {
              filteredReviews.length === 0 ? (

                <ReviewEmptyState
                  icon="ti-message-off"
                  message="No hay reseñas con este filtro."
                />

              ) : (

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >

                  {
                    filteredReviews.map(review => (

                      <ReviewCard
                        key={review._id}
                        review={review}
                        isAdmin={true}
                      />

                    ))
                  }

                </div>

              )
            }
          </div>
        )
      }

    </div>

  );

};
