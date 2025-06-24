<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\User; // To eager load health officer info
use App\Models\VaccineCategory; // To link schedules to vaccine types
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class ScheduleController extends Controller
{
    // Helper method to authorize roles
    private function authorizeRole(array $roles)
    {
        if (!Auth::check() || !in_array(Auth::user()->role, $roles)) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }
        return null;
    }
    // Admin/Health Officer: List all schedules
    public function index()
    {
        // Simple auth check. Use middleware/policy for production.
        if (Auth::check() && Auth::user()->role !== 'health_officer' && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        $schedules = Schedule::with('healthOfficer', 'vaccineCategory')->get();
        return response()->json($schedules);
    }

    // Admin/Health Officer: Create a new schedule
    public function store(Request $request)
    {
        // Simple auth check. Use middleware/policy for production.
        if (Auth::check() && Auth::user()->role !== 'health_officer' && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        try {
            $validatedData = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'date' => 'required|date|after_or_equal:today',
                'time' => 'required|date_format:H:i',
                'location' => 'required|string|max:255',
                'capacity' => 'required|integer|min:1',
                'vaccine_category_id' => 'nullable|exists:vaccine_categories,id',
            ]);

            $schedule = Schedule::create([
                'health_officer_id' => Auth::id(), // Assign current health officer
                'title' => $validatedData['title'],
                'description' => $validatedData['description'],
                'date' => $validatedData['date'],
                'time' => $validatedData['time'],
                'location' => $validatedData['location'],
                'capacity' => $validatedData['capacity'],
                'vaccine_category_id' => $validatedData['vaccine_category_id'] ?? null,
                'status' => 'active', // Default status
            ]);

            return response()->json(['message' => 'Schedule created successfully', 'schedule' => $schedule], 201);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation Error', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create schedule', 'error' => $e->getMessage()], 500);
        }
    }

    // Admin/Health Officer: Update an existing schedule
    public function update(Request $request, Schedule $schedule)
    {
        // Simple auth check. Use middleware/policy for production.
        if (Auth::check() && Auth::user()->role !== 'health_officer' && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        // Optional: Only allow the health officer who created it to edit, or admin
        if ($schedule->health_officer_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized to update this schedule'], 403);
        }

        try {
            $validatedData = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'date' => 'sometimes|required|date|after_or_equal:today',
                'time' => 'sometimes|required|date_format:H:i',
                'location' => 'sometimes|required|string|max:255',
                'capacity' => 'sometimes|required|integer|min:1|gte:booked_slots', // Capacity can't be less than booked
                'vaccine_category_id' => 'nullable|exists:vaccine_categories,id',
                'status' => 'sometimes|required|string|in:active,full,cancelled',
            ]);

            $schedule->update($validatedData);

            return response()->json(['message' => 'Schedule updated successfully', 'schedule' => $schedule]);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation Error', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update schedule', 'error' => $e->getMessage()], 500);
        }
    }

    public function getAvailableSchedulesForUser(Request $request)
    {
        // Optional: Authorize only 'patient' role if this endpoint should be strictly for patients
        // $authCheck = $this->authorizeRole(['patient']);
        // if ($authCheck) return $authCheck;

        // Fetch schedules that are 'active' and in the future,
        // and have available slots (booked_slots < capacity).
        $availableSchedules = Schedule::where('status', 'active')
                                    ->whereDate('date', '>=', now()->toDateString()) // Future or today's schedules
                                    ->whereColumn('booked_slots', '<', 'capacity') // Still has capacity
                                    ->with('healthOfficer', 'vaccineCategory') // Eager load related data for frontend display
                                    ->orderBy('date')
                                    ->orderBy('time')
                                    ->get();

        return response()->json($availableSchedules);
    }

    // Admin/Health Officer: Delete a schedule
    public function destroy(Schedule $schedule)
    {
        // Simple auth check. Use middleware/policy for production.
        if (Auth::check() && Auth::user()->role !== 'health_officer' && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        // Optional: Only allow the health officer who created it to delete, or admin
        if ($schedule->health_officer_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized to delete this schedule'], 403);
        }

        try {
            $schedule->delete(); // This will also cascade delete associated appointments

            return response()->json(['message' => 'Schedule deleted successfully'], 204);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete schedule', 'error' => $e->getMessage()], 500);
        }
    }

    // Service Provider Module: List schedules assigned to provider (if schedules are assigned)
    // Or schedules they can pick appointments from
    public function getProviderSchedules(Request $request)
    {
        $authCheck = $this->authorizeRole(['service_provider', 'admin']);
        if ($authCheck) return $authCheck;

        // This could be schedules where they are assigned, or all active schedules they can choose from
        $schedules = Schedule::where('status', 'active')
                             ->whereDate('date', '>=', now()->toDateString())
                             ->with('healthOfficer', 'vaccineCategory')
                             ->get();
        return response()->json($schedules);
    }
}