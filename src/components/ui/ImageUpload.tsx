import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface ImageUploadProps {
  onFilesChange: (files: File[]) => void; // Callback pour envoyer les fichiers au parent
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onFilesChange }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Générer des URLs de prévisualisation pour les nouvelles images
    const newPreviews = acceptedFiles.map((file) => URL.createObjectURL(file));

    // Mettre à jour les fichiers et les prévisualisations
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    setPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);

    // Notifier le parent des nouveaux fichiers
    onFilesChange([...files, ...acceptedFiles]);
  }, [files, onFilesChange]);

  const removeImage = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    setFiles(newFiles);
    setPreviews(newPreviews);

    // Notifier le parent des fichiers mis à jour
    onFilesChange(newFiles);

    // Libérer l'URL de prévisualisation
    URL.revokeObjectURL(previews[index]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    multiple: true,
  });

  React.useEffect(() => {
    return () => {
      // Libérer les URLs de prévisualisation lors du démontage du composant
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [previews]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {previews.map((preview, index) => (
          <div key={index} className="relative group aspect-square">
            <img
              src={preview}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <input {...getInputProps()} />
        <PhotoIcon className="h-12 w-12 text-gray-400" />
        {isDragActive ? (
          <p className="mt-2 text-sm text-gray-600">Déposez les images ici...</p>
        ) : (
          <div className="text-center">
            <p className="mt-2 text-sm text-gray-600">
              Glissez-déposez des images ici, ou
              <span className="text-blue-500 hover:text-blue-600 cursor-pointer"> parcourir</span>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              PNG, JPG, GIF jusqu'à 10MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;