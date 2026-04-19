import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { folderService } from "@/services/folder.service";
import { selectCurrentUser } from "@/redux/selectors/authSelectors";
import {
  selectCurrentFolder,
  selectFolderBreadcrumb,
  selectFolderDeleting,
  selectFolderError,
  selectFolderLoading,
  selectFolders,
} from "@/redux/selectors/folderSelectors";
import {
  selectDeletingImageId,
  selectImageError,
  selectImageLoading,
  selectImages,
  selectSelectedImage,
} from "@/redux/selectors/imageSelectors";
import {
  adjustCurrentFolderSize,
  deleteFolder,
  fetchFolderContent,
  fetchFolders,
  setBreadcrumb,
} from "@/redux/slices/folderSlice";
import { deleteImage, setSelectedImage } from "@/redux/slices/imageSlice";
import type { BreadcrumbFolder, Folder, Image } from "@/types/api";

const makeBreadcrumbItem = (folder: Folder): BreadcrumbFolder => ({
  _id: folder._id,
  name: folder.name,
});

export function useDashboardPage() {
  const dispatch = useAppDispatch();
  const { folderId } = useParams<{ folderId?: string }>();

  const user = useAppSelector(selectCurrentUser);
  const folders = useAppSelector(selectFolders);
  const currentFolder = useAppSelector(selectCurrentFolder);
  const breadcrumb = useAppSelector(selectFolderBreadcrumb);
  const folderLoading = useAppSelector(selectFolderLoading);
  const folderError = useAppSelector(selectFolderError);
  const deletingFolderId = useAppSelector(selectFolderDeleting);

  const images = useAppSelector(selectImages);
  const imageLoading = useAppSelector(selectImageLoading);
  const imageError = useAppSelector(selectImageError);
  const deletingImageId = useAppSelector(selectDeletingImageId);
  const selectedImage = useAppSelector(selectSelectedImage);

  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const buildBreadcrumbTrail = async (
      activeFolder: Folder,
    ): Promise<BreadcrumbFolder[]> => {
      const trail: BreadcrumbFolder[] = [makeBreadcrumbItem(activeFolder)];
      let parentId = activeFolder.parentId;

      while (parentId) {
        const response = await folderService.getFolderContent(parentId);
        const parentFolder = response.data.data.currentFolder;

        if (!parentFolder) {
          break;
        }

        trail.unshift(makeBreadcrumbItem(parentFolder));
        parentId = parentFolder.parentId;
      }

      return trail;
    };

    const loadDashboardContent = async () => {
      if (!folderId) {
        await dispatch(fetchFolders());
        return;
      }

      const result = await dispatch(fetchFolderContent({ folderId }));

      if (!fetchFolderContent.fulfilled.match(result) || cancelled) {
        return;
      }

      const activeFolder = result.payload.currentFolder;

      if (!activeFolder) {
        dispatch(setBreadcrumb([]));
        return;
      }

      const trail = await buildBreadcrumbTrail(activeFolder);

      if (!cancelled) {
        dispatch(setBreadcrumb(trail));
      }
    };

    void loadDashboardContent();

    return () => {
      cancelled = true;
    };
  }, [dispatch, folderId]);

  const handleDeleteFolder = async (folder: Folder) => {
    const confirmed = window.confirm(
      `Delete "${folder.name}" and all nested content?`,
    );

    if (!confirmed) {
      return;
    }

    await dispatch(deleteFolder(folder._id));
  };

  const handleDeleteImage = async (image: Image) => {
    const confirmed = window.confirm(`Delete "${image.name}"?`);

    if (!confirmed) {
      return;
    }

    const resultAction = await dispatch(deleteImage(image._id));

    if (deleteImage.fulfilled.match(resultAction)) {
      dispatch(adjustCurrentFolderSize(-image.size));
    }
  };

  const handlePreviewImage = (image: Image) => {
    dispatch(setSelectedImage(image));
    setPreviewOpen(true);
  };

  const handlePreviewChange = (open: boolean) => {
    setPreviewOpen(open);

    if (!open) {
      dispatch(setSelectedImage(null));
    }
  };

  const isLoading = folderLoading || imageLoading;
  const surfaceTitle = currentFolder ? currentFolder.name : "Root workspace";
  const helperText = currentFolder
    ? "Manage subfolders and images together in one view."
    : "Create folders at the root, then open one to upload and manage images.";

  return {
    user,
    folders,
    currentFolder,
    breadcrumb,
    folderError,
    deletingFolderId,
    images,
    imageError,
    deletingImageId,
    selectedImage,
    previewOpen,
    isLoading,
    surfaceTitle,
    helperText,
    handleDeleteFolder,
    handleDeleteImage,
    handlePreviewImage,
    handlePreviewChange,
  };
}
