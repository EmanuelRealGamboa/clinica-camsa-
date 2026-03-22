"""
Script para convertir las rutas de imagen a URLs completas de Cloudinary.
Ejecutar con: python fix_cloudinary_urls.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinic_service.settings')
django.setup()

from catalog.models import Product

CLOUDINARY_BASE_URL = "https://res.cloudinary.com/dpovyqzj2/image/upload/"

def fix_image_urls():
    print("Corrigiendo URLs de imágenes...")
    
    products = Product.objects.all()
    updated = 0
    
    for product in products:
        if product.image and not str(product.image).startswith('http'):
            # La imagen tiene una ruta relativa de Cloudinary
            old_path = str(product.image)
            
            # Construir la URL completa de Cloudinary
            cloudinary_url = f"{CLOUDINARY_BASE_URL}{old_path}"
            
            # Guardar en image_url y limpiar image
            product.image_url = cloudinary_url
            product.image = None  # Limpiar el campo image
            product.save()
            
            print(f"  ✓ {product.name}: {cloudinary_url}")
            updated += 1
    
    print(f"\n¡Listo! Se actualizaron {updated} productos.")

if __name__ == '__main__':
    fix_image_urls()
