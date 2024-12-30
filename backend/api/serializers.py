from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import CustomUser, LoanRequest, Interview


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
	@classmethod
	def get_token(cls, user):
		token = super().get_token(user)

		return token


class RegisterSerializer(serializers.ModelSerializer):
	password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
	password2 = serializers.CharField(write_only=True, required=True)
	email = serializers.EmailField(required=True, validators=[UniqueValidator(queryset=CustomUser.objects.all())])

	class Meta:
		model = CustomUser
		fields = ('first_name',
							'last_name',
							'username',
							'email',
							'password',
							'password2',
							'phone_number',
							'preferred_contact_method_is_email')

	def validate(self, attrs):
		if attrs['password'] != attrs['password2']:
			raise serializers.ValidationError({"password": "password fields didn't match"})

		return attrs

	def create(self, validated_data):
		user = CustomUser.objects.create(
			first_name=validated_data['first_name'],
			last_name=validated_data['last_name'],
			username=validated_data['username'],
			email=validated_data['email'],
			phone_number=validated_data['phone_number'],
			preferred_contact_method_is_email=validated_data['preferred_contact_method_is_email']
		)

		user.set_password(validated_data['password'])
		user.save()

		return user


class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = CustomUser
		fields = ['first_name', 'last_name', 'username', 'email', 'is_manager']


class ListUsersSerializer(serializers.ModelSerializer):
	class Meta:
		model = CustomUser
		fields = '__all__'


class LoanRequestSerializer(serializers.ModelSerializer):
	requester = serializers.EmailField(source='requester.email')
	manager = serializers.SerializerMethodField()
	credit_score = serializers.FloatField(source='requester.credit_score')
	model_decision = serializers.CharField(source='get_model_decision_display')
	status = serializers.CharField(source='get_status_display')
	class Meta:
		model = LoanRequest
		fields = ['id', 'requester', 'interest_rate', 'amount', 'duration', 'monthly_payment', 'model_decision', 'status', 'credit_score', 'manager']

	def get_manager(self, obj):
		try:
			interview = Interview.objects.get(loan_request=obj)
			return interview.manager.email
		except Interview.DoesNotExist:
			return '-'


class InterviewSerializer(serializers.ModelSerializer):
	loan_request = serializers.IntegerField(source='loan_request.id')
	requester = serializers.EmailField(source='loan_request.requester.email')
	manager = serializers.EmailField(source='manager.email')
	model_decision = serializers.CharField(source='loan_request.get_model_decision_display')

	class Meta:
		model = Interview
		fields = ['id', 'loan_request', 'requester', 'manager', 'date', 'initial_time', 'end_time', 'model_decision', 'ocurred']
