from django.http import JsonResponse
from rest_framework.exceptions import AuthenticationFailed

from .utils import get_user_from_jwt


def authentication(function):
  def wrap(request, *args, **kwargs):
    try:
      user = get_user_from_jwt(request)
      
      if user:
        return function(request, *args, **kwargs)
      else:
        response = JsonResponse({"detail": "Authentication credentials were not provided."}, status=401)
        return response
    except AuthenticationFailed as e:
      return JsonResponse({'error': str(e)}, status=401)
  return wrap


def is_manager(function):
  def wrap(request, *args, **kwargs):
    try:
      user = get_user_from_jwt(request)
      
      if user and user.is_manager:
        return function(request, *args, **kwargs)
      else:
        response = JsonResponse({"detail": "Authentication credentials were not provided."}, status=401)
        return response
    except AuthenticationFailed as e:
      return JsonResponse({'error': str(e)}, status=401)
  return wrap
