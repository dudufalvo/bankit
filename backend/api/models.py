from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.


class CustomUser(AbstractUser):
	image = models.CharField(
    max_length=150,
		default='https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn.pixabay.com%2Fphoto%2F2016%2F08%2F08%2F09%2F17%2Favatar-1577909_1280.png&f=1&nofb=1&ipt=03414dac429376425728ba68a9ffdbe2a6a279a3d6d86f7f8455f9a5bb24ac25&ipo=images'
	)
	is_manager = models.BooleanField(default=False)

	def __str__(self):
		return self.username
