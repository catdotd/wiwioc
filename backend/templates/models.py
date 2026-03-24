import uuid
from django.db import models
from django.contrib.auth.models import User

class JSON_Template(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='templates')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "JSON Template"
        verbose_name_plural = "JSON Templates"

class JSON_Version(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PENDING', 'Pending Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template = models.ForeignKey(JSON_Template, on_delete=models.CASCADE, related_name='versions')
    parent_version = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='child_versions')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='authored_versions')
    version_label = models.CharField(max_length=50)
    json_content = models.JSONField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='DRAFT')
    
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.template.name} - {self.version_label} ({self.status})"

    class Meta:
        verbose_name = "JSON Version"
        verbose_name_plural = "JSON Versions"

class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    version = models.ForeignKey(JSON_Version, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    parent_comment = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.author.username} on {self.version.version_label}"

    class Meta:
        verbose_name = "Comment"
        verbose_name_plural = "Comments"
        ordering = ['created_at']

class Review_Request(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    version = models.ForeignKey(JSON_Version, on_delete=models.CASCADE, related_name='review_requests')
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='review_requests')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review Request for {self.version} by {self.requester.username}"

    class Meta:
        verbose_name = "Review Request"
        verbose_name_plural = "Review Requests"

class Review_Decision(models.Model):
    STATUS_CHOICES = [
        ('ACKNOWLEDGED', 'Acknowledged'),
        ('ACCEPTED', 'Accepted'),
        ('DECLINED', 'Declined'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    review_request = models.ForeignKey(Review_Request, on_delete=models.CASCADE, related_name='decisions')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_decisions')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    decided_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Decision: {self.status} on {self.review_request.version}"

    def save(self, *args, **kwargs):
        # Business Logic: Automatically update the Version status based on this decision
        version = self.review_request.version
        from django.utils import timezone
        
        if self.status == 'ACCEPTED':
            version.status = 'APPROVED'
            version.approved_at = timezone.now()
        elif self.status == 'DECLINED':
            version.status = 'REJECTED'
            version.rejected_at = timezone.now()
        
        version.save()
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Review Decision"
        verbose_name_plural = "Review Decisions"
