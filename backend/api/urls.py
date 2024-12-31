from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path
from . import views


urlpatterns = [
  path('client/login', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
  path('client/logout', views.logout),
  path('client/refresh', TokenRefreshView.as_view(), name='token_refresh'),
  path('client/register', views.RegisterView.as_view(), name='auth_register'),

  path('client', views.get_profile, name='profile'),
  path('client/get-image', views.get_profile_image, name='get_profile_image'),
  path('client/update', views.update_profile, name='update_update_profile'),
  path('client/update-image', views.update_profile_image, name='update_profile_image'),
  path('client/list-loan-requests', views.get_client_loan_requests, name='get_client_loan_requests'),
  path('client/list-interviews', views.get_client_interviews, name='get_client_interviews'),

  path('facial-authentication', views.facial_authentication, name='facial_authentication'),
  path('create-loan-request', views.loan_request, name='create_loan_request'),

  path('manager/list-loan-requests', views.get_loan_requests, name='get_loan_requests'),
  path('manager/list-loan-requests/<int:loan_id>', views.get_loan_request, name='get_loan_request'),
  path('manager/schedule-interview', views.schedule_interview, name='schedule_interview'),
  path('manager/list-interviews', views.get_interviews, name='get_interviews'),
  path('manager/loan-decision', views.manager_final_decision, name='manager_final_decision')
]
