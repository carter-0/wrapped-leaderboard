import Image from 'next/image'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'

export default function Upload() {
    const [file, setFile] = useState<File | null>(() => {
        if (typeof window !== 'undefined') {
            const savedFileData = localStorage.getItem('pending_upload')
            if (savedFileData) {
                try {
                    const { name, type, data } = JSON.parse(savedFileData)
                    const byteString = atob(data.split(',')[1])
                    const ab = new ArrayBuffer(byteString.length)
                    const ia = new Uint8Array(ab)
                    
                    for (let i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i)
                    }
                    
                    return new File([ab], name, { type })
                } catch {
                    localStorage.removeItem('pending_upload')
                    return null
                }
            }
        }
        return null
    })
    const [uploading, setUploading] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const router = useRouter()
    const { access_token } = router.query

    useEffect(() => {
        if (access_token && typeof access_token === 'string') {
            localStorage.setItem('access_token', access_token)
        }
        const token = localStorage.getItem('access_token')
        setIsAuthenticated(!!token)
    }, [access_token])

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0]
        setFile(selectedFile)
        
        const reader = new FileReader()
        reader.onload = () => {
            if (reader.result) {
                const fileData = {
                    name: selectedFile.name,
                    type: selectedFile.type,
                    data: reader.result
                }
                localStorage.setItem('pending_upload', JSON.stringify(fileData))
            }
        }
        reader.readAsDataURL(selectedFile)
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        },
        maxFiles: 1
    })

    const handleUpload = async () => {
        if (!file) return

        const token = localStorage.getItem('access_token')
        if (!token) {
            window.location.href = 'http://api.trackify.am/jwt/login?after=wrapped-leaderboard'
            return
        }

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch('http://localhost:5001/wrapped/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            const data = await response.json()

            if (response.ok) {
                if (data.status === 'success') {
                    localStorage.removeItem('pending_upload')
                    localStorage.removeItem('pending_upload_redirect')
                    localStorage.setItem('spotify_id', data.data.spotify_id)
                    router.push('/wrapped/' + data.data.spotify_id)
                } else {
                    alert(data.message || 'Upload failed')
                }
            } else if (response.status === 401) {
                localStorage.removeItem('access_token')
                window.location.href = 'http://api.trackify.am/jwt/login?after=wrapped-leaderboard'
            } else {
                throw new Error(data.message || 'Upload failed')
            }
        } catch (error) {
            console.error('Upload failed:', error)
            alert(error instanceof Error ? error.message : 'Upload failed. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
            <div className="max-w-4xl mx-auto px-4 py-16">
                <div className="text-center mb-12 animate-fade-in">
                    <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-transparent bg-clip-text tracking-tight">
                        upload your wrapped
                    </h1>
                    <p className="text-zinc-400 text-base sm:text-lg">
                        {isAuthenticated 
                            ? "upload the last page of your wrapped to get your rank"
                            : "login with spotify to submit your wrapped"}
                    </p>
                </div>

                <div className="max-w-xl mx-auto">
                    <div 
                        {...getRootProps()} 
                        className={`bg-zinc-900/50 backdrop-blur-sm rounded-3xl p-12 text-center cursor-pointer transition-all border-2 
                            ${isDragActive 
                                ? 'border-green-500 bg-green-500/10 [box-shadow:0_4px_0_0_rgb(22_163_74)]' 
                                : 'border-zinc-800 hover:border-green-500 [box-shadow:0_4px_0_0_#27272a]'}`}
                    >
                        <input {...getInputProps()} />
                        {file ? (
                            <div>
                                <p className="text-2xl mb-2 font-bold">Selected file:</p>
                                <p className="text-green-500 text-lg">{file.name}</p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-2xl mb-2 font-bold">
                                    {isDragActive ? 'Drop your screenshot here' : 'Drag and drop your screenshot here'}
                                </p>
                                <p className="text-zinc-400 text-lg">
                                    {isAuthenticated ? 'or click to select a file' : 'login required to submit'}
                                </p>
                            </div>
                        )}
                    </div>

                    {file && (
                        <button
                            onClick={isAuthenticated ? handleUpload : () => window.location.href = 'http://api.trackify.am/jwt/login?after=wrapped-leaderboard'}
                            disabled={uploading}
                            className="w-full mt-8 px-8 py-4 bg-[#1db954] text-xl font-bold rounded-2xl hover:bg-[#1db954]/90 transition-all text-center border-2 border-[#1db954] [box-shadow:0_4px_0_0_rgb(22_163_74)] hover:translate-y-[4px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? 'Uploading...' : isAuthenticated ? 'Upload Screenshot' : 'Login with Spotify (to verify your identity)'}
                        </button>
                    )}

                    <div className="mt-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-3xl p-6 border-2 border-zinc-800 [box-shadow:0_4px_0_0_#27272a]">
                                <h2 className="text-2xl font-bold mb-4 text-green-400">✅ Correct Example</h2>
                                <div className="relative aspect-[9/16] w-full max-w-sm mx-auto rounded-xl overflow-hidden">
                                    <Image
                                        src="/good.jpeg"
                                        alt="Correct Wrapped Screenshot Example"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/50 to-transparent p-4">
                                        <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                                            Minutes listened visible
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-3xl p-6 border-2 border-zinc-800 [box-shadow:0_4px_0_0_#27272a]">
                                <h2 className="text-2xl font-bold mb-4 text-red-400">❌ Incorrect Example</h2>
                                <div className="relative aspect-[9/16] w-full max-w-sm mx-auto rounded-xl overflow-hidden">
                                    <Image
                                        src="/bad.png"
                                        alt="Incorrect Wrapped Screenshot Example"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/50 to-transparent p-4">
                                        <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                                            Wrong page
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 