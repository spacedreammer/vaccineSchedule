<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public Auth Routes (accessible without a token)
Route::group([
    'middleware' => 'api', // Standard API middleware, no authentication guard here
    'prefix' => 'auth'
], function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    // Logout typically doesn't strictly require a valid token, as it just invalidates client-side data
    Route::post('/logout', [AuthController::class, 'logout']);
});


// Authenticated Auth Routes (require a valid JWT token)
Route::group([
    'middleware' => ['auth:api'], 
    'prefix' => 'auth'
], function () {
    Route::get("/userProfile", [AuthController::class, 'userProfile']);
    // Removed duplicate /healthOff
    Route::get("/healthOff", [AuthController::class, 'listHelthOff']);
    Route::get("/serveiceProvider", [AuthController::class, 'listServeceProvider']);
    Route::put("/updateUser/{id}", [AuthController::class, 'editUser']);
    Route::delete("/deleteUser/{id}", [AuthController::class, 'deleteUser']);
    Route::get("/showUser/{id}", [AuthController::class, 'showUser']);
    Route::get("/listPatients", [AuthController::class, 'listPatients']);
});



Route::group([
    'middleware' => ['auth:api'], 
    'prefix' => 'appointments'
], function () {
    Route::post('/schedule', [AppointmentController::class, 'schedule']);
    Route::get('/my', [AppointmentController::class, 'myAppointments']);
    Route::get('/{id}', [AppointmentController::class, 'show']);
    Route::put('/{id}', [AppointmentController::class, 'update']);
    Route::delete('/{id}', [AppointmentController::class, 'destroy']);
});



// Route::group([

//     'middleware' => 'api',
//     'prefix' => 'auth'

// ], function () {

//     Route::post('/login', [AuthController::class, 'login']);
//     Route::post('/register', [AuthController::class, 'register']);

//     Route::get("/userProfile", [AuthController::class, 'userProfile']);
//     Route::get("/healthOff", [AuthController::class, 'listHelthOff']);
//     Route::get("/serveiceProvider", [AuthController::class, 'listServeceProvider']);
//     Route::get("/healthOff", [AuthController::class, 'listHelthOff']);
//     Route::put("/updateUser/{id}", [AuthController::class, 'editUser']);
//     Route::delete("/deleteUser/{id}", [AuthController::class, 'deleteUser']);
//     Route::get("/showUser/{id}", [AuthController::class, 'showUser']);
//     Route::get("/listPatients", [AuthController::class, 'listPatients']);
// });


