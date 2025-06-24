<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use App\Models\Appointment; // To link feedback to an appointment
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class FeedbackController extends Controller
{
    // Method to authorize roles
    protected function authorizeRole(array $roles)
    {
        $userRole = Auth::user()->role ?? null;
        if (!in_array($userRole, $roles)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return null;
    }
    // User Module: Submit feedback
    public function store(Request $request)
    {
        try {
            $user = $request->user();

            $validatedData = $request->validate([
                'appointment_id' => 'required|exists:appointments,id',
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'nullable|string|max:1000',
            ]);

            // Ensure the user is giving feedback for their own completed appointment
            $appointment = Appointment::where('id', $validatedData['appointment_id'])
                                        ->where('user_id', $user->id)
                                        ->where('status', 'completed') // Only allow feedback for completed appointments
                                        ->first();

            if (!$appointment) {
                return response()->json(['message' => 'Appointment not found or not completed by this user.'], 403);
            }

            // Prevent duplicate feedback for the same appointment
            if (Feedback::where('appointment_id', $validatedData['appointment_id'])->exists()) {
                return response()->json(['message' => 'Feedback already submitted for this appointment.'], 409);
            }

            $feedback = Feedback::create([
                'user_id' => $user->id,
                'appointment_id' => $validatedData['appointment_id'],
                'provider_id' => $appointment->provider_id, // Link to the provider who performed service
                'rating' => $validatedData['rating'],
                'comment' => $validatedData['comment'] ?? null,
            ]);

            return response()->json(['message' => 'Feedback submitted successfully', 'feedback' => $feedback], 201);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation Error', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to submit feedback', 'error' => $e->getMessage()], 500);
        }
    }

    // Service Provider Module: View feedback received
    public function myFeedback(Request $request)
    {
        $authCheck = $this->authorizeRole(['service_provider', 'admin']);
        if ($authCheck) return $authCheck;

        $providerId = $request->user()->id;
        $feedbacks = Feedback::where('provider_id', $providerId)
                            ->with('user', 'appointment') // Eager load user who gave feedback, and the appointment
                            ->orderBy('created_at', 'desc')
                            ->get();

        return response()->json($feedbacks);
    }
}