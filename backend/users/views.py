from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile, WishlistItem
from .serializers import (
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
    ProfileSerializer,
    WishlistItemSerializer
)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access':  str(refresh.access_token),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        user   = serializer.save()
        tokens = get_tokens_for_user(user)
        return Response(
            {
                'token':   tokens['access'],
                'refresh': tokens['refresh'],
                'user':    UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED
        )

    return Response(
        {'message': serializer.errors},
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def login_view(request):
    serializer = LoginSerializer(data=request.data)

    if serializer.is_valid():
        user   = serializer.validated_data['user']
        tokens = get_tokens_for_user(user)
        return Response(
            {
                'token':   tokens['access'],
                'refresh': tokens['refresh'],
                'user':    UserSerializer(user).data,
            },
            status=status.HTTP_200_OK
        )

    return Response(
        {'message': serializer.errors},
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
    except Exception:
        pass
    return Response({'message': 'Выход выполнен успешно.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response(
        {'user': UserSerializer(request.user).data},
        status=status.HTTP_200_OK
    )

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

    serializer = ProfileSerializer(profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def wishlist_view(request):
    if request.method == 'GET':
        # select_related ускоряет запрос, подтягивая данные о товаре сразу
        items = WishlistItem.objects.filter(user=request.user).select_related('product')
        return Response(WishlistItemSerializer(items, many=True).data)

    product_id = request.data.get('product_id')
    if not product_id:
        return Response({'detail': 'product_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    item, created = WishlistItem.objects.get_or_create(
        user=request.user, product_id=product_id
    )
    if not created:
        return Response({'detail': 'Already in wishlist'}, status=status.HTTP_400_BAD_REQUEST)
    return Response(WishlistItemSerializer(item).data, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def wishlist_delete_view(request, product_id):
    WishlistItem.objects.filter(user=request.user, product_id=product_id).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)