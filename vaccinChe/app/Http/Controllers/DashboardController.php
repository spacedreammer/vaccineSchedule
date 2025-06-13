<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Schedule;
use App\Models\Feedback;
use App\Models\HealthContent;
use App\Models\User;
use App\Models\Vaccine_categories;
use App\Models\VaccineCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Enums\UserRoleEnum; 

class DashboardController extends Controller
{
    // Helper to check user role (for more complex apps, use Gates/Policies)
    private function authorizeRole($allowedRoles) {
        $user = Auth::user();

        // If for some reason user is null (should be caught by middleware)
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Get the string value of the user's role
        // The role attribute is cast to a UserRoleEnum object in the User model.
        // We need to access its 'value' property to get the string representation.
        // Also ensure $user->role is not null before attempting to access ->value
        $userRoleString = $user->role instanceof UserRoleEnum ? $user->role->value : (string) $user->role;

        if (!in_array($userRoleString, $allowedRoles)) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }
        return null; // No error, proceed
    }


    // User/Patient Dashboard Stats (if needed for a quick overview on their dashboard)
    public function getUserStats(Request $request)
    {
        $user = $request->user(); // Get authenticated user

        $pendingAppointments = $user->appointments()->where('status', 'pending')->count();
        $completedAppointments = $user->appointments()->where('status', 'completed')->count();
        $totalFeedbackGiven = $user->feedbacksGiven()->count();

        return response()->json([
            'pendingAppointments' => $pendingAppointments,
            'completedAppointments' => $completedAppointments,
            'totalFeedbackGiven' => $totalFeedbackGiven,
        ]);
    }


    // Admin/Health Officer Dashboard Stats
    public function getHealthOfficerStats()
    {
        // Simple authorization check for demo. Use middleware/policy for production.
        $authCheck = $this->authorizeRole(['health_officer', 'admin']);
        if ($authCheck) return $authCheck;

        $pendingAppointments = Appointment::where('status', 'pending')->count();
        $totalVaccinations = Appointment::where('status', 'completed')->count();
        $activeSchedules = Schedule::where('status', 'active')
                                    ->whereDate('date', '>=', now()->toDateString())
                                    ->count();
        $newFeedbacks = Feedback::where('created_at', '>=', now()->subDays(7))->count();

        return response()->json([
            'pendingAppointments' => $pendingAppointments,
            'totalVaccinations' => $totalVaccinations,
            'activeSchedules' => $activeSchedules,
            'newFeedbacks' => $newFeedbacks,
        ]);
    }

    // Service Provider Dashboard Stats
    public function getServiceProviderStats(Request $request)
    {
        $authCheck = $this->authorizeRole(['service_provider', 'admin']);
        if ($authCheck) return $authCheck;

        $providerId = $request->user()->id; // Get the ID of the authenticated provider

        $pendingRequests = Appointment::where('provider_id', $providerId)
                                      ->where('status', 'pending')
                                      ->count();
        $completedServicesToday = Appointment::where('provider_id', $providerId)
                                             ->where('status', 'completed')
                                             ->whereDate('updated_at', now()->toDateString())
                                             ->count();
        $upcomingAppointments = Appointment::where('provider_id', $providerId)
                                          ->where('status', 'approved')
                                          ->whereDate('preferred_date', '>=', now()->toDateString())
                                          ->count();

        // Calculate average rating for this provider
        $averageRating = Feedback::where('provider_id', $providerId)->avg('rating');

        return response()->json([
            'pendingRequests' => $pendingRequests,
            'completedServicesToday' => $completedServicesToday,
            'upcomingAppointments' => $upcomingAppointments,
            'averageRating' => round($averageRating ?? 0, 2), // Round to 2 decimal places
        ]);
    }


    // System Admin Dashboard Stats
    public function getSystemAdminStats()
    {
        $authCheck = $this->authorizeRole(['admin']);
        if ($authCheck) return $authCheck;

        $totalUsers = User::count();
        $totalServiceProviders = User::where('role', 'service_provider')->count();
        $totalAppointments = Appointment::count();
        $activeServiceCategories = Vaccine_categories::where('is_active', true)->count();

        return response()->json([
            'totalUsers' => $totalUsers,
            'totalServiceProviders' => $totalServiceProviders,
            'totalAppointments' => $totalAppointments,
            'activeServiceCategories' => $activeServiceCategories,
        ]);
    }

    // System Admin Analytics Data (for charts etc.)
    public function getSystemAnalytics()
    {
        $authCheck = $this->authorizeRole(['admin']);
        if ($authCheck) return $authCheck;

        // Example: User registration growth (past 12 months)
        $userGrowth = User::selectRaw("strftime('%Y-%m', created_at) as month, count(*) as count")
                          ->groupBy('month')
                          ->orderBy('month')
                          ->get();

        // Example: Appointment status breakdown
        $appointmentStatusCounts = Appointment::select('status', DB::raw('count(*) as count'))
                                              ->groupBy('status')
                                              ->pluck('count', 'status');

        return response()->json([
            'userGrowth' => $userGrowth,
            'appointmentStatusCounts' => $appointmentStatusCounts,
            'totalRequests' => Appointment::count(), // Example KPI
            'avgApprovalTime' => 'N/A (needs logic)', // Placeholder
        ]);
    }
}