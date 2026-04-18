import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { apiKeysService } from "@/services/api-keys.service";
import { HttpError } from "@/services/api-client";
import type { ApiKeyRecord, CreateApiKeyResponse } from "@/types/api";

interface ApiKeyState {
  keys: ApiKeyRecord[];
  latestCreatedKey: string | null;
  isLoading: boolean;
  isCreating: boolean;
  revokingKeyId: string | null;
  error: string | null;
}

const initialState: ApiKeyState = {
  keys: [],
  latestCreatedKey: null,
  isLoading: false,
  isCreating: false,
  revokingKeyId: null,
  error: null,
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof HttpError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
};

const sortKeysByCreatedDate = (keys: ApiKeyRecord[]) =>
  [...keys].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() -
      new Date(first.createdAt).getTime(),
  );

export const fetchApiKeys = createAsyncThunk<
  ApiKeyRecord[],
  void,
  { rejectValue: string }
>("apiKey/fetchApiKeys", async (_, { rejectWithValue }) => {
  try {
    const response = await apiKeysService.list();
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const createApiKey = createAsyncThunk<
  CreateApiKeyResponse,
  { name: string; expiresAt?: string },
  { rejectValue: string }
>("apiKey/createApiKey", async (payload, { rejectWithValue }) => {
  try {
    const response = await apiKeysService.create(payload);
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const revokeApiKey = createAsyncThunk<
  { id: string; revokedAt: string },
  string,
  { rejectValue: string }
>("apiKey/revokeApiKey", async (id, { rejectWithValue }) => {
  try {
    const response = await apiKeysService.revoke(id);
    return { id, revokedAt: response.data.revokedAt };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const apiKeySlice = createSlice({
  name: "apiKey",
  initialState,
  reducers: {
    clearApiKeyError: (state) => {
      state.error = null;
    },
    setApiKeyError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearLatestApiKey: (state) => {
      state.latestCreatedKey = null;
    },
    setLatestApiKey: (state, action: PayloadAction<string | null>) => {
      state.latestCreatedKey = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApiKeys.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApiKeys.fulfilled, (state, action) => {
        state.isLoading = false;
        state.keys = sortKeysByCreatedDate(action.payload);
      })
      .addCase(fetchApiKeys.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to load API keys";
      })
      .addCase(createApiKey.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createApiKey.fulfilled, (state, action) => {
        state.isCreating = false;
        state.latestCreatedKey = action.payload.apiKey;

        const newRecord = action.payload.metadata;
        const filteredKeys = state.keys.filter(
          (item) => item._id !== newRecord._id,
        );
        state.keys = sortKeysByCreatedDate([newRecord, ...filteredKeys]);
      })
      .addCase(createApiKey.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload ?? "Failed to create API key";
      })
      .addCase(revokeApiKey.pending, (state, action) => {
        state.revokingKeyId = action.meta.arg;
        state.error = null;
      })
      .addCase(revokeApiKey.fulfilled, (state, action) => {
        state.revokingKeyId = null;

        state.keys = state.keys.map((item) =>
          item._id === action.payload.id
            ? { ...item, revokedAt: action.payload.revokedAt }
            : item,
        );
      })
      .addCase(revokeApiKey.rejected, (state, action) => {
        state.revokingKeyId = null;
        state.error = action.payload ?? "Failed to revoke API key";
      });
  },
});

export const {
  clearApiKeyError,
  clearLatestApiKey,
  setApiKeyError,
  setLatestApiKey,
} = apiKeySlice.actions;
export default apiKeySlice.reducer;
