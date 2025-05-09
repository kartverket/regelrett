import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDeleteContext } from '../../hooks/useContext';
import { Trash2 } from 'lucide-react';

type Props = {
  onClose: () => void;
  isOpen: boolean;
  contextId: string;
  teamId: string;
};
export function DeleteContextModal({
  onClose,
  isOpen,
  contextId,
  teamId,
}: Props) {
  const { mutate: deleteContext, isPending: isLoading } = useDeleteContext(
    contextId,
    teamId,
    onClose
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Slett skjemautfylling</DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-base">
          Er du sikker på at du vil slette skjemautfyllingen?
        </DialogDescription>

        <DialogFooter className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Avbryt
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteContext()}
            disabled={isLoading}
          >
            {isLoading ? (
              'Sletter...'
            ) : (
              <>
                <Trash2 className="size-5" />
                Slett skjemautfylling
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
