from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

def get_user_from_jwt(request):
  jwt_authenticator = JWTAuthentication()

  try:
    user, _ = jwt_authenticator.authenticate(request)
    return user
  except AuthenticationFailed as e:
    raise AuthenticationFailed(str(e))