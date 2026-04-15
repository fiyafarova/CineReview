#st
from django.conf import settings
from django.db import migrations


# Демонстрационные пользователи для массового наполнения каталога отзывами.
REVIEWERS = [
    ('catalog_demo_1', 'catalog_demo_1@example.com'),
    ('catalog_demo_2', 'catalog_demo_2@example.com'),
    ('catalog_demo_3', 'catalog_demo_3@example.com'),
]


# Набор типовых комментариев для автоматически добавленных отзывов.
COMMENTS = [
    'Looks much more complete now. The product page feels closer to a real online store.',
    'Good value for the price and the specifications section is useful.',
    'The gallery and card presentation make this item look much more polished.',
    'One of the stronger items in the catalog. Clean details and realistic product info.',
    'Solid product entry. This helps the storefront feel less like a demo and more like a shop.',
]


def seed_reviews(apps, schema_editor):
    # Распределяем отзывы по каталогу, чтобы страница товара не выглядела пустой.
    Product = apps.get_model('products', 'Product')
    Review = apps.get_model('products', 'Review')
    User = apps.get_model(*settings.AUTH_USER_MODEL.split('.'))

    users = []
    for username, email in REVIEWERS:
      user, _ = User.objects.get_or_create(username=username, defaults={'email': email})
      if hasattr(user, 'set_password'):
          user.set_password('catalog_demo_123')
          user.save(update_fields=['password'])
      users.append(user)

    products = list(Product.objects.order_by('id'))
    for index, product in enumerate(products):
        target_reviews = 1 + (index % 2)
        for review_index in range(target_reviews):
            reviewer = users[(index + review_index) % len(users)]
            if Review.objects.filter(user=reviewer, product=product).exists():
                continue

            rating = 4 if (index + review_index) % 3 else 5
            comment = COMMENTS[(index + review_index) % len(COMMENTS)]
            Review.objects.create(
                user=reviewer,
                product=product,
                rating=rating,
                comment=comment,
            )


def rollback_reviews(apps, schema_editor):
    # При откате удаляем только добавленные отзывы и созданных демонстрационных пользователей.
    Review = apps.get_model('products', 'Review')
    User = apps.get_model(*settings.AUTH_USER_MODEL.split('.'))

    Review.objects.filter(user__username__in=[username for username, _ in REVIEWERS]).delete()
    User.objects.filter(username__in=[username for username, _ in REVIEWERS]).delete()


class Migration(migrations.Migration):
    # Финальная миграция заполнения каталога отзывами.

    dependencies = [
        ('products', '0003_expand_catalog_diversity'),
    ]

    operations = [
        migrations.RunPython(seed_reviews, rollback_reviews),
    ]