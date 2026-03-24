from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from templates.models import JSON_Template, JSON_Version

User = get_user_model()


class JSONTemplateViewSetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="author", password="testpass123")
        self.client.force_authenticate(user=self.user)

    def test_create_template_sets_owner_to_request_user(self):
        url = reverse("templates-list")
        payload = {
            "name": "Test Template",
            "description": "A template for testing"
        }

        response = self.client.post(url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        template = JSON_Template.objects.get(name="Test Template")
        self.assertEqual(template.owner, self.user)

    def test_viewer_data_returns_empty_payload_when_no_versions_exist(self):
        template = JSON_Template.objects.create(
            name="Template A",
            owner=self.user
        )

        url = reverse("templates-viewer-data", args=[template.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], str(template.id))
        self.assertEqual(response.data["name"], "Template A")
        self.assertIsNone(response.data["versionLabel"])
        self.assertEqual(response.data["baseline"], {})
        self.assertEqual(response.data["draft"], {})

    def test_viewer_data_uses_parent_version_as_baseline(self):
        template = JSON_Template.objects.create(
            name="Template B",
            owner=self.user
        )

        parent = JSON_Version.objects.create(
            template=template,
            author=self.user,
            version_label="v1",
            json_content={"field": "baseline"}
        )

        JSON_Version.objects.create(
            template=template,
            author=self.user,
            version_label="v2",
            json_content={"field": "draft"},
            parent_version=parent
        )

        url = reverse("templates-viewer-data", args=[template.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["versionLabel"], "v2")
        self.assertEqual(response.data["baseline"], {"field": "baseline"})
        self.assertEqual(response.data["draft"], {"field": "draft"})

    def test_viewer_data_uses_second_newest_version_when_no_parent_exists(self):
        template = JSON_Template.objects.create(
            name="Template C",
            owner=self.user
        )

        JSON_Version.objects.create(
            template=template,
            author=self.user,
            version_label="v1",
            json_content={"field": "baseline"}
        )

        JSON_Version.objects.create(
            template=template,
            author=self.user,
            version_label="v2",
            json_content={"field": "draft"}
        )

        url = reverse("templates-viewer-data", args=[template.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["versionLabel"], "v2")
        self.assertEqual(response.data["baseline"], {"field": "baseline"})
        self.assertEqual(response.data["draft"], {"field": "draft"})