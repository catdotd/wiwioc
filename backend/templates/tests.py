from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from users.models import Role, Profile
from templates.models import JSON_Template, JSON_Version, Review_Request

class APIConnectivityTests(APITestCase):
    def setUp(self):
        # 1. Create Roles
        self.author_role = Role.objects.create(type='Author')
        self.reviewer_role = Role.objects.create(type='Reviewer')

        # 2. Create Users
        self.author_user = User.objects.create_user(username='author_test', password='password123')
        self.reviewer_user = User.objects.create_user(username='reviewer_test', password='password123')

        # 3. Assign Roles (Profiles are created via signals)
        self.author_user.profile.role = self.author_role
        self.author_user.profile.save()
        self.reviewer_user.profile.role = self.reviewer_role
        self.reviewer_user.profile.save()

        # 4. URLs
        self.token_url = reverse('token_obtain_pair')
        self.template_url = reverse('json_template-list')

    def test_jwt_authentication(self):
        """Test getting a JWT token."""
        response = self.client.post(self.token_url, {
            'username': 'author_test',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        return response.data['access']

    def test_rbac_template_creation(self):
        """Test that only authenticated users can create templates."""
        # Unauthenticated request
        response = self.client.post(self.template_url, {'name': 'Unauthorized Template'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Authenticated request
        token = self.test_jwt_authentication()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(self.template_url, {'name': 'Authorized Template'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_reviewer_workflow(self):
        """Test that only Reviewers can make decisions."""
        # Create a template and version first
        token = self.test_jwt_authentication()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        template = JSON_Template.objects.create(name="Test Template", owner=self.author_user)
        version = JSON_Version.objects.create(
            template=template, 
            author=self.author_user, 
            version_label="1.0", 
            json_content={"key": "val"}
        )
        
        # Create Review Request
        review_request = Review_Request.objects.create(version=version, requester=self.author_user)
        
        decision_url = reverse('review_decision-list')
        
        # 1. Try with Author (Should Fail 403)
        response = self.client.post(decision_url, {
            'review_request': review_request.id,
            'status': 'ACCEPTED'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # 2. Try with Reviewer (Should Succeed 201)
        reviewer_token = self.client.post(self.token_url, {
            'username': 'reviewer_test',
            'password': 'password123'
        }).data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {reviewer_token}')
        
        response = self.client.post(decision_url, {
            'review_request': review_request.id,
            'status': 'ACCEPTED'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # 3. Verify Version Status updated automatically
        version.refresh_from_db()
        self.assertEqual(version.status, 'APPROVED')
