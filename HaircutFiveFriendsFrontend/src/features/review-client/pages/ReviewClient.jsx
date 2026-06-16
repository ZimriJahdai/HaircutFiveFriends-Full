import { useMemo, useState } from 'react';
import { useAuthStore } from '../../auth/store/authStore';
import { useReviews } from '../hooks/useReviews';
import { ReviewCard } from '../components/ReviewCard';
import { ReviewEmptyState } from '../components/ReviewEmptyState';
import { ReviewForm } from '../components/ReviewForm';
import { ReviewsStats } from '../components/ReviewsStats';
import { ReviewsTabs } from '../components/ReviewsTabs';


export const ReviewClient = () => {

  const user =
    useAuthStore(
      state => state.user
    );

  const clientId =
    user?.clientId ||
    user?.uid ||
    user?._id;

  const { reviews, loading, error, refetch } = useReviews();

  const [tab, setTab] =
    useState('todas');

  const [localReviews, setLocalReviews] = useState(null);

  // Use localReviews if set (after form submission), otherwise use store reviews
  const currentReviews = localReviews !== null ? localReviews : reviews;

  const filteredReviews =
    useMemo(() => {
      if (tab === 'mias') {
        return currentReviews.filter(
          review =>
            review.clienteId?._id === clientId ||
            review.clienteId === clientId
        );
      }
      return currentReviews;
    }, [
      currentReviews,
      tab,
      clientId
    ]);


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

          Comparte tu experiencia con Five Friends.

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
              padding: '3rem',
              textAlign: 'center',
              color: '#555'
            }}
          >
            Cargando reseñas...
          </div>
        ) : (
          <div>
            <ReviewForm
              reviews={currentReviews}
              setReviews={setLocalReviews}
            />

            <ReviewsTabs
              tab={tab}
              setTab={setTab}
            />

            <ReviewsStats
              reviews={filteredReviews}
            />

            {
              filteredReviews.length === 0 ? (
                <ReviewEmptyState
                  message={
                    tab === 'mias'
                    ? 'Aún no has escrito ninguna reseña.'
                    : 'No hay reseñas todavía.'
                  }
                />
              ) : (
                <div
                  style={{
                    display: 'grid',

                    gridTemplateColumns:
                      'repeat(auto-fit,minmax(280px,1fr))',

                    gap: '16px',
                  }}
                >
                  {
                    filteredReviews.map(review => (

                      <ReviewCard

                        key={review._id}

                        review={review}

                        clientId={clientId}

                        onDelete={(id) => {

                          const updater = prev =>
                            prev.filter(
                              item =>
                                item._id !== id
                            );

                          if (localReviews !== null) {
                            setLocalReviews(updater);
                          }
                          refetch();
                        }}
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
