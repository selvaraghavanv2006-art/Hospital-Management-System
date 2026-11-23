from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework import status


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get("username", "")
    password = request.data.get("password", "")

    user = authenticate(
        username=username,
        password=password
    )

    if user is None or not user.is_active or not user.is_staff:
        return Response(
            {"error": "Invalid credentials or staff access denied"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    token, created = Token.objects.get_or_create(user=user)

    return Response({
        "token": token.key,
        "username": user.username,
        "is_staff": user.is_staff,
    })


@api_view(["POST"])
@permission_classes([IsAdminUser])
def logout_view(request):
    request.auth.delete()

    return Response({
        "message": "Logged out successfully"
    })
@api_view(["GET"])
@permission_classes([IsAdminUser])
def me_view(request):
    return Response({
        "username": request.user.username,
        "is_staff": request.user.is_staff,
    })