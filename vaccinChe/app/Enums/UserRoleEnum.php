<?php

namespace App\Enums;

enum UserRoleEnum: string
{
    case Patient = 'patient';
    case Admin = 'admin';
    case HealthOfficer = 'health_officer';
    case ServiceProvider = 'service_provider';
}