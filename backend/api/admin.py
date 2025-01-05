from django.contrib import admin

from .models import CustomUser, LoanRequest, Interview

admin.site.register(CustomUser)
admin.site.register(LoanRequest)
admin.site.register(Interview)