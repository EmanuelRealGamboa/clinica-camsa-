# Guía de Implementación: Imágenes de Productos

## Cambios Realizados en el Backend

### 1. Modelo Product Actualizado
**Archivo**: `catalog/models.py`

Se agregó un campo `ImageField` al modelo Product:
```python
image = models.ImageField(
    _('product image'),
    upload_to='products/',
    blank=True,
    null=True,
    help_text=_('Product image file')
)
```

También se agregó el método `get_image_url()` que prioriza la imagen subida sobre la URL externa.

### 2. Serializers Actualizados
**Archivo**: `catalog/serializers.py`

Se agregó el campo `image_url_full` a ambos serializers (ProductSerializer y PublicProductSerializer) que devuelve la URL completa de la imagen.

### 3. Configuración de Media Files
**Archivo**: `clinic_service/urls.py`

Se agregó el serving de archivos media en desarrollo.

### 4. Dependencias
**Archivo**: `requirements.txt`

Se agregó `Pillow==11.1.0` para manejar imágenes.

## Pasos para Completar la Implementación

### Backend:

1. **Instalar Pillow**:
```bash
cd clinica-camsa-
.\venv\Scripts\activate
pip install Pillow==11.1.0
```

2. **Crear y aplicar migración**:
```bash
python manage.py makemigrations catalog
python manage.py migrate
```

3. **Verificar carpeta media** (se creará automáticamente):
   - Las imágenes se guardarán en: `clinica-camsa-/media/products/`

### Frontend:

#### Cambios Necesarios en ProductsManagementPage.tsx

Agregar estos estados después de `productForm`:

```typescript
const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState<string | null>(null);
```

Actualizar `handleProductSubmit` para usar FormData:

```typescript
const handleProductSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const formData = new FormData();
    formData.append('name', productForm.name);
    formData.append('description', productForm.description);
    formData.append('category', productForm.category);
    formData.append('sku', productForm.sku);
    formData.append('unit_label', productForm.unit_label);
    formData.append('is_active', productForm.is_active.toString());

    // Solo agregar image_url si no hay archivo de imagen
    if (!selectedImageFile && productForm.image_url) {
      formData.append('image_url', productForm.image_url);
    }

    // Agregar imagen si existe
    if (selectedImageFile) {
      formData.append('image', selectedImageFile);
    }

    if (editingProduct) {
      await adminApi.updateProduct(editingProduct.id, formData);
      // ... resto del código
    } else {
      await adminApi.createProduct(formData);
      // ... resto del código
    }

    setShowModal(false);
    setEditingProduct(null);
    setSelectedImageFile(null);
    setImagePreview(null);
    resetProductForm();
    loadData();
  } catch (err: any) {
    // ... manejo de errores
  }
};
```

Agregar función para manejar la selección de imagen:

```typescript
const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setSelectedImageFile(file);
    // Crear preview
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
```

Actualizar `handleEditProduct` para mostrar imagen existente:

```typescript
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
  });
  // Mostrar imagen existente como preview
  if (product.image_url_full) {
    setImagePreview(product.image_url_full);
  }
  setShowModal(true);
};
```

Actualizar `resetProductForm` para limpiar imagen:

```typescript
const resetProductForm = () => {
  setProductForm({
    name: '',
    description: '',
    image_url: '',
    category: '',
    sku: '',
    unit_label: 'unidad',
    is_active: true,
  });
  setSelectedImageFile(null);
  setImagePreview(null);
};
```

Agregar campo de imagen en el modal del formulario (después del campo description):

```tsx
<div style={styles.formGroup}>
  <label style={styles.label}>Product Image</label>

  {imagePreview && (
    <div style={styles.imagePreviewContainer}>
      <img src={imagePreview} alt="Preview" style={styles.imagePreview} />
      <button
        type="button"
        onClick={handleRemoveImage}
        style={styles.removeImageButton}
      >
        Remove Image
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
    Upload an image file (recommended) or use Image URL below
  </small>
</div>

<div style={styles.formGroup}>
  <label style={styles.label}>Image URL (Optional)</label>
  <input
    type="url"
    value={productForm.image_url}
    onChange={(e) => setProductForm({...productForm, image_url: e.target.value})}
    style={styles.input}
    placeholder="https://..."
    disabled={!!selectedImageFile}
  />
  <small style={styles.helpText}>
    External image URL (only if not uploading a file)
  </small>
</div>
```

Agregar estilos para la imagen:

```typescript
imagePreviewContainer: {
  marginBottom: '15px',
  textAlign: 'center',
},
imagePreview: {
  maxWidth: '100%',
  maxHeight: '200px',
  borderRadius: '8px',
  marginBottom: '10px',
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
  fontStyle: 'italic',
},
```

### Actualizar KioskPage.tsx

Cambiar la tarjeta de producto para mostrar la imagen:

```tsx
<div key={product.id} style={styles.productCard}>
  {product.image_url_full && (
    <img
      src={product.image_url_full}
      alt={product.name}
      style={styles.productImage}
      onError={(e) => {
        // Ocultar imagen si falla la carga
        e.currentTarget.style.display = 'none';
      }}
    />
  )}
  <h3>{product.name}</h3>
  <p style={styles.description}>{product.description}</p>
  <p style={styles.unit}>{product.unit_label}</p>
  {/* ... resto del código */}
</div>
```

Agregar estilo para la imagen del producto:

```typescript
productImage: {
  width: '100%',
  height: '150px',
  objectFit: 'cover',
  borderRadius: '8px 8px 0 0',
  marginBottom: '10px',
},
```

## Resultado Final

Después de implementar estos cambios:

1. **Admin Panel**: Podrás subir imágenes de productos desde el formulario
2. **Kiosk**: Los productos mostrarán sus imágenes
3. **Compatibilidad**: Aún funciona con URLs externas si no subes un archivo

## Orden de Implementación

1. Instalar Pillow
2. Crear y aplicar migración
3. Actualizar ProductsManagementPage.tsx
4. Actualizar KioskPage.tsx
5. Probar creando un producto con imagen
6. Probar en el kiosk

## Notas Importantes

- Las imágenes se guardan en `media/products/`
- El backend prioriza las imágenes subidas sobre las URLs externas
- Si una imagen falla al cargar en el kiosk, se oculta automáticamente
- El campo `image_url` sigue disponible para URLs externas si prefieres no subir archivos
