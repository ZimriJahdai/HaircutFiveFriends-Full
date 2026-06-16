export const ReviewsTabs = ({
  tab,
  setTab,
}) => {


  const tabs = [
    {
      key: 'todas',
      label: 'Todas las reseñas'
    },

    {
      key: 'mias',
      label: 'Mis reseñas'
    }
  ];



  return (

    <div
      style={{
        display: 'flex',

        gap: '2px',

        marginBottom: '1.25rem',

        background: '#111',

        border:
          '1px solid #1E1E1E',

        borderRadius: '8px',

        padding: '4px',
      }}
    >


      {
        tabs.map(item => (

          <button

            key={item.key}

            onClick={() =>
              setTab(item.key)
            }


            style={{
              flex: 1,

              padding:
                '7px 12px',

              border: 'none',

              borderRadius: '6px',

              cursor: 'pointer',

              fontSize: '12px',

              fontWeight: 500,

              background:
                tab === item.key
                ? '#1A1A1A'
                : 'transparent',

              color:
                tab === item.key
                ? '#E8E4DC'
                : '#555',
            }}

          >

            {item.label}

          </button>

        ))
      }


    </div>

  );
};
