from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from users.models import Role, Profile
from templates.models import JSON_Template, JSON_Version, Review_Request


class APIConnectivityTests(APITestCase):

    def setUp(self):
        # Roles
        self.author_role = Role.objects.create(type='Author')
        self.reviewer_role = Role.objects.create(type='Reviewer')

        # Users
        self.author_user = User.objects.create_user(
            username='author_test', password='password123'
        )
        self.reviewer_user = User.objects.create_user(
            username='reviewer_test', password='password123'
        )

        # Ensure profiles exist (avoid signal issues)
        Profile.objects.get_or_create(user=self.author_user)
        Profile.objects.get_or_create(user=self.reviewer_user)

        # Assign roles
        self.author_user.profile.role = self.author_role
        self.author_user.profile.save()

        self.reviewer_user.profile.role = self.reviewer_role
        self.reviewer_user.profile.save()

        # URLs
        self.token_url = reverse('token_obtain_pair')
        self.template_url = reverse('json_template-list')
        self.decision_url = reverse('review_decision-list')

    # ✅ Helper method (NOT a test)
    def get_token(self, username, password):
        response = self.client.post(self.token_url, {
            'username': username,
            'password': password
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data['access']

    def authenticate(self, username, password):
        token = self.get_token(username, password)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_jwt_authentication(self):
        response = self.client.post(self.token_url, {
            'username': 'author_test',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_rbac_template_creation(self):
        # Unauthenticated
        response = self.client.post(self.template_url, {'name': 'Unauthorized'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Authenticated
        self.authenticate('author_test', 'password123')
        response = self.client.post(self.template_url, {'name': 'Authorized'})
        print("\nDEBUG RBAC:", response.data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_reviewer_workflow(self):
        # Authenticate as author
        self.authenticate('author_test', 'password123')

        template = JSON_Template.objects.create(
            name="Test Template",
            owner=self.author_user
        )

        version = JSON_Version.objects.create(
            template=template,
            author=self.author_user,
            version_label="1.0",
            json_content={"key": "val"}
        )

        review_request = Review_Request.objects.create(
            version=version,
            requester=self.author_user
        )

        # ❌ Author should fail
        response = self.client.post(self.decision_url, {
            'review_request': review_request.id,
            'status': 'ACCEPTED'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # ✅ Switch to reviewer
        self.client.credentials()  # clear auth
        self.authenticate('reviewer_test', 'password123')

        response = self.client.post(self.decision_url, {
            'review_request': review_request.id,
            'status': 'ACCEPTED'
        })
        print("\nDEBUG workflow:", response.data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify status updated
        version.refresh_from_db()
        self.assertEqual(version.status, 'APPROVED')