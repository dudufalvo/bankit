import os
import tempfile

from django.http import JsonResponse
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import api_view, permission_classes

from .decorators import authentication, is_manager
from .models import CustomUser, LoanRequest, Interview
from .utils import search_face_in_dynamodb, upload_image_to_s3_and_dynamodb, get_presigned_url_from_s3_and_dynamodb, run_step_function_ccs, run_step_function_notify_decision
from .serializers import UserSerializer, MyTokenObtainPairSerializer, RegisterSerializer, LoanRequestSerializer, InterviewSerializer


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
	return JsonResponse({'message': 'logout successfully!'}, status=200)


@api_view(['PUT'])
@authentication
def update_profile(request):
	user = request.user
	serializer = UserSerializer(user, data=request.data, partial=True)

	if serializer.is_valid():
		serializer.save()

	return JsonResponse(serializer.data, safe=False)


@api_view(['POST'])
@authentication
def update_profile_image(request):
	try:
		image_file = request.data['image']
		email = request.user.email

		with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
			for chunk in image_file.chunks():
				tmp_file.write(chunk)
			tmp_file_path = tmp_file.name

		upload_image_to_s3_and_dynamodb(tmp_file_path, email)
		os.remove(tmp_file_path)

		return JsonResponse({'message': 'image uploaded and data stored successfully!'}, status=200)

	except Exception as e:
		return JsonResponse({'message': str(e)}, status=400)


@api_view(['GET'])
@authentication
def get_profile_image(request):
  try:
    email = request.user.email
    if not email:
      return JsonResponse({"error": "Email is required"}, status=400)

    presigned_url = get_presigned_url_from_s3_and_dynamodb(email)
    if isinstance(presigned_url, JsonResponse):
      return presigned_url

    return JsonResponse({ "presigned_url": presigned_url }, status=200)

  except Exception as e:
    return JsonResponse({"error": str(e)}, status=500)


@api_view(['GET'])
@authentication
def get_client_loan_requests(request):
  try:
    loan_requests = LoanRequest.objects.filter(requester=request.user)
    serializer = LoanRequestSerializer(loan_requests, many=True)

    return JsonResponse(serializer.data, safe=False, status=200)

  except Exception as e:
    return JsonResponse({"error": str(e)}, status=500)


@api_view(['POST'])
@authentication
def manager_final_decision(request):
  try:
    loan = LoanRequest.objects.filter(id=request.loan_id)
    loan.update(status=request.decision)

    user = loan.requester
    data = {
      "preferred_method_is_email": user.preferred_contact_method_is_email,
      "email": user.email,
      "phone_number": user.phone_number,
    }
    run_step_function_notify_decision

    return JsonResponse(status=200)

  except Exception as e:
    return JsonResponse({"error": str(e)}, status=500)


@api_view(['GET'])
@authentication
def get_client_interviews(request):
  try:
    user = request.user
    interviews = Interview.objects.filter(loan_request__requester=user)
    serializer = InterviewSerializer(interviews, many=True)

    return JsonResponse(serializer.data, safe=False, status=200)

  except Exception as e:
    return JsonResponse({"error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes((AllowAny, ))
def facial_authentication(request):
  image_file = request.data['image']

  with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
    for chunk in image_file.chunks():
      tmp_file.write(chunk)
    tmp_file_path = tmp_file.name

  face_found, person_full_name = search_face_in_dynamodb(tmp_file_path)
  os.remove(tmp_file_path)

  if face_found:
    return JsonResponse({'email': person_full_name}, status=200)
  else:
    return JsonResponse({'message': 'unauthorized! face not recognized'}, status=400)


@api_view(['POST'])
@permission_classes((AllowAny, ))
def loan_request(request):
  try:
    email = request.data['user']

    try:
      user = CustomUser.objects.get(email=email)
    except CustomUser.DoesNotExist:
      return JsonResponse({'error': 'User not found'}, status=404)

    manager_emails = CustomUser.objects.filter(is_manager=True).values_list('email', flat=True)

    payload_data = {
      "gross_monthly_income": request.data.get('gross_monthly_income', user.gross_monthly_income),
      "liquid_monthly_income": request.data.get('liquid_monthly_income', user.liquid_monthly_income),
      "household_income": request.data.get('household_income', user.household_income),
      "fixed_monthly_expenses": request.data.get('fixed_monthly_expenses', user.fixed_monthly_expenses),
      "savings_investments": request.data.get('savings_investments', user.savings_investments),
      "existing_debt_obligations": request.data.get('existing_debt_obligations', user.existing_debt_obligations),
      "number_current_loans": request.data.get('number_current_loans', user.number_current_loans),
      "number_of_dependents": request.data.get('number_of_dependents', user.number_of_dependents),
      "amount": request.data.get('amount'),
      "duration": request.data.get('duration'),
      "monthly_payment": request.data.get('monthly_payment'),
      "emails": list(manager_emails)
    }

    step_function_response = run_step_function_ccs(payload_data)

    if step_function_response['status'] != 200:
      return JsonResponse({'error': 'failed to calculate credit score', 'details': step_function_response}, status=500)

    LoanRequest.objects.create(
      requester=user,
      interest_rate=request.data['interest_rate'],
      amount=request.data['amount'],
      duration=request.data['duration'],
      monthly_payment=request.data['monthly_payment'],
      model_decision=step_function_response['decision'],
      status=LoanRequest.Status.WAITING,
    )

    user.gross_monthly_income = request.data.get('gross_monthly_income', user.gross_monthly_income)
    user.liquid_monthly_income = request.data.get('liquid_monthly_income', user.liquid_monthly_income)
    user.household_income = request.data.get('household_income', user.household_income)
    user.fixed_monthly_expenses = request.data.get('fixed_monthly_expenses', user.fixed_monthly_expenses)
    user.savings_investments = request.data.get('savings_investments', user.savings_investments)
    user.existing_debt_obligations = request.data.get('existing_debt_obligations', user.existing_debt_obligations)
    user.number_current_loans = request.data.get('number_current_loans', user.number_current_loans)
    user.number_of_dependents = request.data.get('number_of_dependents', user.number_of_dependents)
    user.save()

    return JsonResponse({'message': 'Loan request created and user updated successfully'}, status=201)

  except KeyError as e:
    return JsonResponse({'error': f'Missing key: {str(e)}'}, status=400)
  except Exception as e:
    return JsonResponse({'error': str(e)}, status=500)


@api_view(['GET'])
@is_manager
def get_loan_requests(request):
  try:
    status = request.GET.get('status', None)
    if status:
      loan_requests = LoanRequest.objects.filter(status=status)
    else:
      loan_requests = LoanRequest.objects.all()
    serializer = LoanRequestSerializer(loan_requests, many=True)

    return JsonResponse(serializer.data, safe=False, status=200)

  except Exception as e:
    return JsonResponse({"error": str(e)}, status=500)


@api_view(['GET'])
@is_manager
def get_loan_request(request, loan_id):
  try:
    loan_request = LoanRequest.objects.get(id=loan_id)
    serializer = LoanRequestSerializer(loan_request)

    return JsonResponse(serializer.data, safe=False, status=200)

  except LoanRequest.DoesNotExist:
    return JsonResponse({"error": "Loan request not found"}, status=404)
  except Exception as e:
    return JsonResponse({"error": str(e)}, status=500)


@api_view(['POST'])
@is_manager
def schedule_interview(request):
  try:
    manager_id = request.user.id
    loan_request_id = request.data['loan_id']
    date = request.data['date']
    initial_time = request.data['initial_time']
    end_time = request.data['end_time']

    loan_request = LoanRequest.objects.get(id=loan_request_id)

    interview = Interview.objects.create(
      manager_id=manager_id,
      loan_request=loan_request,
      date=date,
      initial_time=initial_time,
      end_time=end_time,
      ocurred=False
    )

    return JsonResponse({'message': 'Interview scheduled successfully', 'interview_id': interview.id}, status=201)

  except LoanRequest.DoesNotExist:
    return JsonResponse({"error": "Loan request not found"}, status=404)
  except KeyError as e:
    return JsonResponse({"error": f"Missing key: {e}"}, status=400)
  except Exception as e:
    return JsonResponse({"error": str(e)}, status=500)


@api_view(['GET'])
@is_manager
def get_interviews(request):
  try:
    manager = request.user

    interviews = Interview.objects.filter(manager=manager)
    serializer = InterviewSerializer(interviews, many=True)

    return JsonResponse(serializer.data, safe=False, status=200)

  except Exception as e:
    return JsonResponse({"error": str(e)}, status=500)
