from django.contrib import admin
from django.utils.html import format_html
from .models import ProductCategory, Product, ProductTag


@admin.register(ProductTag)
class ProductTagAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'color_preview', 'icon', 'sort_order', 'is_active', 'created_at']
    list_editable = ['sort_order', 'is_active']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name']
    ordering = ['sort_order', 'name']
    readonly_fields = ['created_at', 'updated_at', 'color_preview']
    actions = ['activate_tags', 'deactivate_tags']

    fieldsets = (
        ('Tag Information', {
            'fields': ('name', 'color', 'color_preview', 'icon', 'sort_order', 'is_active'),
            'description': 'Create tags to categorize products (e.g., "Más Popular", "Orgánico", "Nuevo")'
        }),
        ('Help', {
            'fields': (),
            'description': '''
                <strong>Color:</strong> Use hex colors like #D97706 (orange), #4CAF50 (green), #2196F3 (blue)<br>
                <strong>Icon:</strong> Use emojis like ⭐ 🌱 ✨ 🔥 ❤️ 🎉<br>
                <strong>Sort Order:</strong> Lower numbers appear first
            '''
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def color_preview(self, obj):
        if obj.color:
            return format_html(
                '<div style="background-color: {}; width: 50px; height: 20px; border: 1px solid #ccc; border-radius: 4px;"></div>',
                obj.color
            )
        return '-'
    color_preview.short_description = 'Color Preview'

    def activate_tags(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} tag(s) activated.')
    activate_tags.short_description = 'Activate selected tags'

    def deactivate_tags(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} tag(s) deactivated.')
    deactivate_tags.short_description = 'Deactivate selected tags'


@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'icon_display', 'category_type', 'sort_order', 'show_in_carousel', 'carousel_order', 'is_active', 'product_count']
    list_editable = ['category_type', 'sort_order', 'show_in_carousel', 'carousel_order', 'is_active']
    list_filter = ['is_active', 'show_in_carousel', 'category_type', 'created_at']
    search_fields = ['name']
    ordering = ['sort_order', 'name']
    readonly_fields = ['created_at', 'updated_at', 'product_count']
    actions = ['show_in_carousel_action', 'hide_from_carousel_action', 'activate_categories', 'deactivate_categories', 'set_as_drink', 'set_as_snack']

    fieldsets = (
        ('Category Information', {
            'fields': ('name', 'icon', 'category_type', 'sort_order', 'is_active'),
            'description': 'Basic category information'
        }),
        ('Carousel Settings', {
            'fields': ('show_in_carousel', 'carousel_order'),
            'description': '''
                <strong>Show in Carousel:</strong> Check to display this category in the kiosk home carousel<br>
                <strong>Carousel Order:</strong> Lower numbers appear first in the carousel
            '''
        }),
        ('Help', {
            'fields': (),
            'description': '''
                <strong>Icon:</strong> Use food emojis like 🍔 🥤 🍰 🥗 🍕 🌮 🍜 ☕ 🥐 🍱<br>
                <strong>Category Type:</strong> DRINK (bebidas), SNACK (comida ligera), OTHER (otros)
            '''
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def icon_display(self, obj):
        return format_html('<span style="font-size: 24px;">{}</span>', obj.icon) if obj.icon else '-'
    icon_display.short_description = 'Icon'

    def product_count(self, obj):
        count = obj.products.filter(is_active=True).count()
        return format_html('<strong>{}</strong>', count)
    product_count.short_description = 'Active Products'

    def show_in_carousel_action(self, request, queryset):
        updated = queryset.update(show_in_carousel=True)
        self.message_user(request, f'{updated} categor(y/ies) will now show in carousel.')
    show_in_carousel_action.short_description = 'Show in carousel'

    def hide_from_carousel_action(self, request, queryset):
        updated = queryset.update(show_in_carousel=False)
        self.message_user(request, f'{updated} categor(y/ies) hidden from carousel.')
    hide_from_carousel_action.short_description = 'Hide from carousel'

    def activate_categories(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} categor(y/ies) activated.')
    activate_categories.short_description = 'Activate selected categories'

    def deactivate_categories(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} categor(y/ies) deactivated.')
    deactivate_categories.short_description = 'Deactivate selected categories'

    def set_as_drink(self, request, queryset):
        updated = queryset.update(category_type='DRINK')
        self.message_user(request, f'{updated} categor(y/ies) set as DRINK.')
    set_as_drink.short_description = 'Set as DRINK (Bebidas)'

    def set_as_snack(self, request, queryset):
        updated = queryset.update(category_type='SNACK')
        self.message_user(request, f'{updated} categor(y/ies) set as SNACK.')
    set_as_snack.short_description = 'Set as SNACK (Snacks)'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'image_preview', 'name', 'category', 'rating_display', 'tag_count', 'is_featured', 'product_sort_order', 'is_active']
    list_editable = ['is_featured', 'product_sort_order', 'is_active']
    list_filter = ['is_active', 'is_featured', 'category', 'tags', 'created_at']
    search_fields = ['name', 'description', 'sku', 'featured_title']
    ordering = ['category__sort_order', 'product_sort_order', 'name']
    readonly_fields = ['created_at', 'updated_at', 'image_preview_large', 'inventory_info']
    filter_horizontal = ['tags']
    actions = ['mark_as_featured', 'unmark_as_featured', 'activate_products', 'deactivate_products']

    fieldsets = (
        ('Basic Information', {
            'fields': ('category', 'name', 'description'),
            'description': 'Core product information'
        }),
        ('Image', {
            'fields': ('image', 'image_preview_large', 'image_url'),
            'description': 'Upload a product image or provide an external URL'
        }),
        ('Product Details', {
            'fields': ('sku', 'unit_label', 'is_active', 'product_sort_order'),
        }),
        ('Rating & Reviews', {
            'fields': ('rating', 'rating_count'),
            'description': '''
                <strong>Rating:</strong> Enter a value between 0.0 and 5.0 (e.g., 4.5)<br>
                <strong>Rating Count:</strong> Number of reviews (e.g., 125)
            '''
        }),
        ('Tags & Benefits', {
            'fields': ('tags', 'benefits'),
            'description': '''
                <strong>Tags:</strong> Select one or more tags to show as badges on the product card<br>
                <strong>Benefits:</strong> Enter as JSON array. Example:<br>
                <code>[{"icon": "🔥", "text": "Recién preparado"}, {"icon": "⚡", "text": "Listo en 15 min"}]</code><br>
                Common icons: 🔥 ⚡ ❤️ 🌱 💪 ✨ 🎯 💯
            '''
        }),
        ('Featured Product Settings', {
            'fields': ('is_featured', 'featured_title', 'featured_description'),
            'description': '''
                <strong style="color: #D97706;">⭐ Featured products appear in the hero section on the kiosk home page</strong><br>
                <strong>Featured Title:</strong> Custom title for hero section (leave blank to use product name)<br>
                <strong>Featured Description:</strong> Custom description for hero section (leave blank to use product description)
            ''',
            'classes': ('collapse',)
        }),
        ('Inventory', {
            'fields': ('inventory_info',),
            'description': 'Current inventory status',
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def image_preview(self, obj):
        image_url = obj.get_image_url()
        if image_url:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;" />',
                image_url
            )
        return '-'
    image_preview.short_description = 'Image'

    def image_preview_large(self, obj):
        image_url = obj.get_image_url()
        if image_url:
            return format_html(
                '<img src="{}" style="max-width: 400px; max-height: 400px; object-fit: contain; border-radius: 12px; border: 1px solid #ddd;" />',
                image_url
            )
        return 'No image uploaded'
    image_preview_large.short_description = 'Image Preview'

    def rating_display(self, obj):
        if obj.rating and obj.rating > 0:
            stars = '★' * int(obj.rating) + '☆' * (5 - int(obj.rating))
            rating_value = float(obj.rating)
            return format_html(
                '<span style="color: #D97706; font-size: 16px;">{}</span> <span style="color: #666;">({})</span>',
                stars, f'{rating_value:.1f}'
            )
        return '-'
    rating_display.short_description = 'Rating'

    def tag_count(self, obj):
        count = obj.tags.count()
        if count > 0:
            tag_names = ', '.join([tag.name for tag in obj.tags.all()[:3]])
            if count > 3:
                tag_names += f' +{count - 3} more'
            return format_html('<span title="{}">{}</span>', tag_names, count)
        return '-'
    tag_count.short_description = 'Tags'

    def inventory_info(self, obj):
        try:
            balance = obj.inventory_balance
            available = balance.available
            status_color = '#27ae60' if available > 10 else '#f39c12' if available > 0 else '#e74c3c'
            status_text = 'In Stock' if available > 10 else 'Low Stock' if available > 0 else 'Out of Stock'
            return format_html(
                '<div style="padding: 10px; background: {}; color: white; border-radius: 6px; display: inline-block;">'
                '<strong>{}</strong> - {} units available</div>',
                status_color, status_text, available
            )
        except:
            return format_html('<span style="color: #999;">No inventory record</span>')
    inventory_info.short_description = 'Inventory Status'

    def mark_as_featured(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'{updated} product(s) marked as featured.')
    mark_as_featured.short_description = '⭐ Mark as featured'

    def unmark_as_featured(self, request, queryset):
        updated = queryset.update(is_featured=False)
        self.message_user(request, f'{updated} product(s) unmarked as featured.')
    unmark_as_featured.short_description = 'Remove featured status'

    def activate_products(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} product(s) activated.')
    activate_products.short_description = 'Activate selected products'

    def deactivate_products(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} product(s) deactivated.')
    deactivate_products.short_description = 'Deactivate selected products'
