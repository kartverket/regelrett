import { Dispatch, SetStateAction } from "react";
import { Td, Tr } from "@kvib/react";
import { Answer, AnswerType, Fields } from "../answer/Answer";
import "./questionRow.css";
import { formatDateTime } from "../../utils/formatTime";

interface QuestionRowProps {
  record: Record<string, Fields>;
  choices: string[] | [];
  answer: AnswerType;
  setFetchNewAnswers: Dispatch<SetStateAction<boolean>>;
  fetchNewAnswers: boolean;
}

const sanitizeClassName = (name: string) => {
  if (name?.includes("(") && name?.includes(")")) {
    return name.replace(/\(|\)/g, "-");
  }
  return name;
};

export const QuestionRow = (props: QuestionRowProps) => {
  return (
    <Tr>
        <Td>{props.answer ? formatDateTime(props.answer.updated) : ""}</Td>
        <Td className="id">{props.record.fields.ID} </Td>
        <Td className="question">{props.record.fields.Aktivitiet}</Td>
        <Td><div className={`circle ${sanitizeClassName(props.record.fields.Pri)}`}>{props.record.fields.Pri}</div></Td>
      <Td className="finished">{props.answer ? "Utfylt" : "Ikke utfylt"}</Td>
      <Td className="answer">
        <Answer
          choices={props.choices}
          answer={props.answer}
          record={props.record}
          setFetchNewAnswers={props.setFetchNewAnswers}
          fetchNewAnswers={props.fetchNewAnswers}
        />
      </Td>
    </Tr>
  );
};