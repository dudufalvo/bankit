from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
	is_manager = models.BooleanField(default=False)
	phone_number = models.IntegerField(default=0)
	preferred_contact_method_is_email = models.BooleanField(default=True)
	credit_score =  models.FloatField(default=0)
	gross_monthly_income = models.FloatField(default=0)
	liquid_monthly_income = models.FloatField(default=0)
	household_income = models.FloatField(default=0)
	fixed_monthly_expenses = models.FloatField(default=0)
	savings_investments = models.FloatField(default=0)
	existing_debt_obligations = models.FloatField(default=0)
	number_current_loans = models.FloatField(default=0)
	number_of_dependents = models.FloatField(default=0)

	def __str__(self):
		return self.username


class LoanRequest(models.Model):
	class Status(models.IntegerChoices):
		WAITING = 0, 'waiting'
		DENIED = 1, 'deny'
		INTERVIEW = 2, 'interview'
		ACCEPTED = 3, 'accept'

	id = models.AutoField(primary_key=True)
	requester = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
	interest_rate = models.IntegerField()
	amount = models.FloatField()
	duration = models.IntegerField()
	monthly_payment = models.FloatField()
	model_decision = models.IntegerField(choices=Status.choices, default=Status.WAITING)
	status = models.IntegerField(choices=Status.choices, default=Status.WAITING)

	def __str__(self):
		return f"{self.id} - {self.requester} - {self.get_status_display()}"


class Interview(models.Model):
	id = models.AutoField(primary_key=True)
	manager = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
	loan_request = models.ForeignKey(LoanRequest, on_delete=models.CASCADE)
	date = models.DateField()
	initial_time = models.TimeField()
	end_time = models.TimeField()
	ocurred = models.BooleanField(default=False)

	def __str__(self):
		return f"{self.id} - {self.loan_request} - {self.manager} - {self.ocurred}"