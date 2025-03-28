import {
  SelectLabel,
  SelectRoot,
  SelectValueText,
  SelectTrigger,
  SelectIndicatorGroup,
  SelectIndicator,
  Spinner,
  createListCollection,
  SelectContent,
  SelectItem,
} from '@kvib/react';
import { useSearchParams } from 'react-router';
import { useFetchAllContexts } from '../../hooks/useContext';
import { useMemo } from 'react';

export function CopyContextDropdown({
  setCopyContext,
}: {
  setCopyContext: (context: string) => void;
}) {
  const [searchParams] = useSearchParams();
  const formId = searchParams.get('formId');
  const copyContext = searchParams.get('copyContext');

  const { data: contexts, isPending: contextsIsLoading } =
    useFetchAllContexts();

  const contextsCollection = useMemo(() => {
    return createListCollection({
      items: contexts?.filter((context) => context.formId == formId) ?? [],
      itemToString: (context) => context.name,
      itemToValue: (context) => context.id,
    });
  }, [contexts, formId]);

  const isDisabled = contextsCollection.size === 0;

  return (
    <SelectRoot
      deselectable
      disabled={isDisabled}
      collection={contextsCollection}
      id="select"
      onValueChange={(e) => setCopyContext(e.value[0])}
      value={copyContext ? [copyContext] : []}
    >
      <SelectLabel fontWeight="bold">
        Kopier svar fra eksisterende skjema
      </SelectLabel>
      <SelectTrigger bgColor="white">
        <SelectValueText
          placeholder={
            isDisabled ? 'Ingen eksisterende skjema funnet' : 'Velg skjema'
          }
        />
        <SelectIndicatorGroup>
          {contextsIsLoading && <Spinner size="xs" borderWidth="1.5px" />}
          <SelectIndicator />
        </SelectIndicatorGroup>
      </SelectTrigger>
      <SelectContent>
        {contextsCollection.items.map((context) => (
          <SelectItem key={context.id} item={context}>
            {context.name}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
}
