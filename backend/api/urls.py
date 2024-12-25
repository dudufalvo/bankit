from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path
from . import views

urlpatterns = [
    path('client/login', views.MyTokenObtainPairView.as_view(),
         name='token_obtain_pair'),
    path('client/logout', views.logout),
    path('client/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('client/register', views.RegisterView.as_view(), name='auth_register'),

    path('client', views.get_profile, name='profile'),
    path('client/update', views.update_profile, name='update-profile'),

    path('users', views.list_users, name='users'),
    path('users/<str:pk>', views.delete_user, name='delete-user'),
]
