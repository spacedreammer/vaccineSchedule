<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AppointmentController extends Controller
{
    public function schedule(Request $request)
    {
        try {
            // Validate the incoming request data
            $validatedData = $request->validate([
                'childName' => 'required|string|max:255',
                'vaccineType' => 'required|string|max:255',
                'appointmentDate' => 'required|date|after_or_equal:today', // Ensures date is today or in the future
                'appointmentTime' => 'required|date_format:H:i',           // Validates time format (e.g., 14:30)
            ]);

            // Create the appointment in the database
            $appointment = Appointment::create([
                'user_id' => Auth::id(), // Get the ID of the currently authenticated user
                'child_name' => $validatedData['childName'],
                'vaccine_type' => $validatedData['vaccineType'],
                'appointment_date' => $validatedData['appointmentDate'],
                'appointment_time' => $validatedData['appointmentTime'],
                'status' => 'Pending', // Set default status for new appointments
            ]);

            // Return a success response with the created appointment data
            return response()->json([
                'message' => 'Appointment scheduled successfully!',
                'appointment' => $appointment,
            ], 201); // 201 Created status code for successful resource creation

        } catch (ValidationException $e) {
            // Handle validation errors
            return response()->json([
                'message' => 'Validation Failed',
                'errors' => $e->errors()
            ], 422); // 422 Unprocessable Entity for validation errors
        } catch (\Exception $e) {
            // Handle any other unexpected errors
            return response()->json([
                'message' => 'An error occurred while scheduling the appointment.',
                'error' => $e->getMessage()
            ], 500); // 500 Internal Server Error for general exceptions
        }
    }

    /**
     * Retrieve all vaccination appointments for the authenticated user.
     * This method handles the GET request to fetch a patient's appointments.
     *
     */
    public function myAppointments()
    {
        try {
            // Check if a user is authenticated
            if (!Auth::check()) {
                return response()->json(['message' => 'Unauthenticated.'], 401); // Unauthorized
            }

            // Get appointments associated with the authenticated user, ordered by date and time
            $appointments = Auth::user()->appointments()
                ->orderBy('appointment_date', 'asc')
                ->orderBy('appointment_time', 'asc')
                ->get();

            // Return the list of appointments
            return response()->json($appointments);
        } catch (\Exception $e) {
            // Handle any unexpected errors during data retrieval
            return response()->json([
                'message' => 'An error occurred while fetching appointments.',
                'error' => $e->getMessage()
            ], 500); // 500 Internal Server Error
        }
    }

    /**
     * Display a specific vaccination appointment.
     * This method fetches a single appointment by its ID, ensuring it belongs to the authenticated user.
     *
    
     */
    public function show($id)
    {
        try {
            if (!Auth::check()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            $appointment = Auth::user()->appointments()->find($id);

            if (!$appointment) {
                return response()->json(['message' => 'Appointment not found or not authorized.'], 404); // Not Found
            }

            return response()->json($appointment);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while retrieving the appointment.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing vaccination appointment.
     * This method handles the PUT/PATCH request to update an appointment, ensuring it belongs to the authenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id The ID of the appointment to update.
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        try {
            if (!Auth::check()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            $appointment = Auth::user()->appointments()->find($id);

            if (!$appointment) {
                return response()->json(['message' => 'Appointment not found or not authorized.'], 404);
            }

            // Validate the incoming request data for update
            $validatedData = $request->validate([
                'childName' => 'sometimes|required|string|max:255',
                'vaccineType' => 'sometimes|required|string|max:255',
                'appointmentDate' => 'sometimes|required|date|after_or_equal:today',
                'appointmentTime' => 'sometimes|required|date_format:H:i',
                'status' => 'sometimes|required|in:Pending,Confirmed,Completed,Cancelled', // Status can be updated by admin or specific logic
            ]);

            $appointment->update($validatedData);

            return response()->json([
                'message' => 'Appointment updated successfully!',
                'appointment' => $appointment,
            ], 200); // 200 OK for successful update

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while updating the appointment.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove a vaccination appointment from storage.
     * This method handles the DELETE request to remove an appointment, ensuring it belongs to the authenticated user.
     *
     * @param  int  $id The ID of the appointment to delete.
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            if (!Auth::check()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            $appointment = Auth::user()->appointments()->find($id);

            if (!$appointment) {
                return response()->json(['message' => 'Appointment not found or not authorized.'], 404);
            }

            $appointment->delete();

            return response()->json(['message' => 'Appointment deleted successfully!'], 200); // 200 OK for successful deletion

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while deleting the appointment.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
