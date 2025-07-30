import type { Question } from "../../api/types";
import Markdown from "react-markdown";
import { markdownComponents } from "../../utils/markdownComponents";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { useFetchColumns } from "../../hooks/useFetchColumns";
import colorUtils from "../../utils/colorUtils";
import { formatDateTime, isOlderThan } from "../../utils/formatTime";
import { Badge } from "../../components/ui/badge";

type Props = {
  question: Question;
  answerUpdated: Date;
  formId: string;
};

export function QuestionDetails({ question, answerUpdated, formId }: Props) {
  const {
    data: columns,
    error: columnsError,
    isPending: columnsIsLoading,
  } = useFetchColumns(formId);

  if (columnsIsLoading) return <LoadingState />;
  if (columnsError)
    return <ErrorState message="Noe gikk galt, prøv gjerne igjen" />;

  const findFieldValue = (key: string) =>
    question.metadata.optionalFields?.find((field) => field.key === key)
      ?.value[0];

  const getColumnColor = (key: string) =>
    columns
      .find((column) => column.name === key)
      ?.options?.find((option) => option.name === findFieldValue(key))?.color;

  const fieldData = question.metadata.optionalFields?.slice(3).map((field) => {
    const fieldValue = findFieldValue(field.key) || "Ikke oppgitt";
    const fieldColor = getColumnColor(field.key) || "grayLight1";
    const fieldBackgroundColorHex = colorUtils.getHexForColor(fieldColor);
    const fieldUseWhiteTextColor =
      colorUtils.shouldUseLightTextOnColor(fieldColor);

    return {
      key: field.key,
      value: fieldValue,
      backgroundColor: fieldBackgroundColorHex ?? "#FFFFFF",
      useWhiteText: fieldUseWhiteTextColor,
    };
  });

  const description =
    findFieldValue("Sikkerhetskontroller") || findFieldValue("Beskrivelse");
  const name = findFieldValue("Kortnavn") || findFieldValue("Navn");

  return (
    <div className="space-y-1">
      <p>{question.id}</p>
      <p className="text-2xl font-bold">{name}</p>
      <div className="flex flex-col gap-4 py-5">
        {fieldData?.map((field) => (
          <div className="flex items-center gap-4" key={field.key}>
            <div className="font-bold min-w-24">{field.key}:</div>
            <Badge
              style={{
                backgroundColor: field.backgroundColor ?? "#FFFFFF",
              }}
              className={`text-${field.useWhiteText ? "white" : "black"}`}
            >
              {field.value}
            </Badge>
          </div>
        ))}
        <div className="flex items-center gap-4">
          <p className="font-bold min-w-24">Sist endret:</p>
          <p
            className={
              isOlderThan(
                answerUpdated,
                question.metadata.answerMetadata.expiry,
              )
                ? "text-destructive"
                : "text-black"
            }
          >
            {formatDateTime(answerUpdated)}
          </p>
        </div>
      </div>
      <div className="bg-secondary p-4 rounded-xl">
        <p className="font-bold">Beskrivelse:</p>
        <Markdown components={markdownComponents}>{description}</Markdown>
      </div>
    </div>
  );
}
