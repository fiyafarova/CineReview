#st
from decimal import Decimal

from django.db import migrations


# Базовые категории первого наполнения каталога.
CATEGORY_DEFINITIONS = [
    ('Smartphones', 'smartphones'),
    ('Laptops', 'laptops'),
    ('TV & Audio', 'tv-audio'),
    ('Home Appliances', 'home-appliances'),
    ('Tablets', 'tablets'),
]


# Наборы изображений помогают быстро собрать реалистичную демонстрационную витрину.
IMAGE_POOLS = {
    'smartphones': [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80',
    ],
    'laptops': [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1200&q=80',
    ],
    'tv-audio': [
        'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80',
    ],
    'home-appliances': [
        'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?auto=format&fit=crop&w=1200&q=80',
    ],
    'tablets': [
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1589739900243-4b52cd9dd136?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=1200&q=80',
    ],
}


# Заготовки товаров для начального заполнения каталога.
PRODUCT_BLUEPRINTS = {
    'smartphones': [
        ('Nova X Pro 256GB', 'NovaTech', '599.00', '679.00', 18, '6.7-inch OLED 120Hz', '12 GB / 256 GB', '50 MP triple camera', '5000 mAh', 'Graphite Black'),
        ('PixelView Air 128GB', 'PixelView', '449.00', None, 9, '6.4-inch AMOLED', '8 GB / 128 GB', '48 MP dual camera', '4700 mAh', 'Silver Frost'),
        ('Nova Lite 128GB', 'NovaTech', '369.00', '409.00', 16, '6.5-inch AMOLED', '8 GB / 128 GB', '64 MP dual camera', '4800 mAh', 'Ocean Blue'),
        ('Nova Lite 256GB', 'NovaTech', '419.00', None, 14, '6.5-inch AMOLED', '8 GB / 256 GB', '64 MP dual camera', '5000 mAh', 'Silver Mist'),
        ('PixelView Air Plus', 'PixelView', '499.00', '549.00', 12, '6.6-inch OLED', '12 GB / 256 GB', '50 MP main camera', '5000 mAh', 'Cloud White'),
        ('HyperOne S', 'HyperOne', '529.00', None, 8, '6.78-inch AMOLED 144Hz', '12 GB / 256 GB', '108 MP triple camera', '5100 mAh', 'Matte Black'),
        ('HyperOne Mini', 'HyperOne', '389.00', '429.00', 11, '6.1-inch OLED', '8 GB / 128 GB', '50 MP dual camera', '4300 mAh', 'Rose Gold'),
        ('ZenCore Ultra', 'ZenCore', '699.00', '779.00', 6, '6.8-inch LTPO OLED', '16 GB / 512 GB', '50 MP periscope system', '5300 mAh', 'Titan Gray'),
        ('ZenCore Air', 'ZenCore', '459.00', None, 17, '6.55-inch OLED', '8 GB / 256 GB', '50 MP + ultra wide', '4700 mAh', 'Mint Green'),
        ('Wave Phone 5G', 'Wave', '339.00', None, 20, '6.58-inch IPS', '6 GB / 128 GB', '48 MP camera', '5000 mAh', 'Deep Purple'),
    ],
    'laptops': [
        ('AeroBook 14', 'Aero', '899.00', '999.00', 7, '14-inch 2.8K IPS', '16 GB RAM', '512 GB SSD', 'Intel Core i7', 'Silver'),
        ('CodeBook 15 Ryzen Edition', 'Vertex', '1049.00', None, 5, '15.6-inch QHD 165Hz', '32 GB RAM', '1 TB SSD', 'AMD Ryzen 7', 'Graphite'),
        ('AeroBook 16 Creator', 'Aero', '1299.00', '1399.00', 4, '16-inch 3.2K', '32 GB RAM', '1 TB SSD', 'RTX 4050', 'Space Gray'),
        ('AeroBook 13 Student', 'Aero', '699.00', None, 12, '13.3-inch FHD', '8 GB RAM', '512 GB SSD', 'Intel Core i5', 'Ice Blue'),
        ('Vertex Workstation 17', 'Vertex', '1549.00', None, 3, '17-inch QHD', '32 GB RAM', '1 TB SSD', 'RTX 4070', 'Black'),
        ('Vertex Flex 14', 'Vertex', '849.00', '919.00', 9, '14-inch touch IPS', '16 GB RAM', '512 GB SSD', 'AMD Ryzen 5', 'Pearl White'),
        ('CodeBook 14 Air', 'Vertex', '929.00', None, 8, '14-inch 2.5K', '16 GB RAM', '1 TB SSD', 'AMD Ryzen 7', 'Blue Steel'),
        ('OfficeMate 15', 'OfficeMate', '579.00', '629.00', 18, '15.6-inch FHD', '8 GB RAM', '256 GB SSD', 'Intel Core i3', 'Black'),
        ('OfficeMate 15 Plus', 'OfficeMate', '729.00', None, 13, '15.6-inch FHD IPS', '16 GB RAM', '512 GB SSD', 'Intel Core i5', 'Silver'),
        ('StreamNote 16', 'Stream', '879.00', '949.00', 6, '16-inch 2.5K', '16 GB RAM', '1 TB SSD', 'AMD Ryzen 7', 'Dark Navy'),
    ],
    'tv-audio': [
        ('VisionMax 55 4K Smart TV', 'VisionMax', '749.00', '899.00', 11, '55-inch panel', '4K UHD', 'Google TV', '2 x 12W sound', 'Black'),
        ('PulseBuds Studio', 'Pulse', '179.00', '219.00', 23, 'Over-ear ANC', 'Bluetooth 5.3', '6 ENC microphones', '35h playback', 'Midnight Blue'),
        ('VisionMax 65 OLED', 'VisionMax', '1199.00', '1349.00', 5, '65-inch OLED', '4K UHD', 'Dolby Vision', '120Hz panel', 'Black'),
        ('VisionMax 43 Compact', 'VisionMax', '429.00', None, 14, '43-inch LED', '4K UHD', 'Google TV', '2 x 10W sound', 'Black'),
        ('SoundArc Home Theater', 'Pulse', '399.00', '459.00', 9, '5.1 channel', 'Wireless subwoofer', 'Dolby Audio', 'HDMI eARC', 'Black'),
        ('PulseBuds Air', 'Pulse', '99.00', None, 27, 'True wireless', 'Bluetooth 5.3', 'ENC microphones', '30h battery', 'White'),
        ('PulseBuds Sport', 'Pulse', '119.00', '139.00', 19, 'True wireless sport fit', 'IPX5 water resistance', 'ENC microphones', '32h battery', 'Lime'),
        ('CinemaBox Projector', 'CinemaBox', '549.00', '629.00', 8, 'Full HD projector', '700 ANSI lumens', 'Android TV', 'Dual speakers', 'White'),
        ('CinemaBox Projector Pro', 'CinemaBox', '799.00', None, 4, '4K-ready projector', '1000 ANSI lumens', 'Auto focus', 'Dual 10W sound', 'Gray'),
        ('StudioSound Speaker Max', 'StudioSound', '229.00', '259.00', 12, 'Portable speaker', 'Bluetooth 5.3', 'IP67 protection', '30h playback', 'Black'),
    ],
    'home-appliances': [
        ('CleanWave Robot Vacuum', 'CleanWave', '329.00', None, 13, 'LiDAR mapping', '5200 mAh', 'Vacuum and mop', '180 min runtime', 'Black'),
        ('Barista Home Coffee Station', 'Barista', '259.00', '309.00', 10, '19 bar pressure', '1.6 L tank', 'Latte program', 'Milk frother', 'Steel'),
        ('CleanWave Robot Vacuum Pro', 'CleanWave', '469.00', '519.00', 8, 'LiDAR + camera mapping', '6500 mAh', 'Auto-empty dock', '240 min runtime', 'Black'),
        ('BreezeAir Purifier 30', 'Breeze', '199.00', None, 15, '30 m2 coverage', 'HEPA H13', 'Quiet mode', 'Air sensor', 'White'),
        ('BreezeAir Purifier 50', 'Breeze', '279.00', '319.00', 11, '50 m2 coverage', 'HEPA H13', 'Wi-Fi control', 'Air sensor', 'White'),
        ('FreshWash 7kg', 'FreshWash', '489.00', None, 6, '7 kg load', '1400 rpm', 'Steam wash', 'Inverter motor', 'Silver'),
        ('FreshWash 9kg', 'FreshWash', '629.00', '699.00', 5, '9 kg load', '1400 rpm', 'Steam wash', 'Inverter motor', 'White'),
        ('CoolBreeze AC 12K', 'CoolBreeze', '559.00', None, 9, '12000 BTU', 'Inverter', 'Wi-Fi ready', 'Low-noise mode', 'White'),
        ('KitchenPro Air Fryer XL', 'KitchenPro', '139.00', None, 20, '6.5 L basket', '2000 W', '8 presets', 'Digital panel', 'Black'),
        ('HomeChef Oven 45L', 'HomeChef', '229.00', '259.00', 10, '45 L volume', '1800 W', 'Convection', 'Timer control', 'Black'),
    ],
    'tablets': [
        ('Tab Nova 11', 'NovaTech', '329.00', '379.00', 15, '11-inch IPS', '8 GB / 128 GB', '8 MP / 13 MP', '8000 mAh', 'Graphite'),
        ('Tab Nova 13 Pro', 'NovaTech', '499.00', None, 10, '13-inch 2K', '12 GB / 256 GB', '12 MP / 13 MP', '10000 mAh', 'Silver'),
        ('Pixel Slate 10', 'PixelView', '289.00', None, 13, '10.4-inch IPS', '6 GB / 128 GB', '8 MP / 8 MP', '7500 mAh', 'Sky Blue'),
        ('Pixel Slate 12 Keyboard Edition', 'PixelView', '569.00', '629.00', 7, '12.4-inch AMOLED', '8 GB / 256 GB', '12 MP / 12 MP', '9500 mAh', 'Charcoal'),
        ('Tab One Kids Edition', 'Wave', '219.00', None, 14, '10-inch IPS', '4 GB / 64 GB', '5 MP / 8 MP', '7000 mAh', 'Blue'),
        ('Tab One Study 10', 'Wave', '259.00', '299.00', 12, '10.5-inch IPS', '6 GB / 128 GB', '8 MP / 8 MP', '7800 mAh', 'Green'),
        ('Tab Ultra OLED 12', 'ZenCore', '649.00', '719.00', 6, '12-inch OLED 120Hz', '12 GB / 256 GB', '13 MP / 13 MP', '9800 mAh', 'Titan Gray'),
        ('Tab Ultra OLED 14', 'ZenCore', '799.00', None, 5, '14-inch OLED 120Hz', '16 GB / 512 GB', '13 MP / 16 MP', '11000 mAh', 'Black'),
        ('Nova Sketch Pad', 'NovaTech', '389.00', None, 9, '11-inch laminated IPS', '8 GB / 256 GB', '8 MP / 12 MP', '8400 mAh', 'Rose Gold'),
        ('Pixel Slate Mini', 'PixelView', '239.00', '269.00', 16, '8.7-inch IPS', '4 GB / 64 GB', '5 MP / 8 MP', '6400 mAh', 'Silver'),
    ],
}


def build_products():
    # Превращаем заготовки в единый список объектов для начального заполнения.
    products = []
    for category_slug, items in PRODUCT_BLUEPRINTS.items():
        gallery_pool = IMAGE_POOLS[category_slug]
        for index, item in enumerate(items):
            name, brand, price, old_price, stock, spec1, spec2, spec3, spec4, color = item
            gallery = [gallery_pool[(index + shift) % len(gallery_pool)] for shift in range(3)]

            if category_slug == 'smartphones':
                description = f'{name} gives the catalog a realistic flagship-to-midrange smartphone lineup with cleaner visuals and strong everyday specs.'
                specifications = [
                    ('Display', spec1),
                    ('Memory', spec2),
                    ('Camera', spec3),
                    ('Battery', spec4),
                    ('Color', color),
                ]
            elif category_slug == 'laptops':
                description = f'{name} balances study, office, and creator use so the laptop range feels closer to a real electronics store.'
                specifications = [
                    ('Screen', spec1),
                    ('Memory', spec2),
                    ('Storage', spec3),
                    ('Platform', spec4),
                    ('Color', color),
                ]
            elif category_slug == 'tv-audio':
                description = f'{name} adds living-room audio and display variety with stronger storefront depth and more believable product coverage.'
                specifications = [
                    ('Format', spec1),
                    ('Core spec', spec2),
                    ('Feature', spec3),
                    ('Extra', spec4),
                    ('Color', color),
                ]
            elif category_slug == 'home-appliances':
                description = f'{name} fills the home-appliance shelf with practical items so the catalog no longer looks like a small CRUD demo.'
                specifications = [
                    ('Main spec', spec1),
                    ('Power or battery', spec2),
                    ('Feature', spec3),
                    ('Extra', spec4),
                    ('Color', color),
                ]
            else:
                description = f'{name} rounds out the tablet range with study, entertainment, and premium options to keep the storefront balanced.'
                specifications = [
                    ('Display', spec1),
                    ('Memory', spec2),
                    ('Cameras', spec3),
                    ('Battery', spec4),
                    ('Color', color),
                ]

            products.append(
                {
                    'category': category_slug,
                    'name': name,
                    'brand': brand,
                    'price': Decimal(price),
                    'old_price': Decimal(old_price) if old_price else None,
                    'stock': stock,
                    'image': gallery[0],
                    'description': description,
                    'gallery': gallery,
                    'specifications': specifications,
                }
            )
    return products


def seed_catalog(apps, schema_editor):
    # Создаём категории, товары, gallery и specifications при первом наполнении каталога.
    Category = apps.get_model('products', 'Category')
    Product = apps.get_model('products', 'Product')
    ProductImage = apps.get_model('products', 'ProductImage')
    ProductSpecification = apps.get_model('products', 'ProductSpecification')

    categories = {}
    for name, slug in CATEGORY_DEFINITIONS:
        categories[slug], _ = Category.objects.get_or_create(name=name, slug=slug)

    for product_data in build_products():
        product, _ = Product.objects.get_or_create(
            name=product_data['name'],
            defaults={
                'category': categories[product_data['category']],
                'description': product_data['description'],
                'brand': product_data['brand'],
                'price': product_data['price'],
                'old_price': product_data['old_price'],
                'image': product_data['image'],
                'stock': product_data['stock'],
                'is_active': True,
            },
        )

        if product.gallery.count() == 0:
            for index, image_url in enumerate(product_data['gallery']):
                ProductImage.objects.create(
                    product=product,
                    image_url=image_url,
                    alt_text=product.name,
                    sort_order=index,
                )

        if product.specifications.count() == 0:
            for index, (name, value) in enumerate(product_data['specifications']):
                ProductSpecification.objects.create(
                    product=product,
                    name=name,
                    value=value,
                    sort_order=index,
                )


def rollback_catalog(apps, schema_editor):
    # Откат удаляет только те демонстрационные товары, которые созданы этой миграцией.
    Product = apps.get_model('products', 'Product')
    Product.objects.filter(name__in=[product['name'] for product in build_products()]).delete()


class Migration(migrations.Migration):
    # Миграция начального заполнения магазина товарами.

    dependencies = [
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_catalog, rollback_catalog),
    ]