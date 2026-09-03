import { Button } from '../ui/Button';

export const FormActions = ({
  onCancel,
  submitLabel = 'Simpan',
  isLoading = false,
  formId,
  onSubmitClick,
}) => {
  return (
    <div className="flex items-center gap-2 pt-2">
      <Button type={formId || onSubmitClick ? 'button' : 'submit'} size="sm" isLoading={isLoading} form={formId} onClick={onSubmitClick}>
        {submitLabel}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
        Batal
      </Button>
    </div>
  );
};
