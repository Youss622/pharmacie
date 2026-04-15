from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Administrateur'),
        ('PHARMACIST', 'Pharmacien'),
        ('GUEST', 'Invité'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='GUEST')

    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"
