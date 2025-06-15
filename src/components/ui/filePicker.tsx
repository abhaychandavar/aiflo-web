'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const FilePicker = ({onFileSelected}: {
  onFileSelected: (file: File) => any,
}) => {
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      onFileSelected(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    }
  });

  return (
      <div
        {...getRootProps()}
        className="mt-2 p-4 border-2 border-dashed rounded-md text-center cursor-pointer hover:bg-muted transition-all"
      >
        <input {...getInputProps()} />
        {
          isDragActive ?
            <p>Drop the document here...</p> :
            <p>Drag & drop a document here, or click to upload</p>
        }
      </div>
  );
};


export default FilePicker;