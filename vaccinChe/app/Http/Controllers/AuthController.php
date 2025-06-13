<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            $formFields = $request->validate([
                'fname' => 'required|string|max:255',
                'lname' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'phone' => 'nullable|string|max:20', // Changed to nullable based on migration
                'password' => 'required|string|min:6', // Added 'confirmed' for password_confirmation
                'role' => 'required|string|in:patient,admin,health_officer,service_provider',
            ]);

            $formFields['password'] = Hash::make($formFields['password']);

            $user = User::create($formFields);
            $token = Auth::login($user);

            return response()->json([
                'message' => 'User registered successfully',
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'Bearer',
                'expires_in' => Auth::factory()->getTTL() * 60,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation Error', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'User registration failed', 'error' => $e->getMessage()], 500);
        }
    }

    public function login(Request $request)
    {
        try {
            $credentials = $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            if (!$token = Auth::attempt($credentials)) {
                return response()->json(['error' => 'Unauthorized: Invalid credentials'], 401);
            }

            // Get the authenticated user with their role for JWT claims
            $user = Auth::user();

            return response()->json([
                'message' => 'Logged in successfully',
                'user' => $user, // Return user data for frontend convenience
                'access_token' => $token,
                'token_type' => 'Bearer',
                'expires_in' => Auth::factory()->getTTL() * 60,
            ]);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation Error', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Login failed', 'error' => $e->getMessage()], 500);
        }
    }

    public function logout()
    {
        Auth::logout();
        return response()->json(['message' => 'Successfully logged out']);
    }

    // public function refresh()
    // {
    //     return $this->respondWithToken(Auth::refresh());
    // }

    public function userProfile()
    {
        // Auth::user() is available because this route will be under 'auth:sanctum' middleware
        return response()->json(Auth::user());
    }

    public function showUser($id)
    {
        // This method fetches a user by ID, typically for System Admin to view/edit
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        return response()->json($user);
    }

    public function editUser(Request $request, $id)
    {
        try {
            $user = User::find($id);
            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }

            // Authorization check: Only current user or Admin can update this profile
            if (Auth::id() !== $user->id && Auth::user()->role !== 'admin') {
                return response()->json(['message' => 'Unauthorized to update this user'], 403);
            }

            $formFields = $request->validate([
                'fname' => 'sometimes|required|string|max:255',
                'lname' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $user->id, // Exclude current user's email
                'phone' => 'nullable|string|max:20',
                'password' => 'nullable|string|min:6|confirmed', // Optional password update
                'role' => 'sometimes|required|string|in:patient,admin,health_officer,service_provider', // Role can be updated by Admin
                'profile_picture' => 'nullable|string|max:255', // Assuming URL
                'license_number' => 'nullable|string|max:255',
            ]);

            if (isset($formFields['password'])) {
                $formFields['password'] = Hash::make($formFields['password']);
            }

            $user->update($formFields);

            return response()->json([
                'message' => 'User updated successfully',
                'user' => $user->fresh(), // Return fresh user data
            ]);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation Error', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update user', 'error' => $e->getMessage()], 500);
        }
    }

    public function deleteUser($id)
    {
        try {
            $user = User::find($id);
            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }

            // Authorization check: Only Admin can delete users (or user self-deletes)
            // You might want to prevent admin from deleting themselves
            if (Auth::user()->role !== 'admin' && Auth::id() !== $user->id) {
                return response()->json(['message' => 'Unauthorized to delete this user'], 403);
            }
             if (Auth::id() === $user->id) {
                 return response()->json(['message' => 'Cannot delete your own active account through this endpoint. Please use logout.'], 403);
             }


            $user->delete();

            return response()->json(['message' => 'User deleted successfully'], 204); // 204 No Content for successful DELETE
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete user', 'error' => $e->getMessage()], 500);
        }
    }
}