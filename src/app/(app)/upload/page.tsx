'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Upload, MapPin, FileText, CheckCircle, Loader2, X } from 'lucide-react'

export default function UploadPage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [type, setType] = useState<'lost' | 'found'>('lost')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [imgError, setImgError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) { setImgError('Please select an image file.'); return }
    if (file.size > 10 * 1024 * 1024) { setImgError('Image must be under 10MB.'); return }
    setImgError(null)
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const clearImage = () => {
    setImageFile(null)
    setPreview(null)
    setImgError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    let image_url: string | null = null

    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: storageErr } = await supabase.storage
        .from('item-images')
        .upload(path, imageFile, { upsert: true })

      if (storageErr) {
        console.error('Storage upload error:', storageErr)
        setImgError(`Image upload failed: ${storageErr.message}`)
        setSubmitting(false)
        return
      }
      const { data: urlData } = supabase.storage.from('item-images').getPublicUrl(path)
      image_url = urlData.publicUrl
      console.log('Uploaded image URL:', image_url)
    }

    const { data: inserted, error: dbErr } = await supabase.from('items')
      .insert({ user_id: user.id, title, description, location, type, image_url })
      .select().single()

    if (dbErr) {
      setImgError(`Failed to save item: ${dbErr.message}`)
      setSubmitting(false)
      return
    }

    if (type === 'found' && inserted) {
      await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foundItemId: inserted.id }),
      })
    }

    setDone(true)
    setTimeout(() => router.push('/dashboard'), 1800)
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center">
          <CheckCircle className="w-7 h-7 text-green-500" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">Item reported</h2>
          <p className="text-gray-400 text-sm mt-1">
            {type === 'found' ? 'Running AI match scan...' : "You'll be notified when a match is found."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Report an Item</h1>
        <p className="text-gray-400 text-sm mt-0.5">AI will automatically scan for matches</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4 shadow-sm">

        {/* Type */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
          {(['lost', 'found'] as const).map(t => (
            <button key={t} type="button" onClick={() => setType(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                type === t
                  ? t === 'lost' ? 'bg-red-500 text-white shadow-sm' : 'bg-emerald-500 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-700'
              }`}>
              {t === 'lost' ? 'Lost' : 'Found'}
            </button>
          ))}
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Photo <span className="text-gray-400 font-normal">(optional)</span></label>
          {preview ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-200" style={{ height: 160 }}>
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button type="button" onClick={clearImage}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-xl cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 py-8 ${
                dragging ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/40'
              }`}>
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Upload className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Tap to upload or drag & drop</p>
              <p className="text-xs text-gray-400">PNG, JPG, WEBP · max 10MB</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          {imgError && <p className="text-xs text-red-500 mt-1.5">{imgError}</p>}
        </div>

        {/* Title */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
            <FileText className="w-3.5 h-3.5 text-gray-400" /> Title
          </label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Black leather wallet" required
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-gray-50 focus:bg-white transition-colors" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Color, brand, size, distinguishing features..." required rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none bg-gray-50 focus:bg-white transition-colors" />
        </div>

        {/* Location */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-gray-400" /> Location
          </label>
          <input type="text" value={location} onChange={e => setLocation(e.target.value)}
            placeholder="e.g. Central Park, New York" required
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-gray-50 focus:bg-white transition-colors" />
        </div>

        <button type="submit" disabled={submitting}
          className="btn-primary w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mt-1">
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Submit Report'}
        </button>
      </form>
    </div>
  )
}
