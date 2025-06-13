<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Schedule; // To potentially update booked slots
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AppointmentController extends Controller
{
    // User Module: Schedule a new appointment
    public function scheduleAppointment(Request $request)
    {
        try {
            $user = $request->user(); // Authenticated patient/user

            $validatedData = $request->validate([
                'child_name' => 'nullable|string|max:255',
                'vaccine_type' => 'nullable|string|max:255', // If not directly tied to a schedule's vaccine_category
                'preferred_date' => 'required|date|after_or_equal:today',
                'preferred_time' => 'required|date_format:H:i',
                'notes' => 'nullable|string',
                'schedule_id' => 'nullable|exists:schedules,id', // Can be linked to a specific schedule slot
            ]);

            // If schedule_id is provided, check capacity
            if (isset($validatedData['schedule_id'])) {
                $schedule = Schedule::find($validatedData['schedule_id']);
                if ($schedule && $schedule->booked_slots >= $schedule->capacity) {
                    return response()->json(['message' => 'The selected schedule slot is full.'], 400);
                }
            }

            $appointment = $user->appointments()->create([
                'child_name' => $validatedData['child_name'] ?? null,
                'vaccine_type' => $validatedData['vaccine_type'] ?? null,
                'preferred_date' => $validatedData['preferred_date'],
                'preferred_time' => $validatedData['preferred_time'],
                'notes' => $validatedData['notes'] ?? null,
                'schedule_id' => $validatedData['schedule_id'] ?? null,
                'status' => 'pending', // Default status upon creation
            ]);

            // If linked to a schedule, increment booked slots
            if (isset($validatedData['schedule_id']) && $schedule) {
                $schedule->increment('booked_slots');
                if ($schedule->booked_slots >= $schedule->capacity) {
                    $schedule->update(['status' => 'full']);
                }
            }

            return response()->json([
                'message' => 'Appointment scheduled successfully. Awaiting approval.',
                'appointment' => $appointment,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation Error', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to schedule appointment', 'error' => $e->getMessage()], 500);
        }
    }

    // User Module: View user's own appointments
    public function myAppointments(Request $request)
    {
        $appointments = $request->user()->appointments()->get();
        // Eager load related models if needed for frontend display (e.g., provider name, schedule details)
        // $appointments = $request->user()->appointments()->with(['schedule', 'provider'])->get();

        return response()->json($appointments);
    }

    // Admin/Health Officer Module: List pending appointments for approval
    public function getPendingAppointments()
    {
        // Simple auth check. Use middleware/policy for production.
        if (Auth::check() && Auth::user()->role !== 'health_officer' && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        $pendingAppointments = Appointment::where('status', 'pending')
                                        ->with('user') // Eager load user to display their name
                                        ->get();

        return response()->json($pendingAppointments);
    }

    // Admin/Health Officer Module: Approve or Reject an appointment
    public function updateAppointmentStatus(Request $request, Appointment $appointment)
    {
        // Simple auth check. Use middleware/policy for production.
        if (Auth::check() && Auth::user()->role !== 'health_officer' && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        try {
            $validated = $request->validate([
                'status' => 'required|string|in:approved,rejected,cancelled', // Admin/HO can set these
            ]);

            $appointment->update(['status' => $validated['status']]);

            // If an appointment is approved, assign a provider? (optional logic here)
            // If an appointment is rejected/cancelled, decrement schedule booked_slots? (optional logic here)
            if ($validated['status'] === 'rejected' && $appointment->schedule) {
                $appointment->schedule->decrement('booked_slots');
                if ($appointment->schedule->booked_slots < $appointment->schedule->capacity) {
                    $appointment->schedule->update(['status' => 'active']);
                }
            }

            return response()->json(['message' => 'Appointment status updated successfully', 'appointment' => $appointment]);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation Error', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update appointment status', 'error' => $e->getMessage()], 500);
        }
    }

    // Service Provider Module: List appointments ready to be marked as completed
    public function getAppointmentsReadyToComplete(Request $request)
    {
        // Simple auth check. Use middleware/policy for production.
        if (Auth::check() && Auth::user()->role !== 'service_provider' && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        $providerId = $request->user()->id;
        $appointments = Appointment::where('provider_id', $providerId) // Only appointments assigned to this provider
                                  ->where('status', 'approved') // Only approved ones can be completed
                                  ->whereDate('preferred_date', '<=', now()->toDateString()) // On or before today
                                  ->get();
        // Eager load user for display
        $appointments->load('user');

        return response()->json($appointments);
    }

    // Service Provider Module: Mark service as completed
    public function markAppointmentAsCompleted(Appointment $appointment)
    {
        // Simple auth check. Use middleware/policy for production.
        if (Auth::check() && Auth::user()->role !== 'service_provider' && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        // Ensure the provider is assigned to this appointment (if provider_id exists)
        if ($appointment->provider_id && $appointment->provider_id !== Auth::id()) {
             return response()->json(['message' => 'Unauthorized to complete this appointment'], 403);
        }

        try {
            $appointment->update(['status' => 'completed']);
            return response()->json(['message' => 'Appointment marked as completed', 'appointment' => $appointment]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to mark appointment as completed', 'error' => $e->getMessage()], 500);
        }
    }
}