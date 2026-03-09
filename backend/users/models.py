from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Role(models.Model):
    ADMIN = 'Admin'
    AUTHOR = 'Author'
    REVIEWER = 'Reviewer'
    
    ROLE_CHOICES = [
        (ADMIN, 'Admin'),
        (AUTHOR, 'Author'),
        (REVIEWER, 'Reviewer'),
    ]

    type = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        unique=True,
        help_text="The role type (Admin, Author, Reviewer)"
    )

    def __str__(self):
        return self.type

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s Profile ({self.role})"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
