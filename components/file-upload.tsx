'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone' // Need to install this? Yes.
import { UploadCloud, FileSpreadsheet, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface FileUploadProps {
    onFileSelect: (file: File) => void
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null)

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles?.[0]) {
            setFile(acceptedFiles[0])
            onFileSelect(acceptedFiles[0])
        }
    }, [onFileSelect])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
        },
        maxFiles: 1
    })

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation()
        setFile(null)
    }

    return (
        <div className="w-full max-w-lg mx-auto">
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-lg p-10 transition-colors cursor-pointer flex flex-col items-center justify-center gap-4",
                    isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
                    file ? "border-primary bg-primary/5" : ""
                )}
            >
                <input {...getInputProps()} />

                {file ? (
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-background rounded-full border shadow-sm">
                            <FileSpreadsheet className="w-8 h-8 text-primary" />
                        </div>
                        <div className="text-left">
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={removeFile}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="p-4 bg-muted rounded-full">
                            <UploadCloud className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="font-medium">Click to upload or drag & drop</p>
                            <p className="text-xs text-muted-foreground">CSV or Excel files supported</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
