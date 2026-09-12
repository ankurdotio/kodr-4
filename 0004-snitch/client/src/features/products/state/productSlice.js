import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { productApi } from '../api/productApi'

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (page = 1, { rejectWithValue }) => {
    try {
      const response = await productApi.getProducts(page)
      return response.data
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load products')
    }
  }
)

export const fetchSellerProducts = createAsyncThunk(
  'products/fetchSellerProducts',
  async (page = 1, { rejectWithValue }) => {
    try {
      const response = await productApi.getSellerProducts(page)
      return response.data
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load seller products')
    }
  }
)

export const createProductAction = createAsyncThunk(
  'products/createProduct',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await productApi.createProduct(formData)
      return response.data.product
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create product')
    }
  }
)

export const updateProductAction = createAsyncThunk(
  'products/updateProduct',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await productApi.updateProduct(id, formData)
      return response.data.product
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update product')
    }
  }
)

export const togglePublishAction = createAsyncThunk(
  'products/togglePublish',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await productApi.togglePublishProduct(productId)
      return { productId, ...response.data.product }
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to toggle product status')
    }
  }
)

export const deleteImageAction = createAsyncThunk(
  'products/deleteImage',
  async ({ productId, imageId }, { rejectWithValue }) => {
    try {
      await productApi.deleteProductImage(productId, imageId)
      return { productId, imageId }
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete image')
    }
  }
)

const initialState = {
  // Public products list
  items: [],
  totalPages: 1,
  currentPage: 1,
  isLoading: false,
  error: null,

  // Selected single product for PDP
  selectedProduct: null,

  // Seller products
  sellerItems: [],
  sellerTotalPages: 1,
  sellerCurrentPage: 1,
  isSellerLoading: false,
  sellerError: null,

  // Filters & Search
  selectedCategory: 'All',
  searchQuery: '',
  sortBy: 'featured', // 'featured' | 'price-asc' | 'price-desc'
}

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload
    },
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null
    },
  },
  extraReducers: (builder) => {
    // Public Products
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload.products || []
        state.totalPages = action.payload.totalPages || 1
        state.currentPage = action.payload.currentPage || 1
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // Seller Products
    builder
      .addCase(fetchSellerProducts.pending, (state) => {
        state.isSellerLoading = true
        state.sellerError = null
      })
      .addCase(fetchSellerProducts.fulfilled, (state, action) => {
        state.isSellerLoading = false
        state.sellerItems = action.payload.products || []
        state.sellerTotalPages = action.payload.totalPages || 1
        state.sellerCurrentPage = action.payload.currentPage || 1
      })
      .addCase(fetchSellerProducts.rejected, (state, action) => {
        state.isSellerLoading = false
        state.sellerError = action.payload
      })

    // Toggle publish
    builder.addCase(togglePublishAction.fulfilled, (state, action) => {
      const { productId, isPublished } = action.payload
      const item = state.sellerItems.find((p) => p._id === productId || p.id === productId)
      if (item) {
        item.isPublished = isPublished
      }
    })

    // Delete image
    builder.addCase(deleteImageAction.fulfilled, (state, action) => {
      const { productId, imageId } = action.payload
      const item = state.sellerItems.find((p) => p._id === productId || p.id === productId)
      if (item && item.images) {
        item.images = item.images.filter((img) => (img._id || img.imagekitId) !== imageId)
      }
    })
  },
})

export const {
  setSelectedCategory,
  setSearchQuery,
  setSortBy,
  setSelectedProduct,
  clearSelectedProduct,
} = productSlice.actions

export default productSlice.reducer
