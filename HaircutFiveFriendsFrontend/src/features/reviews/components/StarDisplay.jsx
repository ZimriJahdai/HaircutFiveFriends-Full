export const StarDisplay = ({ value }) => (
  <span className="text-[#C9A84C] text-sm">
    {'★'.repeat(Math.round(value))}
    {'☆'.repeat(5 - Math.round(value))}
  </span>
);
