import { useContext } from '@/hooks/useContext';
import { Link as ReactRouterLink } from 'react-router';
import { ActiveFilter } from '@/types/tableTypes';
import { DeleteContextModal } from '@/pages/frontPage/DeleteContextModal';
import { ProgressCircle } from '@/pages/frontPage/ProgressCircle';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState } from 'react';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ContextLink({
  contextId,
  formId,
}: {
  contextId: string;
  formId: string;
}) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  function TruncatedText({
    str,
    maxLength,
  }: {
    str: string;
    maxLength: number;
  }) {
    if (str.length > maxLength) {
      return (
        <Tooltip>
          <TooltipTrigger>
            <p className="font-bold text-lg">{str.slice(0, maxLength)}...</p>
          </TooltipTrigger>
          <TooltipContent>{str}</TooltipContent>
        </Tooltip>
      );
    } else {
      return <p className="font-bold text-lg">{str}</p>;
    }
  }

  const { data: context, isPending: contextIsPending } = useContext(contextId);

  return (
    <SkeletonLoader
      loading={contextIsPending}
      width="w-[450px]"
      height="h-[98px]"
    >
      {context && (
        <ReactRouterLink
          to={`/context/${contextId}?${JSON.parse(
            localStorage.getItem(`filters_${context.formId}`) || `[]`
          )
            .map(
              (filter: ActiveFilter) => `filter=${filter.id}_${filter.value}`
            )
            .join('&')}`}
        >
          <Card className="min-w-[450px] py-4 transition hover:bg-secondary hover:shadow-md">
            <CardContent className="w-full self-start">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1 items-start">
                  <TruncatedText str={context?.name ?? ''} maxLength={27} />
                  <Button
                    aria-label="Slett utfylling"
                    variant="link"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsDeleteOpen(true);
                    }}
                    className="text-destructive hover:text-destructive p-0"
                  >
                    Slett skjemautfyllingen
                  </Button>
                </div>
                <ProgressCircle contextId={contextId} formId={formId} />
              </div>
            </CardContent>
          </Card>
        </ReactRouterLink>
      )}
      <DeleteContextModal
        onClose={() => setIsDeleteOpen(false)}
        isOpen={isDeleteOpen}
        teamId={context?.teamId ?? ''}
        contextId={contextId}
      />
    </SkeletonLoader>
  );
}
