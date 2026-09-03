import { Button } from '../ui/Button';

export const FormActions = ({
  onCancel,
  submitLabel = 'Simpan',
  isLoading = false,
  formId,
  onSubmitClick,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-end gap-2 ${className}`}>
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
        Batal
      </Button>
      <Button
        type={formId || onSubmitClick ? 'button' : 'submit'}
        size="sm"
        isLoading={isLoading}
        form={formId}
        onClick={onSubmitClick}
      >
        {submitLabel}
      </Button>
    </div>
  );
};
