import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectFolderCreating } from "@/redux/selectors/folderSelectors";
import { createFolder } from "@/redux/slices/folderSlice";

export function useCreateFolderDialog(parentId: string | null) {
  const dispatch = useAppDispatch();
  const isCreating = useAppSelector(selectFolderCreating);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setName("");
      setError(null);
    }
  };

  const handleNameChange = (nextName: string) => {
    setName(nextName);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Folder name is required.");
      return;
    }

    try {
      await dispatch(createFolder({ name: trimmedName, parentId })).unwrap();
      setName("");
      setError(null);
      setOpen(false);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : String(submissionError),
      );
    }
  };

  const handleNameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleSubmit();
    }
  };

  return {
    isCreating,
    open,
    name,
    error,
    handleOpenChange,
    handleNameChange,
    handleNameKeyDown,
    closeDialog,
    handleSubmit,
  };
}
