import { useReviewForm } from '../hooks/useReviewForm';
import { ReviewFormToggle } from './ReviewFormToggle';
import { ReviewFormFields } from './ReviewFormFields';

export const ReviewForm = () => {
  const {
    services, barbers, form, setForm,
    showForm, setShowForm, saving, error, success, submit,
  } = useReviewForm();

  return (
    <>
      <ReviewFormToggle
        showForm={showForm}
        onClick={() => setShowForm((prev) => !prev)}
        success={success}
      />
      {showForm && (
        <ReviewFormFields
          form={form}
          setForm={setForm}
          services={services}
          barbers={barbers}
          error={error}
          saving={saving}
          onSubmit={submit}
        />
      )}
    </>
  );
};
