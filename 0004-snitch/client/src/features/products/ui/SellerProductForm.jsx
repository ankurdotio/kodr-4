import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X, Trash2 } from 'lucide-react'

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const DEFAULT_CATEGORIES = [
  'Men',
  'T-Shirts',
  'Shirts',
  'Jeans',
  'Hoodies',
  'Jackets',
  'Joggers',
  'Shorts',
  'Sweatshirts',
  'Polo Shirts',
]

export const SellerProductForm = ({
  initialData = null,
  onSubmit,
  onDeleteImage = null,
  isLoading = false,
  error = null,
}) => {
  const navigate = useNavigate()
  const isEditing = !!initialData

  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [priceAmount, setPriceAmount] = useState(initialData?.price?.amount || '')
  const [currency, setCurrency] = useState(initialData?.price?.currency || 'INR')
  const [selectedCategories, setSelectedCategories] = useState(
    initialData?.categories || ['Men', 'T-Shirts']
  )
  const [customCategory, setCustomCategory] = useState('')

  // Sizes map
  const initialSizes = AVAILABLE_SIZES.map((sz) => {
    const existing = initialData?.sizes?.find((s) => s.size === sz)
    return {
      size: sz,
      stock: existing ? existing.stock : 0,
      enabled: existing ? existing.stock >= 0 : ['S', 'M', 'L', 'XL'].includes(sz),
    }
  })
  const [sizesState, setSizesState] = useState(initialSizes)

  // Images state
  const [existingImages, setExistingImages] = useState(initialData?.images || [])
  const [newImageFiles, setNewImageFiles] = useState([])
  const [newImagePreviews, setNewImagePreviews] = useState([])
  const [validationError, setValidationError] = useState('')

  const handleSizeToggle = (sizeName) => {
    setSizesState((prev) =>
      prev.map((item) =>
        item.size === sizeName ? { ...item, enabled: !item.enabled } : item
      )
    )
  }

  const handleStockChange = (sizeName, value) => {
    const parsed = Math.max(0, parseInt(value) || 0)
    setSizesState((prev) =>
      prev.map((item) =>
        item.size === sizeName ? { ...item, stock: parsed } : item
      )
    )
  }

  const handleCategoryToggle = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  const handleAddCustomCategory = (e) => {
    e.preventDefault()
    if (customCategory.trim() && !selectedCategories.includes(customCategory.trim())) {
      setSelectedCategories((prev) => [...prev, customCategory.trim()])
      setCustomCategory('')
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    const totalCount = existingImages.length + newImageFiles.length + files.length
    if (totalCount > 5) {
      setValidationError('You can upload a maximum of 5 images in total.')
      return
    }

    setValidationError('')
    setNewImageFiles((prev) => [...prev, ...files])

    const previews = files.map((file) => URL.createObjectURL(file))
    setNewImagePreviews((prev) => [...prev, ...previews])
  }

  const removeNewImage = (index) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index))
    setNewImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleDeleteExistingImage = async (imagekitId, imgId) => {
    if (onDeleteImage) {
      const targetId = imgId || imagekitId
      const success = await onDeleteImage(targetId)
      if (success) {
        setExistingImages((prev) =>
          prev.filter((img) => (img._id || img.imagekitId) !== targetId)
        )
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')

    if (!title.trim() || title.trim().length < 3) {
      setValidationError('Title must be at least 3 characters long.')
      return
    }

    if (!description.trim() || description.trim().length < 10) {
      setValidationError('Description must be at least 10 characters long.')
      return
    }

    if (!priceAmount || Number(priceAmount) <= 0) {
      setValidationError('Please enter a valid price.')
      return
    }

    if (selectedCategories.length === 0) {
      setValidationError('Please select at least one category.')
      return
    }

    const enabledSizes = sizesState
      .filter((s) => s.enabled)
      .map((s) => ({ size: s.size, stock: Number(s.stock) }))

    if (enabledSizes.length === 0) {
      setValidationError('Please configure at least one size variant.')
      return
    }

    if (!isEditing && newImageFiles.length === 0) {
      setValidationError('At least one product image is required.')
      return
    }

    // Build FormData
    const formData = new FormData()
    formData.append('title', title.trim())
    formData.append('description', description.trim())
    formData.append(
      'price',
      JSON.stringify({ amount: Number(priceAmount), currency: currency })
    )
    formData.append('categories', JSON.stringify(selectedCategories))
    formData.append('sizes', JSON.stringify(enabledSizes))

    // Append image files
    newImageFiles.forEach((file) => {
      formData.append('images', file)
    })

    const result = await onSubmit(formData)
    if (result) {
      navigate('/seller')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
      {(error || validationError) && (
        <div className="p-4 bg-critical/10 border border-critical text-critical text-xs">
          {error || validationError}
        </div>
      )}

      {/* Main Info */}
      <div className="bg-surface border border-hairline p-6 sm:p-8 space-y-6">
        <h3 className="font-serif text-xl text-ink border-b border-hairline pb-4">
          Basic Information
        </h3>

        <div>
          <label className="block text-xs uppercase tracking-eyebrow text-ink mb-2">
            Product Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Linen Structured Overshirt"
            required
            className="w-full bg-canvas border border-hairline px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-eyebrow text-ink mb-2">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the fabric, tailoring, silhouette, and care guidelines..."
            rows={4}
            required
            className="w-full bg-canvas border border-hairline px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink resize-y"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs uppercase tracking-eyebrow text-ink mb-2">
              Price Amount (INR) *
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={priceAmount}
              onChange={(e) => setPriceAmount(e.target.value)}
              placeholder="e.g. 2499"
              required
              className="w-full bg-canvas border border-hairline px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-eyebrow text-ink mb-2">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-canvas border border-hairline px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="CAD">CAD ($)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-surface border border-hairline p-6 sm:p-8 space-y-6">
        <h3 className="font-serif text-xl text-ink border-b border-hairline pb-4">
          Categories & Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_CATEGORIES.map((cat) => {
            const isSelected = selectedCategories.includes(cat)
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryToggle(cat)}
                className={`px-3 py-1.5 text-xs uppercase tracking-eyebrow border transition-all ${
                  isSelected
                    ? 'bg-ink text-canvas border-ink font-medium'
                    : 'bg-canvas text-ink-muted border-hairline hover:border-ink hover:text-ink'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* Custom category input */}
        <div className="flex gap-2 max-w-sm pt-2">
          <input
            type="text"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder="Add custom tag..."
            className="flex-1 bg-canvas border border-hairline px-3 py-2 text-xs text-ink focus:outline-none focus:border-ink"
          />
          <button
            type="button"
            onClick={handleAddCustomCategory}
            className="px-4 py-2 border border-ink text-xs uppercase tracking-eyebrow text-ink hover:bg-ink hover:text-canvas transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Sizes and Stock */}
      <div className="bg-surface border border-hairline p-6 sm:p-8 space-y-6">
        <h3 className="font-serif text-xl text-ink border-b border-hairline pb-4">
          Sizes & Inventory Stock
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {sizesState.map((item) => (
            <div
              key={item.size}
              className={`p-3 border transition-all ${
                item.enabled ? 'border-hairline bg-canvas' : 'border-hairline/40 bg-surface opacity-40'
              }`}
            >
              <label className="flex items-center gap-2 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.enabled}
                  onChange={() => handleSizeToggle(item.size)}
                  className="accent-ink"
                />
                <span className="text-xs uppercase font-medium text-ink">{item.size}</span>
              </label>
              {item.enabled && (
                <div>
                  <span className="text-[10px] text-ink-muted block uppercase mb-1">Stock</span>
                  <input
                    type="number"
                    min="0"
                    value={item.stock}
                    onChange={(e) => handleStockChange(item.size, e.target.value)}
                    className="w-full bg-surface border border-hairline px-2 py-1 text-xs text-ink text-center"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Imagery (Upload up to 5) */}
      <div className="bg-surface border border-hairline p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center border-b border-hairline pb-4">
          <h3 className="font-serif text-xl text-ink">Product Images</h3>
          <span className="text-xs text-ink-muted">Max 5 images total</span>
        </div>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div>
            <span className="text-xs uppercase tracking-eyebrow text-ink-muted block mb-3">
              Current Images ({existingImages.length})
            </span>
            <div className="flex flex-wrap gap-4">
              {existingImages.map((img) => (
                <div
                  key={img._id || img.imagekitId}
                  className="relative w-24 h-32 border border-hairline bg-canvas group overflow-hidden"
                >
                  <img
                    src={img.url}
                    alt="Product preview"
                    className="w-full h-full object-cover"
                  />
                  {onDeleteImage && (
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteExistingImage(img.imagekitId, img._id)
                      }
                      className="absolute inset-0 bg-ink/70 text-canvas opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <Trash2 className="w-5 h-5 text-critical" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New uploaded previews */}
        {newImagePreviews.length > 0 && (
          <div>
            <span className="text-xs uppercase tracking-eyebrow text-ink-muted block mb-3">
              Newly Selected Images ({newImagePreviews.length})
            </span>
            <div className="flex flex-wrap gap-4">
              {newImagePreviews.map((previewUrl, idx) => (
                <div
                  key={idx}
                  className="relative w-24 h-32 border border-hairline bg-canvas group overflow-hidden"
                >
                  <img
                    src={previewUrl}
                    alt="Upload preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-ink text-canvas rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        {existingImages.length + newImageFiles.length < 5 && (
          <label className="border-2 border-dashed border-hairline hover:border-ink p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-canvas/50">
            <Upload className="w-8 h-8 text-ink-muted mb-2" />
            <span className="text-xs uppercase tracking-eyebrow text-ink font-medium">
              Click to select product images
            </span>
            <span className="text-[11px] text-ink-muted mt-1">
              Supports JPEG, PNG, WEBP (4:5 portrait ratio recommended)
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate('/seller')}
          className="px-6 py-3 border border-hairline text-xs uppercase tracking-eyebrow text-ink hover:border-ink transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-ink text-canvas text-xs uppercase tracking-eyebrow font-medium hover:bg-ink/90 disabled:opacity-50 transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <span className="inline-block animate-spin border-2 border-canvas border-t-transparent rounded-full w-4 h-4 mr-2" />
          ) : null}
          {isEditing ? 'Save Changes' : 'Publish Product'}
        </button>
      </div>
    </form>
  )
}
