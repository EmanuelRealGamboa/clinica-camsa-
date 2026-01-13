import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { useAuth } from '../../auth/AuthContext';

const ProductsManagementPage: React.FC = () => {
  const { logout } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'tags'>('products');

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    image_url: '',
    category: '',
    sku: '',
    unit_label: 'unidad',
    is_active: true,
    rating: 0,
    rating_count: 0,
    tags: [] as number[],
    benefits: '[]',
    is_featured: false,
    featured_title: '',
    featured_description: '',
    product_sort_order: 0,
  });

  const [benefitsList, setBenefitsList] = useState<{icon: string; text: string}[]>([]);

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: '',
    sort_order: 0,
    show_in_carousel: false,
    carousel_order: 0,
    is_active: true,
  });

  const [tagForm, setTagForm] = useState({
    name: '',
    color: '#D97706',
    icon: '',
    sort_order: 0,
    is_active: true,
  });

  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [successModal, setSuccessModal] = useState<{
    show: boolean;
    title: string;
    message: string;
  }>({
    show: false,
    title: '',
    message: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, tagsData] = await Promise.all([
        adminApi.getProducts(),
        adminApi.getCategories(),
        adminApi.getTags(),
      ]);

      const productsArray = productsData.results || (Array.isArray(productsData) ? productsData : []);
      const categoriesArray = categoriesData.results || (Array.isArray(categoriesData) ? categoriesData : []);
      const tagsArray = tagsData.results || (Array.isArray(tagsData) ? tagsData : []);

      setProducts(productsArray);
      setCategories(categoriesArray);
      setTags(tagsArray);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Product handlers
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('=== PRODUCT FORM SUBMISSION DEBUG ===');
      console.log('Full productForm state:', productForm);
      console.log('benefitsList:', benefitsList);
      console.log('selectedImageFile:', selectedImageFile);

      const formData = new FormData();

      console.log('Adding name:', productForm.name);
      formData.append('name', productForm.name || '');

      console.log('Adding description:', productForm.description);
      formData.append('description', productForm.description || '');

      console.log('Adding category:', productForm.category, 'type:', typeof productForm.category);
      formData.append('category', (productForm.category || '').toString());

      console.log('Adding unit_label:', productForm.unit_label);
      formData.append('unit_label', productForm.unit_label || 'unidad');

      console.log('Adding is_active:', productForm.is_active);
      formData.append('is_active', productForm.is_active ? 'true' : 'false');

      console.log('Adding rating:', productForm.rating, 'type:', typeof productForm.rating);
      formData.append('rating', (productForm.rating || 0).toString());

      console.log('Adding rating_count:', productForm.rating_count, 'type:', typeof productForm.rating_count);
      formData.append('rating_count', (productForm.rating_count || 0).toString());

      console.log('Adding is_featured:', productForm.is_featured);
      formData.append('is_featured', productForm.is_featured ? 'true' : 'false');

      console.log('Adding product_sort_order:', productForm.product_sort_order, 'type:', typeof productForm.product_sort_order);
      formData.append('product_sort_order', (productForm.product_sort_order || 0).toString());

      // Tags - append each tag ID
      console.log('Processing tags:', productForm.tags, 'isArray:', Array.isArray(productForm.tags));
      const tagsArray = Array.isArray(productForm.tags) ? productForm.tags : [];
      console.log('tagsArray after check:', tagsArray);
      tagsArray.forEach((tagId, index) => {
        console.log(`Tag ${index}:`, tagId, 'type:', typeof tagId);
        if (tagId !== null && tagId !== undefined) {
          formData.append('tags', String(tagId));
        }
      });

      // Benefits - convert benefitsList to JSON (filter out empty ones)
      console.log('Processing benefits, raw benefitsList:', benefitsList);
      const validBenefits = (benefitsList || []).filter(b => b && (b.icon?.trim() || b.text?.trim()));
      console.log('validBenefits after filter:', validBenefits);
      formData.append('benefits', JSON.stringify(validBenefits));

      // Featured fields - always send them (empty string if not provided)
      console.log('Adding featured_title:', productForm.featured_title);
      formData.append('featured_title', productForm.featured_title?.trim() || '');

      console.log('Adding featured_description:', productForm.featured_description);
      formData.append('featured_description', productForm.featured_description?.trim() || '');

      // SKU - send empty string if not provided
      console.log('Adding sku:', productForm.sku);
      formData.append('sku', productForm.sku?.trim() || '');

      // Only append image_url if no file selected and URL is provided
      console.log('Checking image_url:', productForm.image_url);
      if (!selectedImageFile && productForm.image_url && productForm.image_url.trim()) {
        console.log('Adding image_url:', productForm.image_url.trim());
        formData.append('image_url', productForm.image_url.trim());
      }

      // Append image file if selected
      if (selectedImageFile) {
        console.log('Adding image file:', selectedImageFile.name);
        formData.append('image', selectedImageFile);
      }

      console.log('=== FORMDATA BUILT SUCCESSFULLY ===');

      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, formData);
        setSuccessModal({
          show: true,
          title: 'Producto Actualizado',
          message: `El producto "${productForm.name}" ha sido actualizado exitosamente.`,
        });
      } else {
        await adminApi.createProduct(formData);
        setSuccessModal({
          show: true,
          title: 'Producto Creado',
          message: `El producto "${productForm.name}" ha sido creado exitosamente.`,
        });
      }

      setShowModal(false);
      setEditingProduct(null);
      setSelectedImageFile(null);
      setImagePreview(null);
      resetProductForm();
      loadData();
    } catch (err: any) {
      console.error('=== PRODUCT SAVE ERROR ===');
      console.error('Error object:', err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      console.error('Response data:', err.response?.data);
      console.error('Response status:', err.response?.status);
      setConfirmModal({
        show: true,
        title: 'Error',
        message: err.response?.data?.error || err.message || 'Error al guardar el producto',
        onConfirm: () => setConfirmModal({ ...confirmModal, show: false }),
        confirmText: 'OK',
        cancelText: undefined,
      });
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    const product = products.find(p => p.id === productId);

    setConfirmModal({
      show: true,
      title: 'Eliminar Producto',
      message: `¿Estás seguro de que deseas eliminar "${product?.name || 'este producto'}"? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, show: false });

        try {
          await adminApi.deleteProduct(productId);
          setSuccessModal({
            show: true,
            title: 'Producto Eliminado',
            message: `El producto "${product?.name}" ha sido eliminado exitosamente.`,
          });
          loadData();
        } catch (err: any) {
          setConfirmModal({
            show: true,
            title: 'Error',
            message: err.response?.data?.error || 'Error al eliminar el producto',
            onConfirm: () => setConfirmModal({ ...confirmModal, show: false }),
            confirmText: 'OK',
            cancelText: undefined,
          });
          console.error('Failed to delete product:', err);
        }
      },
      confirmText: 'Sí, Eliminar',
      cancelText: 'Cancelar',
    });
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      image_url: product.image_url || '',
      category: product.category.toString(),
      sku: product.sku || '',
      unit_label: product.unit_label || 'unidad',
      is_active: product.is_active,
      rating: product.rating || 0,
      rating_count: product.rating_count || 0,
      tags: product.tags ? product.tags.map((t: any) => t.id) : [],
      benefits: product.benefits ? JSON.stringify(product.benefits, null, 2) : '[]',
      is_featured: product.is_featured || false,
      featured_title: product.featured_title || '',
      featured_description: product.featured_description || '',
      product_sort_order: product.product_sort_order || 0,
    });

    // Load benefits into list
    if (product.benefits && Array.isArray(product.benefits)) {
      setBenefitsList(product.benefits);
    } else {
      setBenefitsList([]);
    }

    if (product.image_url_full) {
      setImagePreview(product.image_url_full);
    } else {
      setImagePreview(null);
    }
    setSelectedImageFile(null);
    setShowModal(true);
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      image_url: '',
      category: '',
      sku: '',
      unit_label: 'unidad',
      is_active: true,
      rating: 0,
      rating_count: 0,
      tags: [],
      benefits: '[]',
      is_featured: false,
      featured_title: '',
      featured_description: '',
      product_sort_order: 0,
    });
    setBenefitsList([]);
    setSelectedImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    setImagePreview(null);
  };

  // Category handlers
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await adminApi.updateCategory(editingCategory.id, categoryForm);
        setSuccessModal({
          show: true,
          title: 'Categoría Actualizada',
          message: `La categoría "${categoryForm.name}" ha sido actualizada exitosamente.`,
        });
      } else {
        await adminApi.createCategory(categoryForm);
        setSuccessModal({
          show: true,
          title: 'Categoría Creada',
          message: `La categoría "${categoryForm.name}" ha sido creada exitosamente.`,
        });
      }

      setShowCategoryModal(false);
      setEditingCategory(null);
      resetCategoryForm();
      loadData();
    } catch (err: any) {
      console.error('Failed to save category:', err);
      setConfirmModal({
        show: true,
        title: 'Error',
        message: err.response?.data?.error || 'Error al guardar la categoría',
        onConfirm: () => setConfirmModal({ ...confirmModal, show: false }),
        confirmText: 'OK',
        cancelText: undefined,
      });
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    const productCount = category?.product_count || 0;

    setConfirmModal({
      show: true,
      title: 'Eliminar Categoría',
      message: `¿Estás seguro de que deseas eliminar "${category?.name || 'esta categoría'}"? ${productCount > 0 ? `Esto afectará ${productCount} producto${productCount > 1 ? 's' : ''}.` : ''} Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, show: false });

        try {
          await adminApi.deleteCategory(categoryId);
          setSuccessModal({
            show: true,
            title: 'Categoría Eliminada',
            message: `La categoría "${category?.name}" ha sido eliminada exitosamente.`,
          });
          loadData();
        } catch (err: any) {
          setConfirmModal({
            show: true,
            title: 'Error',
            message: err.response?.data?.error || 'Error al eliminar la categoría',
            onConfirm: () => setConfirmModal({ ...confirmModal, show: false }),
            confirmText: 'OK',
            cancelText: undefined,
          });
          console.error('Failed to delete category:', err);
        }
      },
      confirmText: 'Sí, Eliminar',
      cancelText: 'Cancelar',
    });
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      icon: category.icon || '',
      sort_order: category.sort_order || 0,
      show_in_carousel: category.show_in_carousel || false,
      carousel_order: category.carousel_order || 0,
      is_active: category.is_active,
    });
    setShowCategoryModal(true);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      icon: '',
      sort_order: 0,
      show_in_carousel: false,
      carousel_order: 0,
      is_active: true,
    });
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  // Tag handlers
  const handleTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTag) {
        await adminApi.updateTag(editingTag.id, tagForm);
        setSuccessModal({
          show: true,
          title: 'Etiqueta Actualizada',
          message: `La etiqueta "${tagForm.name}" ha sido actualizada exitosamente.`,
        });
      } else {
        await adminApi.createTag(tagForm);
        setSuccessModal({
          show: true,
          title: 'Etiqueta Creada',
          message: `La etiqueta "${tagForm.name}" ha sido creada exitosamente.`,
        });
      }

      setShowTagModal(false);
      setEditingTag(null);
      resetTagForm();
      loadData();
    } catch (err: any) {
      console.error('Failed to save tag:', err);
      setConfirmModal({
        show: true,
        title: 'Error',
        message: err.response?.data?.error || 'Error al guardar la etiqueta',
        onConfirm: () => setConfirmModal({ ...confirmModal, show: false }),
        confirmText: 'OK',
        cancelText: undefined,
      });
    }
  };

  const handleDeleteTag = async (tagId: number) => {
    const tag = tags.find(t => t.id === tagId);

    setConfirmModal({
      show: true,
      title: 'Eliminar Etiqueta',
      message: `¿Estás seguro de que deseas eliminar "${tag?.name || 'esta etiqueta'}"? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, show: false });

        try {
          await adminApi.deleteTag(tagId);
          setSuccessModal({
            show: true,
            title: 'Etiqueta Eliminada',
            message: `La etiqueta "${tag?.name}" ha sido eliminada exitosamente.`,
          });
          loadData();
        } catch (err: any) {
          setConfirmModal({
            show: true,
            title: 'Error',
            message: err.response?.data?.error || 'Error al eliminar la etiqueta',
            onConfirm: () => setConfirmModal({ ...confirmModal, show: false }),
            confirmText: 'OK',
            cancelText: undefined,
          });
          console.error('Failed to delete tag:', err);
        }
      },
      confirmText: 'Sí, Eliminar',
      cancelText: 'Cancelar',
    });
  };

  const handleEditTag = (tag: any) => {
    setEditingTag(tag);
    setTagForm({
      name: tag.name,
      color: tag.color || '#D97706',
      icon: tag.icon || '',
      sort_order: tag.sort_order || 0,
      is_active: tag.is_active !== undefined ? tag.is_active : true,
    });
    setShowTagModal(true);
  };

  const resetTagForm = () => {
    setTagForm({
      name: '',
      color: '#D97706',
      icon: '',
      sort_order: 0,
      is_active: true,
    });
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <Link to="/admin/dashboard" style={styles.backLink}>← Volver al Panel</Link>
          <h1>Gestión de Productos</h1>
        </div>
        <button onClick={() => logout()} style={styles.logoutButton}>
          Cerrar Sesión
        </button>
      </header>

      <div style={styles.content}>
        <div style={styles.tabs} key={`tabs-${products.length}-${categories.length}-${tags.length}`}>
          <button
            onClick={() => setActiveTab('products')}
            style={activeTab === 'products' ? styles.tabActive : styles.tab}
          >
            Productos ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            style={activeTab === 'categories' ? styles.tabActive : styles.tab}
          >
            Categorías ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            style={activeTab === 'tags' ? styles.tabActive : styles.tab}
          >
            Etiquetas ({tags.length})
          </button>
        </div>

        {activeTab === 'products' ? (
          <>
            <div style={styles.toolbar}>
              <h2>Productos</h2>
              <button
                onClick={() => {
                  resetProductForm();
                  setEditingProduct(null);
                  setShowModal(true);
                }}
                style={styles.addButton}
              >
                + Agregar Producto
              </button>
            </div>

            {loading ? (
              <div style={styles.loading}>Cargando productos...</div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Imagen</th>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Nombre</th>
                      <th style={styles.th}>Categoría</th>
                      <th style={styles.th}>Calificación</th>
                      <th style={styles.th}>Etiquetas</th>
                      <th style={styles.th}>Destacado</th>
                      <th style={styles.th}>Estado</th>
                      <th style={styles.th}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} style={styles.tr}>
                        <td style={styles.td}>
                          {product.image_url_full ? (
                            <img src={product.image_url_full} alt={product.name} style={styles.tableImage} />
                          ) : (
                            <div style={styles.noImage}>Sin Imagen</div>
                          )}
                        </td>
                        <td style={styles.td}>{product.id}</td>
                        <td style={styles.td}>
                          <div>{product.name}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{product.sku || 'Sin SKU'}</div>
                        </td>
                        <td style={styles.td}>{getCategoryName(product.category)}</td>
                        <td style={styles.td}>
                          {product.rating && product.rating > 0 ? (
                            <div>
                              <div style={{ color: '#D97706' }}>{'★'.repeat(Math.floor(product.rating))}</div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {Number(product.rating).toFixed(1)} ({product.rating_count || 0})
                              </div>
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td style={styles.td}>
                          {product.tags && product.tags.length > 0 ? (
                            <div>
                              {product.tags.map((tag: any) => (
                                <span key={tag.id} style={{
                                  ...styles.tagBadge,
                                  backgroundColor: tag.color || '#D97706'
                                }}>
                                  {tag.icon && `${tag.icon} `}{tag.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td style={styles.td}>
                          {product.is_featured && (
                            <span style={{ ...styles.statusBadge, backgroundColor: '#D97706' }}>★ Destacado</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: product.is_active ? '#27ae60' : '#95a5a6'
                          }}>
                            {product.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <button
                            onClick={() => handleEditProduct(product)}
                            style={styles.editButton}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            style={styles.deleteButton}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : activeTab === 'categories' ? (
          <>
            <div style={styles.toolbar}>
              <h2>Categorías</h2>
              <button
                onClick={() => {
                  resetCategoryForm();
                  setEditingCategory(null);
                  setShowCategoryModal(true);
                }}
                style={styles.addButton}
              >
                + Agregar Categoría
              </button>
            </div>

            {loading ? (
              <div style={styles.loading}>Cargando categorías...</div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Ícono</th>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Nombre</th>
                      <th style={styles.th}>Orden</th>
                      <th style={styles.th}>Carrusel</th>
                      <th style={styles.th}>Productos</th>
                      <th style={styles.th}>Estado</th>
                      <th style={styles.th}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id} style={styles.tr}>
                        <td style={styles.td}>
                          <span style={{ fontSize: '24px' }}>{category.icon || '-'}</span>
                        </td>
                        <td style={styles.td}>{category.id}</td>
                        <td style={styles.td}>{category.name}</td>
                        <td style={styles.td}>{category.sort_order}</td>
                        <td style={styles.td}>
                          {category.show_in_carousel && (
                            <span style={{ ...styles.statusBadge, backgroundColor: '#3498db' }}>
                              Carousel #{category.carousel_order}
                            </span>
                          )}
                        </td>
                        <td style={styles.td}>{category.product_count || 0}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: category.is_active ? '#27ae60' : '#95a5a6'
                          }}>
                            {category.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <button
                            onClick={() => handleEditCategory(category)}
                            style={styles.editButton}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            style={styles.deleteButton}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={styles.toolbar}>
              <h2>Etiquetas</h2>
              <button
                onClick={() => {
                  resetTagForm();
                  setEditingTag(null);
                  setShowTagModal(true);
                }}
                style={styles.addButton}
              >
                + Agregar Etiqueta
              </button>
            </div>

            {loading ? (
              <div style={styles.loading}>Cargando etiquetas...</div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Vista Previa</th>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Nombre</th>
                      <th style={styles.th}>Color</th>
                      <th style={styles.th}>Ícono</th>
                      <th style={styles.th}>Orden</th>
                      <th style={styles.th}>Estado</th>
                      <th style={styles.th}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tags.map((tag) => (
                      <tr key={tag.id} style={styles.tr}>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.tagBadge,
                            backgroundColor: tag.color || '#D97706'
                          }}>
                            {tag.icon && `${tag.icon} `}{tag.name}
                          </span>
                        </td>
                        <td style={styles.td}>{tag.id}</td>
                        <td style={styles.td}>{tag.name}</td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '30px',
                              height: '20px',
                              backgroundColor: tag.color || '#D97706',
                              borderRadius: '4px',
                              border: '1px solid #ccc'
                            }}></div>
                            <span>{tag.color}</span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={{ fontSize: '20px' }}>{tag.icon || '-'}</span>
                        </td>
                        <td style={styles.td}>{tag.sort_order}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: tag.is_active ? '#27ae60' : '#95a5a6'
                          }}>
                            {tag.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <button
                            onClick={() => handleEditTag(tag)}
                            style={styles.editButton}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteTag(tag.id)}
                            style={styles.deleteButton}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h2>
            <form onSubmit={handleProductSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Descripción</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  style={{...styles.input, minHeight: '80px'}}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Imagen del Producto</label>
                {imagePreview && (
                  <div style={styles.imagePreviewContainer}>
                    <img src={imagePreview} alt="Preview" style={styles.imagePreview} />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      style={styles.removeImageButton}
                    >
                      Quitar Imagen
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={styles.input}
                />
                <small style={styles.helpText}>
                  Cargar una imagen del producto (JPG, PNG, etc.)
                </small>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>SKU (Optional)</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                    style={styles.input}
                    placeholder="Auto-generated if empty"
                  />
                  <small style={styles.helpText}>
                    Leave empty to auto-generate (e.g., BEB-0001)
                  </small>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Unit Label</label>
                  <input
                    type="text"
                    value={productForm.unit_label}
                    onChange={(e) => setProductForm({...productForm, unit_label: e.target.value})}
                    style={styles.input}
                    placeholder="unidad, pieza, botella..."
                  />
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Category *</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                  style={styles.input}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.filter(c => c.is_active).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Rating</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setProductForm({...productForm, rating: star})}
                      style={{
                        fontSize: '32px',
                        cursor: 'pointer',
                        color: star <= productForm.rating ? '#D97706' : '#ddd',
                        transition: 'color 0.2s',
                      }}
                    >
                      ★
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => setProductForm({...productForm, rating: 0})}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: '#95a5a6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      marginLeft: '10px',
                    }}
                  >
                    Clear
                  </button>
                </div>
                <small style={styles.helpText}>Click stars to set rating: {productForm.rating > 0 ? `${productForm.rating} star${productForm.rating > 1 ? 's' : ''}` : 'No rating'}</small>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Rating Count</label>
                <input
                  type="number"
                  min="0"
                  value={productForm.rating_count}
                  onChange={(e) => setProductForm({...productForm, rating_count: parseInt(e.target.value) || 0})}
                  style={styles.input}
                />
                <small style={styles.helpText}>Number of reviews (e.g., 125)</small>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Tags</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '50px' }}>
                  {tags.filter(t => t.is_active).length > 0 ? (
                    tags.filter(t => t.is_active).map(tag => (
                      <label key={tag.id} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={productForm.tags.includes(tag.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProductForm({...productForm, tags: [...productForm.tags, tag.id]});
                            } else {
                              setProductForm({...productForm, tags: productForm.tags.filter(id => id !== tag.id)});
                            }
                          }}
                          style={{marginRight: '6px'}}
                        />
                        <span style={{
                          ...styles.tagBadge,
                          backgroundColor: tag.color || '#D97706'
                        }}>
                          {tag.icon && `${tag.icon} `}{tag.name}
                        </span>
                      </label>
                    ))
                  ) : (
                    <div style={{ color: '#666', fontStyle: 'italic', padding: '10px' }}>
                      No active tags available. Create tags in the "Tags" tab first.
                    </div>
                  )}
                </div>
                <small style={styles.helpText}>Select tags to show as badges on the product card</small>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Benefits</label>
                <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '10px' }}>
                  {benefitsList.map((benefit, index) => (
                    <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={benefit.icon}
                        onChange={(e) => {
                          const newList = [...benefitsList];
                          newList[index].icon = e.target.value;
                          setBenefitsList(newList);
                        }}
                        style={{ ...styles.input, width: '60px', fontSize: '20px', textAlign: 'center' }}
                        placeholder="🔥"
                      />
                      <input
                        type="text"
                        value={benefit.text}
                        onChange={(e) => {
                          const newList = [...benefitsList];
                          newList[index].text = e.target.value;
                          setBenefitsList(newList);
                        }}
                        style={{ ...styles.input, flex: 1 }}
                        placeholder="Benefit text"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newList = benefitsList.filter((_, i) => i !== index);
                          setBenefitsList(newList);
                        }}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setBenefitsList([...benefitsList, { icon: '', text: '' }])}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#27ae60',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      width: '100%',
                      marginTop: '10px',
                    }}
                  >
                    + Add Benefit
                  </button>
                </div>
                <small style={styles.helpText}>
                  Add benefits to show on the product card. Common icons: 🔥 ⚡ ❤️ 🌱 💪 ✨ 🎯 💯
                </small>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Product Sort Order</label>
                <input
                  type="number"
                  value={productForm.product_sort_order}
                  onChange={(e) => setProductForm({...productForm, product_sort_order: parseInt(e.target.value) || 0})}
                  style={styles.input}
                />
                <small style={styles.helpText}>Lower numbers appear first</small>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <input
                    type="checkbox"
                    checked={productForm.is_featured}
                    onChange={(e) => setProductForm({...productForm, is_featured: e.target.checked})}
                    style={{marginRight: '8px'}}
                  />
                  Featured Product (Product of the Month/Week)
                </label>
                <small style={styles.helpText}>Featured products appear in the hero section on the kiosk home page</small>
              </div>

              {productForm.is_featured && (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Featured Title (Optional)</label>
                    <input
                      type="text"
                      value={productForm.featured_title}
                      onChange={(e) => setProductForm({...productForm, featured_title: e.target.value})}
                      style={styles.input}
                      placeholder="Leave blank to use product name"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Featured Description (Optional)</label>
                    <textarea
                      value={productForm.featured_description}
                      onChange={(e) => setProductForm({...productForm, featured_description: e.target.value})}
                      style={{...styles.input, minHeight: '60px'}}
                      placeholder="Leave blank to use product description"
                    />
                  </div>
                </>
              )}

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <input
                    type="checkbox"
                    checked={productForm.is_active}
                    onChange={(e) => setProductForm({...productForm, is_active: e.target.checked})}
                    style={{marginRight: '8px'}}
                  />
                  Active
                </label>
              </div>
              <div style={styles.formActions}>
                <button type="button" onClick={() => {
                  setShowModal(false);
                  setSelectedImageFile(null);
                  setImagePreview(null);
                }} style={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitButton}>
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCategoryModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
            <form onSubmit={handleCategorySubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Name *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Icon (Emoji)</label>
                <input
                  type="text"
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({...categoryForm, icon: e.target.value})}
                  style={styles.input}
                  placeholder="🍔 🥤 🍰 🥗 🍕 🌮 🍜 ☕"
                />
                <small style={styles.helpText}>Use food emojis like 🍔 🥤 🍰 🥗 🍕 🌮 🍜 ☕ 🥐 🍱</small>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Sort Order</label>
                <input
                  type="number"
                  value={categoryForm.sort_order}
                  onChange={(e) => setCategoryForm({...categoryForm, sort_order: parseInt(e.target.value) || 0})}
                  style={styles.input}
                />
                <small style={styles.helpText}>Lower numbers appear first</small>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <input
                    type="checkbox"
                    checked={categoryForm.show_in_carousel}
                    onChange={(e) => setCategoryForm({...categoryForm, show_in_carousel: e.target.checked})}
                    style={{marginRight: '8px'}}
                  />
                  Show in Carousel
                </label>
                <small style={styles.helpText}>Display this category in the kiosk home carousel</small>
              </div>
              {categoryForm.show_in_carousel && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Carousel Order</label>
                  <input
                    type="number"
                    value={categoryForm.carousel_order}
                    onChange={(e) => setCategoryForm({...categoryForm, carousel_order: parseInt(e.target.value) || 0})}
                    style={styles.input}
                  />
                  <small style={styles.helpText}>Lower numbers appear first in the carousel</small>
                </div>
              )}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <input
                    type="checkbox"
                    checked={categoryForm.is_active}
                    onChange={(e) => setCategoryForm({...categoryForm, is_active: e.target.checked})}
                    style={{marginRight: '8px'}}
                  />
                  Active
                </label>
              </div>
              <div style={styles.formActions}>
                <button type="button" onClick={() => setShowCategoryModal(false)} style={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitButton}>
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tag Modal */}
      {showTagModal && (
        <div style={styles.modalOverlay} onClick={() => setShowTagModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{editingTag ? 'Edit Tag' : 'Add New Tag'}</h2>
            <form onSubmit={handleTagSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Name *</label>
                <input
                  type="text"
                  value={tagForm.name}
                  onChange={(e) => setTagForm({...tagForm, name: e.target.value})}
                  style={styles.input}
                  required
                  placeholder="e.g., Más Popular, Orgánico, Nuevo"
                />
                <small style={styles.helpText}>Create tags to categorize products</small>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Color</label>
                <input
                  type="color"
                  value={tagForm.color}
                  onChange={(e) => setTagForm({...tagForm, color: e.target.value})}
                  style={{...styles.input, height: '50px'}}
                />
                <input
                  type="text"
                  value={tagForm.color}
                  onChange={(e) => setTagForm({...tagForm, color: e.target.value})}
                  style={styles.input}
                  placeholder="#D97706"
                />
                <small style={styles.helpText}>Use hex colors like #D97706 (orange), #4CAF50 (green), #2196F3 (blue)</small>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Icon (Emoji)</label>
                <input
                  type="text"
                  value={tagForm.icon}
                  onChange={(e) => setTagForm({...tagForm, icon: e.target.value})}
                  style={styles.input}
                  placeholder="⭐ 🌱 ✨ 🔥 ❤️ 🎉"
                />
                <small style={styles.helpText}>Use emojis like ⭐ 🌱 ✨ 🔥 ❤️ 🎉</small>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Sort Order</label>
                <input
                  type="number"
                  value={tagForm.sort_order}
                  onChange={(e) => setTagForm({...tagForm, sort_order: parseInt(e.target.value) || 0})}
                  style={styles.input}
                />
                <small style={styles.helpText}>Lower numbers appear first</small>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Preview</label>
                <div>
                  <span style={{
                    ...styles.tagBadge,
                    backgroundColor: tagForm.color || '#D97706'
                  }}>
                    {tagForm.icon && `${tagForm.icon} `}{tagForm.name || 'Tag Name'}
                  </span>
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={{...styles.label, display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '12px', backgroundColor: tagForm.is_active ? '#d4edda' : '#f8d7da', borderRadius: '6px', border: tagForm.is_active ? '2px solid #28a745' : '2px solid #dc3545'}}>
                  <input
                    type="checkbox"
                    checked={tagForm.is_active}
                    onChange={(e) => setTagForm({...tagForm, is_active: e.target.checked})}
                    style={{marginRight: '8px', width: '18px', height: '18px', cursor: 'pointer'}}
                  />
                  <span style={{fontWeight: 'bold', color: tagForm.is_active ? '#155724' : '#721c24'}}>
                    {tagForm.is_active ? '✓ Active - Tag will be visible' : '✗ Inactive - Tag will be hidden'}
                  </span>
                </label>
                <small style={styles.helpText}>Active tags can be assigned to products and will be visible in the kiosk</small>
              </div>
              <div style={styles.formActions}>
                <button type="button" onClick={() => setShowTagModal(false)} style={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitButton}>
                  {editingTag ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div style={styles.confirmModalOverlay} onClick={() => !confirmModal.cancelText && setConfirmModal({ ...confirmModal, show: false })}>
          <div style={styles.confirmModalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.confirmModalTitle}>{confirmModal.title}</h2>
            <p style={styles.confirmModalMessage}>{confirmModal.message}</p>
            <div style={styles.confirmModalButtons}>
              {confirmModal.cancelText && (
                <button
                  style={styles.modalCancelButton}
                  onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                >
                  {confirmModal.cancelText}
                </button>
              )}
              <button
                style={styles.modalConfirmButton}
                onClick={confirmModal.onConfirm}
              >
                {confirmModal.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModal.show && (
        <div style={styles.confirmModalOverlay} onClick={() => setSuccessModal({ ...successModal, show: false })}>
          <div style={styles.successModalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.successModalTitle}>{successModal.title}</h2>
            <p style={styles.successModalMessage}>{successModal.message}</p>
            <button
              style={styles.successButton}
              onClick={() => setSuccessModal({ ...successModal, show: false })}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1a1a2e',
    color: 'white',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backLink: {
    color: '#3498db',
    textDecoration: 'none',
    fontSize: '14px',
    display: 'block',
    marginBottom: '10px',
  },
  logoutButton: {
    padding: '10px 20px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  content: {
    padding: '20px',
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  tab: {
    padding: '12px 24px',
    backgroundColor: 'white',
    border: '2px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  tabActive: {
    padding: '12px 24px',
    backgroundColor: '#3498db',
    color: 'white',
    border: '2px solid #3498db',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  addButton: {
    padding: '12px 24px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#666',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflow: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    borderBottom: '2px solid #ddd',
    backgroundColor: '#f8f9fa',
    fontWeight: 'bold',
  },
  tr: {
    borderBottom: '1px solid #eee',
  },
  td: {
    padding: '16px',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  editButton: {
    padding: '8px 16px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '8px',
  },
  deleteButton: {
    padding: '8px 16px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  submitButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  confirmModalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  confirmModalContent: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    maxWidth: '450px',
    width: '90%',
    textAlign: 'center',
  },
  confirmModalTitle: {
    fontSize: '24px',
    color: '#2c3e50',
    marginBottom: '15px',
  },
  confirmModalMessage: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '25px',
    lineHeight: '1.5',
  },
  confirmModalButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
  },
  modalCancelButton: {
    padding: '12px 30px',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  modalConfirmButton: {
    padding: '12px 30px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  successModalContent: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    maxWidth: '450px',
    width: '90%',
    textAlign: 'center',
  },
  successIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#27ae60',
    color: 'white',
    fontSize: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  successModalTitle: {
    fontSize: '24px',
    color: '#27ae60',
    marginBottom: '15px',
  },
  successModalMessage: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '25px',
    lineHeight: '1.5',
  },
  successButton: {
    padding: '12px 40px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  imagePreviewContainer: {
    marginBottom: '15px',
    textAlign: 'center' as const,
  },
  imagePreview: {
    maxWidth: '100%',
    maxHeight: '200px',
    borderRadius: '8px',
    marginBottom: '10px',
    objectFit: 'cover' as const,
  },
  removeImageButton: {
    padding: '8px 16px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  helpText: {
    fontSize: '12px',
    color: '#666',
    fontStyle: 'italic' as const,
    display: 'block' as const,
    marginTop: '5px',
  },
  tableImage: {
    width: '60px',
    height: '60px',
    objectFit: 'cover' as const,
    borderRadius: '8px',
    border: '1px solid #ddd',
  },
  noImage: {
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: '8px',
    fontSize: '10px',
    color: '#999',
    textAlign: 'center' as const,
  },
  tagBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
    marginRight: '4px',
    marginBottom: '4px',
  },
};

export default ProductsManagementPage;
