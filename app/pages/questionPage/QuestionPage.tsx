import { useNavigate, useParams } from "react-router";
import { useFetchQuestion } from "../../hooks/useFetchQuestion";
import { ErrorState } from "../../components/ErrorState";
import { LoadingState } from "../../components/LoadingState";
import { QuestionDetails } from "./QuestionDetails";
import { QuestionAnswer } from "./QuestionAnswer";
import { QuestionComment } from "./QuestionComment";
import { UnsavedChangesModal } from "./UnsavedChangesModal";
import { useState } from "react";
import { QuestionHistory } from "./QuestionHistory";
import { useUser } from "../../hooks/useUser";
import { useContext } from "../../hooks/useContext";
import { useFetchCommentsForQuestion } from "../../hooks/useComments";
import { useFetchAnswersForQuestion } from "../../hooks/useAnswers";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";

export default function QuestionPage() {
  const { recordId, contextId } = useParams();

  const {
    data: context,
    error: contextError,
    isPending: contextIsLoading,
  } = useContext(contextId);

  const {
    data: question,
    error: questionError,
    isPending: questionIsLoading,
  } = useFetchQuestion(context?.formId, recordId);

  const {
    data: answers,
    error: answersError,
    isPending: answersIsLoading,
  } = useFetchAnswersForQuestion(contextId, recordId);

  const {
    data: comments,
    error: commentsError,
    isPending: commentsIsLoading,
  } = useFetchCommentsForQuestion(contextId, recordId);

  const {
    data: userinfo,
    error: userinfoError,
    isPending: userinfoIsLoading,
  } = useUser();

  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const onDiscardOpen = () => setIsDiscardOpen(true);
  const onDiscardClose = () => setIsDiscardOpen(false);

  const [isCommentEditing, setIsCommentEditing] = useState(false);
  const navigate = useNavigate();

  if (
    questionIsLoading ||
    answersIsLoading ||
    commentsIsLoading ||
    userinfoIsLoading ||
    contextIsLoading
  ) {
    return <LoadingState />;
  }

  if (
    questionError ||
    answersError ||
    commentsError ||
    userinfoError ||
    contextError
  ) {
    return <ErrorState message="Noe gikk galt, prøv gjerne igjen" />;
  }

  const handleDiscard = () => {
    navigate(-1);
  };

  const handleBackButton = () => {
    if (isCommentEditing) {
      onDiscardOpen();
    } else {
      handleDiscard();
    }
  };

  if (!context.formId || !recordId || !contextId) {
    return null;
  }

  return (
    <div className="flex flex-col mt-8">
      <Button
        variant="link"
        onClick={handleBackButton}
        className="flex justify-start ml-2 text-lg"
      >
        <ArrowLeft className="size-5" />
        Tilbake
      </Button>
      <UnsavedChangesModal
        onOpen={onDiscardOpen}
        onClose={onDiscardClose}
        isOpen={isDiscardOpen}
        onDiscard={handleDiscard}
      />
      <div className="self-center flex flex-col gap-2 w-full lg:w-1/2 p-10 lg:p-0">
        <QuestionDetails
          question={question}
          answerUpdated={answers.at(-1)?.updated}
          formId={context.formId}
        />
        <Separator className="my-10" />
        <QuestionAnswer
          question={question}
          answers={answers}
          contextId={contextId}
          user={userinfo.user}
          choices={question.metadata.answerMetadata.options}
          answerExpiry={question.metadata.answerMetadata.expiry}
        />
        <Separator className="my-10" />
        <QuestionComment
          question={question}
          latestComment={comments.at(-1)?.comment ?? ""}
          contextId={contextId}
          isEditing={isCommentEditing}
          setIsEditing={setIsCommentEditing}
          user={userinfo.user}
        />
        <Separator className="my-10" />
        <QuestionHistory answers={answers} />
      </div>
    </div>
  );
}
