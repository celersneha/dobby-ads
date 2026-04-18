import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  selectApiKeyCreating,
  selectApiKeyError,
  selectApiKeyLoading,
  selectApiKeys,
  selectHasActiveApiKeys,
  selectLatestApiKey,
  selectRevokingApiKeyId,
} from "@/redux/selectors/apiKeySelectors";
import {
  clearApiKeyError,
  clearLatestApiKey,
  createApiKey,
  fetchApiKeys,
  revokeApiKey,
  setApiKeyError,
} from "@/redux/slices/apiKeySlice";

const toIsoInDays = (days: number): string => {
  const now = Date.now();
  return new Date(now + days * 24 * 60 * 60 * 1000).toISOString();
};

export const formatApiKeyDate = (value: string | null): string => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
};

export function useApiKeysPage() {
  const dispatch = useAppDispatch();

  const keys = useAppSelector(selectApiKeys);
  const isLoading = useAppSelector(selectApiKeyLoading);
  const isSubmitting = useAppSelector(selectApiKeyCreating);
  const revokingKeyId = useAppSelector(selectRevokingApiKeyId);
  const error = useAppSelector(selectApiKeyError);
  const latestKey = useAppSelector(selectLatestApiKey);
  const hasActiveKeys = useAppSelector(selectHasActiveApiKeys);

  const [newKeyName, setNewKeyName] = useState("");
  const [expiryDays, setExpiryDays] = useState<number>(90);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    void dispatch(fetchApiKeys());
  }, [dispatch]);

  const handleCreate = async () => {
    if (!newKeyName.trim()) {
      dispatch(setApiKeyError("API key name is required"));
      return;
    }

    dispatch(clearApiKeyError());

    const result = await dispatch(
      createApiKey({
        name: newKeyName.trim(),
        expiresAt: expiryDays > 0 ? toIsoInDays(expiryDays) : undefined,
      }),
    );

    if (createApiKey.fulfilled.match(result)) {
      setCreateDialogOpen(false);
      setNewKeyName("");
      setExpiryDays(90);
    }
  };

  const handleRevoke = async (keyId: string) => {
    const confirmed = window.confirm(
      "Revoke this API key? Existing Claude/MCP sessions using it will stop working.",
    );

    if (!confirmed) {
      return;
    }

    await dispatch(revokeApiKey(keyId));
  };

  const handleCopyLatestKey = async () => {
    if (!latestKey) {
      return;
    }

    try {
      await navigator.clipboard.writeText(latestKey);
      window.alert("API key copied to clipboard");
    } catch {
      window.alert("Could not copy automatically. Please copy manually.");
    }
  };

  const hideLatestKey = () => {
    dispatch(clearLatestApiKey());
  };

  return {
    keys,
    isLoading,
    isSubmitting,
    revokingKeyId,
    error,
    latestKey,
    hasActiveKeys,
    newKeyName,
    expiryDays,
    createDialogOpen,
    setNewKeyName,
    setExpiryDays,
    setCreateDialogOpen,
    handleCreate,
    handleRevoke,
    handleCopyLatestKey,
    hideLatestKey,
  };
}
