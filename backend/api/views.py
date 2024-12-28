from django.http import JsonResponse

from rest_framework import generics
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import api_view, permission_classes

from .models import CustomUser
from .decorators import authentication
from .serializers import UserSerializer, MyTokenObtainPairSerializer, RegisterSerializer, ListUsersSerializer


class MyTokenObtainPairView(TokenObtainPairView):
  permission_classes = ()
  serializer_class = MyTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
	permission_classes = ()
	queryset = CustomUser.objects.all()
	serializer_class = RegisterSerializer


@api_view(['GET'])
@authentication
def get_profile(request):
	user = request.user
	serializer = UserSerializer(user)

	return JsonResponse(serializer.data)


@api_view(['POST'])
def logout(request):
	return JsonResponse({'message': 'logout successful'}, status=200)


@api_view(['PUT'])
@authentication
def update_profile(request):
	user = request.user
	serializer = UserSerializer(user, data=request.data, partial=True)

	if serializer.is_valid():
		serializer.save()

	return JsonResponse(serializer.data, safe=False)


def list_users(request):
	users = CustomUser.objects.all()
	serializer = ListUsersSerializer(users, many=True)

	return JsonResponse(serializer.data, safe=False)


@api_view(['DELETE'])
@authentication
def delete_user(request):
	user_id = request.user.id
	user = CustomUser.objects.get(id=user_id)
	user.delete()

	return JsonResponse({'message': 'user was deleted successfully'}, status=204)
