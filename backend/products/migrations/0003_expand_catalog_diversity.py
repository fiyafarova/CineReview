#st
from decimal import Decimal

from django.conf import settings
from django.db import migrations


# Дополнительные категории делают каталог менее однотипным.
NEW_CATEGORIES = [
    ('Clothing', 'clothing'),
    ('Books', 'books'),
    ('Sports & Outdoors', 'sports-outdoors'),
]


# Новые наборы изображений для нетехнических категорий.
NEW_IMAGE_POOLS = {
    'clothing': [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
    ],
    'books': [
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=80',
    ],
    'sports-outdoors': [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80',
    ],
}


# Вторая волна демонстрационных товаров расширяет ассортимент за пределы электроники.
NEW_PRODUCTS = {
    'clothing': [
        ('Urban Overshirt', 'Northline', '79.00', '99.00', 21, 'Cotton twill', 'Regular fit', 'Sizes S-XL', 'Midnight Navy', 'A smart casual overshirt for daily wear and layered styling.'),
        ('Essential Hoodie', 'Morrow', '59.00', None, 34, 'Heavy fleece', 'Relaxed fit', 'Sizes XS-XL', 'Heather Gray', 'Soft everyday hoodie with a premium brushed interior.'),
        ('Wide Leg Trousers', 'Atelier', '69.00', None, 18, 'Viscose blend', 'Wide leg', 'Sizes S-L', 'Sand Beige', 'Clean silhouette trousers for office and casual looks.'),
        ('Tech Runner Jacket', 'Northline', '129.00', '149.00', 12, 'Water-resistant shell', 'Athletic fit', 'Sizes M-XL', 'Forest Green', 'Lightweight jacket for daily commuting and travel.'),
        ('Minimal Knit Set', 'Atelier', '89.00', None, 10, 'Soft knit', 'Comfort fit', 'Sizes S-L', 'Stone', 'Modern coordinated knitwear set with understated texture.'),
    ],
    'books': [
        ('Atomic Habits', 'Avery', '18.00', None, 40, 'Self-development', 'Hardcover', '320 pages', 'English', 'Bestselling habits and productivity book for practical self-improvement.'),
        ('The Pragmatic Programmer', 'Addison-Wesley', '42.00', '49.00', 16, 'Programming', 'Paperback', '352 pages', 'English', 'Software craftsmanship classic for engineers and students.'),
        ('Dune', 'Ace', '16.00', None, 28, 'Science fiction', 'Paperback', '688 pages', 'English', 'A landmark science-fiction novel with political and epic worldbuilding.'),
        ('Ikigai', 'Penguin', '14.00', None, 22, 'Lifestyle', 'Paperback', '208 pages', 'English', 'Readable book on routines, longevity, and balanced living.'),
        ('The Little Prince', 'Wordsworth', '11.00', None, 30, 'Classic', 'Paperback', '96 pages', 'English', 'Classic short novel suitable for display and general catalog variety.'),
    ],
    'sports-outdoors': [
        ('Trail Runner Pro', 'AeroMove', '139.00', '169.00', 15, 'Breathable mesh', 'Trail cushioning', 'Sizes 40-45', 'Orange / Black', 'Responsive trail running shoes with grip-focused outsole.'),
        ('City Hybrid Bike Helmet', 'RideNorth', '69.00', None, 19, 'ABS shell', 'Urban cycling', 'Adjustable fit', 'Matte Black', 'Lightweight commuter helmet with dial-fit system.'),
        ('Compact Camping Stove', 'WildCamp', '49.00', None, 25, 'Steel body', 'Portable burner', 'Piezo ignition', 'Silver', 'Packable stove for hiking, camping, and emergency kits.'),
        ('Yoga Flow Mat', 'AeroMove', '39.00', None, 31, 'Eco foam', '6 mm thickness', 'Non-slip surface', 'Lilac', 'Soft but stable yoga mat for home workouts and studio sessions.'),
        ('Hydration Pack 12L', 'WildCamp', '59.00', '74.00', 14, 'Ripstop nylon', '12L storage', '2L bladder included', 'Olive', 'Compact outdoor hydration backpack for short hikes and rides.'),
    ],
}


# Несколько стартовых отзывов для новых категорий.
REVIEW_SEED = [
    ('Nova X Pro 256GB', 5, 'Very clean flagship feel. The gallery, specs, and pricing now look like a real marketplace product.'),
    ('AeroBook 14', 4, 'Nice balance for study and office use. Good fit for a realistic laptop catalog.'),
    ('VisionMax 55 4K Smart TV', 5, 'Looks strong in the storefront and the detail page finally has enough substance.'),
    ('Urban Overshirt', 4, 'Good to have non-tech categories too. Makes the catalog feel broader and more believable.'),
    ('The Pragmatic Programmer', 5, 'Books category is a strong addition for project variety.'),
    ('Trail Runner Pro', 4, 'Sports products help the store feel less one-dimensional.'),
]


def seed_more_products(apps, schema_editor):
    # Добавляем новые категории, товары и часть демонстрационных отзывов.
    Category = apps.get_model('products', 'Category')
    Product = apps.get_model('products', 'Product')
    ProductImage = apps.get_model('products', 'ProductImage')
    ProductSpecification = apps.get_model('products', 'ProductSpecification')
    Review = apps.get_model('products', 'Review')
    User = apps.get_model(*settings.AUTH_USER_MODEL.split('.'))

    category_map = {}
    for name, slug in NEW_CATEGORIES:
        category_map[slug], _ = Category.objects.get_or_create(name=name, slug=slug)

    for slug, items in NEW_PRODUCTS.items():
        image_pool = NEW_IMAGE_POOLS[slug]
        for index, item in enumerate(items):
            name, brand, price, old_price, stock, spec1, spec2, spec3, spec4, description = item
            product, _ = Product.objects.get_or_create(
                name=name,
                defaults={
                    'category': category_map[slug],
                    'description': description,
                    'brand': brand,
                    'price': Decimal(price),
                    'old_price': Decimal(old_price) if old_price else None,
                    'image': image_pool[index % len(image_pool)],
                    'stock': stock,
                    'is_active': True,
                },
            )

            if product.gallery.count() == 0:
                for image_index, image_url in enumerate(image_pool):
                    ProductImage.objects.create(
                        product=product,
                        image_url=image_url,
                        alt_text=product.name,
                        sort_order=image_index,
                    )

            if product.specifications.count() == 0:
                spec_rows = [
                    ('Material / Genre', spec1),
                    ('Fit / Format', spec2),
                    ('Size / Pages / Feature', spec3),
                    ('Color / Language / Extra', spec4),
                ]
                for spec_index, (spec_name, spec_value) in enumerate(spec_rows):
                    ProductSpecification.objects.create(
                        product=product,
                        name=spec_name,
                        value=spec_value,
                        sort_order=spec_index,
                    )

    review_user, _ = User.objects.get_or_create(
        username='catalog_demo',
        defaults={'email': 'catalog_demo@example.com'}
    )
    if hasattr(review_user, 'set_password'):
        review_user.set_password('catalog_demo_123')
        review_user.save(update_fields=['password'])

    for product_name, rating, comment in REVIEW_SEED:
        product = Product.objects.filter(name=product_name).first()
        if product and not Review.objects.filter(user=review_user, product=product).exists():
            Review.objects.create(user=review_user, product=product, rating=rating, comment=comment)


def rollback_more_products(apps, schema_editor):
    # Откатываем только данные, созданные этой миграцией.
    Category = apps.get_model('products', 'Category')
    Product = apps.get_model('products', 'Product')
    User = apps.get_model(*settings.AUTH_USER_MODEL.split('.'))

    Product.objects.filter(name__in=[item[0] for values in NEW_PRODUCTS.values() for item in values]).delete()
    Category.objects.filter(slug__in=[slug for _, slug in NEW_CATEGORIES]).delete()
    User.objects.filter(username='catalog_demo').delete()


class Migration(migrations.Migration):
    # Миграция расширяет каталог одеждой, книгами и спортивными товарами.

    dependencies = [
        ('products', '0002_seed_catalog'),
    ]

    operations = [
        migrations.RunPython(seed_more_products, rollback_more_products),
    ]