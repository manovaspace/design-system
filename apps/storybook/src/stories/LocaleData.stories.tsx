import { DataValue, FieldMessage, PhoneNumber } from "@manovaspace/ui";

export default {
  title: "Composed/Locale data",
};

export function PersianReadouts() {
  return (
    <div className="flex flex-col gap-4" dir="rtl">
      <DataValue value={1234567.89} locale="fa-IR" />
      <PhoneNumber value="09121234567" locale="fa-IR" />
      <FieldMessage variant="error">مقدار واردشده معتبر نیست.</FieldMessage>
    </div>
  );
}
