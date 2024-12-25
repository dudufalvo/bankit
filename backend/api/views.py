from rest_framework.decorators import api_view, permission_classes
from django.http import JsonResponse
from .models import CustomUser
from .serializers import UserSerializer, MyTokenObtainPairSerializer, RegisterSerializer, ListUsersSerializer
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView


class MyTokenObtainPairView(TokenObtainPairView):
    permission_classes = (AllowAny,)
    serializer_class = MyTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    serializer = UserSerializer(user)

    return JsonResponse(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def logout(request):
    return JsonResponse({'message': 'Logout successful'}, status=200)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    serializer = UserSerializer(user, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()

    return JsonResponse(serializer.data, safe=False)


@api_view(['GET'])
@permission_classes([AllowAny])
def list_users(request):
    users = CustomUser.objects.all()
    serializer = ListUsersSerializer(users, many=True)

    return JsonResponse(serializer.data, safe=False)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request):
    user_id = request.user.id
    user = CustomUser.objects.get(id=user_id)
    user.delete()

    return JsonResponse({'message': 'User was deleted successfully'}, status=204)
