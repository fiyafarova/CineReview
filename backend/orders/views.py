from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Order


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])  # JWT токен
def orders_list(request):

    if request.method == 'GET':
        orders = Order.objects.filter(user=request.user).order_by('-createdAt')
        data = [
            {
                'id': order.id,
                'customerName': order.customerName,
                'customerAddress': order.customerAddress,
                'customerPhone': order.customerPhone,
                'items': order.items,
                'total': float(order.total),
                'createdAt': order.createdAt.isoformat(),
            }
            for order in orders
        ]
        return Response(data)

    if request.method == 'POST':
        body = request.data

        order = Order.objects.create(
            user=request.user,
            customerName=body['customerName'],
            customerAddress=body['customerAddress'],
            customerPhone=body['customerPhone'],
            items=body['items'],
            total=body['total'],
        )

        return Response(
            {
                'id': order.id,
                'customerName': order.customerName,
                'customerAddress': order.customerAddress,
                'customerPhone': order.customerPhone,
                'items': order.items,
                'total': float(order.total),
                'createdAt': order.createdAt.isoformat(),
            },
            status=status.HTTP_201_CREATED
        )