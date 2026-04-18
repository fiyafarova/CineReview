from decimal import Decimal

from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from users.models import UserProfile

from .models import Order, OrderStatus
from .serializers import (
    CheckoutPreviewSerializer,
    CheckoutSummarySerializer,
    OrderSerializer,
    OrderSummarySerializer,
)


class OrderViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Каждый пользователь видит только свои заказы.
        return Order.objects.filter(user=self.request.user).order_by('-createdAt')

    def perform_create(self, serializer):
        # user не берём с клиента.
        # Привязываем заказ к авторизованному пользователю из JWT.
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='checkout-preview')
    def checkout_preview(self, request):
        """
        Preview checkout нужен, чтобы frontend мог до оформления заказа показать:
        - subtotal
        - скидку
        - итоговую сумму
        - начисленные бонусы
        """
        input_serializer = CheckoutPreviewSerializer(
            data=request.data,
            context={'request': request},
        )
        input_serializer.is_valid(raise_exception=True)

        summary = input_serializer.get_summary()
        output_serializer = CheckoutSummarySerializer(summary)

        return Response(output_serializer.data)

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        """
        Отменять можно только новые заказы.

        При отмене заказа:
        - возвращаем пользователю бонусы, которые он потратил при оформлении
        - откатываем уже начисленные бонусы, если заказ ранее успел перейти в delivered
        - переводим заказ в cancelled
        """

        order = self.get_object()

        if order.status != OrderStatus.NEW:
            return Response(
                {'message': 'Only orders with status "new" can be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if order.user:
            profile, _ = UserProfile.objects.get_or_create(user=order.user)

            if order.spentBonus > 0:
                # Возвращаем ранее списанные бонусы, потому что заказ отменяется
                # и пользователь не должен их терять.
                profile.bonusBalance = (
                    profile.bonusBalance + order.spentBonus
                ).quantize(Decimal('0.01'))

            if order.bonusAwarded and order.earnedBonus > 0:
                # Если за заказ уже были начислены бонусы,
                # при отмене нужно убрать их обратно из профиля.
                profile.bonusBalance = max(
                    Decimal('0.00'),
                    (profile.bonusBalance - order.earnedBonus).quantize(Decimal('0.01')),
                )
                order.bonusAwarded = False

            profile.save(update_fields=['bonusBalance'])

        order.status = OrderStatus.CANCELLED
        order.save(update_fields=['status', 'bonusAwarded'])

        return Response(self.get_serializer(order).data)

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        """
        Короткая сводка по заказам пользователя.
        При желании cancelled можно исключать из totalSpent,
        чтобы отменённые заказы не считались как реальные траты.
        """
        queryset = self.get_queryset().exclude(status=OrderStatus.CANCELLED)

        total_spent = sum((order.total for order in queryset), Decimal('0.00'))

        serializer = OrderSummarySerializer({
            'ordersCount': queryset.count(),
            'totalSpent': float(total_spent),
        })
        return Response(serializer.data)
