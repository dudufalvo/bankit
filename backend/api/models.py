from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.


class CustomUser(AbstractUser):
    image = models.CharField(
        max_length=150,
        default='https://static.vecteezy.com/system/resources/previews/004/261/672/original/green-seedling-planted-in-box-spring-natural-decorative-design-element-colorful-seasonal-illustration-in-flat-cartoon-style-vector.jpg'
    )

    def __str__(self):
        return self.username
