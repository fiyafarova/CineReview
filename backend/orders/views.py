import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import Order


@csrf_exempt
def orders_list(request):
    if request.method == 'GET':
        orders = Order.objects.all().order_by('-createdAt')
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
        return JsonResponse(data, safe=False)

    if request.method == 'POST':
        body = json.loads(request.body)

        order = Order.objects.create(
            customerName=body['customerName'],
            customerAddress=body['customerAddress'],
            customerPhone=body['customerPhone'],
            items=body['items'],
            total=body['total'],
        )

        data = {
            'id': order.id,
            'customerName': order.customerName,
            'customerAddress': order.customerAddress,
            'customerPhone': order.customerPhone,
            'items': order.items,
            'total': float(order.total),
            'createdAt': order.createdAt.isoformat(),
        }
        return JsonResponse(data, status=201)

    return JsonResponse({'error': 'Method not allowed'}, status=405)
