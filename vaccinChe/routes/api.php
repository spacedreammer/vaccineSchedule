<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\HealthContentController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\ServiceCategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


// --- Public/Auth Routes (No 'auth:api' middleware here) ---
// The 'api' middleware group itself is usually applied globally to api.php by default.
// If you have 'middleware' => 'api' inside the group, you can leave it.
Route::group([
    // 'middleware' => 'api', // This might already be applied globally to api.php routes
    'prefix' => 'auth'
], function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    // For JWT-Auth, also add:
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']); // For refreshing tokens
    Route::get('/userProfile', [AuthController::class, 'userProfile']); // User's own profile, protected by auth:api below
});

// --- Public Access to Vaccine Categories (Accessible without authentication) ---
// THIS IS THE MISSING ROUTE ADDED TO RESOLVE THE NotFoundHttpException
Route::get('/vaccine-categories', [ServiceCategoryController::class, 'index']);

// --- Public Content (Accessible without authentication) ---
Route::get('/health-content', [HealthContentController::class, 'showAllPublicContent']);


// --- Authenticated & Role-Protected Routes ---
// Replace auth:sanctum with auth:api
Route::middleware('auth:api')->group(function () {
   
    Route::get('/auth/users/{id}', [AuthController::class, 'showUser']); // Get specific user by ID
    Route::put('/auth/updateUser/{id}', [AuthController::class, 'editUser']); // Update user profile
    Route::delete('/auth/deleteUser/{id}', [AuthController::class, 'deleteUser']); // Delete user

    // --- User (Patient) Module Routes ---
    Route::prefix('user')->group(function () {
        Route::post('/appointments', [AppointmentController::class, 'scheduleAppointment']);
        Route::get('/my-appointments', [AppointmentController::class, 'myAppointments']);
        Route::post('/feedback', [FeedbackController::class, 'store']);
        Route::get('/dashboard-stats', [DashboardController::class, 'getUserStats']);
        
        Route::get('/available-schedules', [ScheduleController::class, 'getAvailableSchedulesForUser']); // <--- ADD THIS LINE

    });

    // --- Admin/Health Officer Module Routes ---
    // For production, consider adding a custom middleware like 'role:admin,health_officer' here
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard-stats', [DashboardController::class, 'getHealthOfficerStats']);
        Route::get('/schedules', [ScheduleController::class, 'index']);
        Route::post('/schedules', [ScheduleController::class, 'store']);
        Route::put('/schedules/{schedule}', [ScheduleController::class, 'update']);
        Route::delete('/schedules/{schedule}', [ScheduleController::class, 'destroy']);

        Route::get('/pending-appointments', [AppointmentController::class, 'getPendingAppointments']);
        Route::put('/appointments/{appointment}/status', [AppointmentController::class, 'updateAppointmentStatus']);

        Route::get('/content', [HealthContentController::class, 'index']);
        Route::post('/content', [HealthContentController::class, 'store']);
        Route::post('/content/{contentItem}', [HealthContentController::class, 'update']); // Use POST with _method=PUT for files
        Route::delete('/content/{contentItem}', [HealthContentController::class, 'destroy']);

        Route::get('/monitor-trends', [DashboardController::class, 'getSystemAnalytics']);
    });

    // --- Service Provider Module Routes ---
    // For production, add a custom middleware like 'role:service_provider' here
    Route::prefix('provider')->group(function () {
        Route::get('/dashboard-stats', [DashboardController::class, 'getServiceProviderStats']);
        Route::get('/service-requests', [AppointmentController::class, 'getPendingAppointments']); // Can reuse
        Route::put('/service-requests/{appointment}/status', [AppointmentController::class, 'updateAppointmentStatus']); // Accept/Decline (reusing admin route)
        Route::get('/my-schedule', [ScheduleController::class, 'getProviderSchedules']);
        Route::put('/appointments/{appointment}/complete', [AppointmentController::class, 'markAppointmentAsCompleted']);
        Route::get('/my-feedback', [FeedbackController::class, 'myFeedback']);
    });

    // --- System Admin Module Routes ---
    // For production, add a custom middleware like 'role:admin' here
    Route::prefix('system-admin')->group(function () {
        Route::get('/dashboard-stats', [DashboardController::class, 'getSystemAdminStats']);
        // Route::get('/users', [UserController::class, 'index']); // Requires a UserController::index to list all users
        Route::get('/analytics', [DashboardController::class, 'getSystemAnalytics']);
        Route::get('/users', [UserController::class,'index']); 
        Route::get('/service-categories', [ServiceCategoryController::class, 'index']);
        Route::post('/service-categories', [ServiceCategoryController::class, 'store']);
        Route::put('/service-categories/{category}', [ServiceCategoryController::class, 'update']);
        Route::delete('/service-categories/{category}', [ServiceCategoryController::class, 'destroy']);
    });
});

// --- Public Content (Accessible without authentication) ---
Route::get('/health-content', [HealthContentController::class, 'showAllPublicContent']);
