export const StarDisplay = ({ value }) => (
  <span
    style={{
      color: '#C9A84C',
      fontSize: '14px',
    }}
  >
    {'★'.repeat(Math.round(value))}
    {'☆'.repeat(5 - Math.round(value))}
  </span>
);
