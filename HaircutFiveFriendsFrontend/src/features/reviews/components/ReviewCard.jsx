import { ReviewCardAdmin } from './ReviewCardAdmin';
import { ReviewCardClient } from './ReviewCardClient';

export const ReviewCard = ({ review, isAdmin = false, userEmail }) => {
  if (isAdmin) {
    return <ReviewCardAdmin review={review} />;
  }

  const isOwn = (
    review.clienteId?.email?.toLowerCase() === userEmail?.toLowerCase()
  );

  return <ReviewCardClient review={review} isOwn={isOwn} />;
};
