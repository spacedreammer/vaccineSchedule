<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    
    public function listPatients()
    {
        
        $patients = User::where('role', 'patient')->get();

        return response()->json([
            "message" => "Patients listed successfully",
            "users" => $patients
        ]);
    }
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (!$token = Auth::attempt($credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }
        return response()->json([
            'message' => 'Logged in successfully',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => Auth::factory()->getTTL() * 60,
        ]);
    }

    public function register(Request $request)
    {
        $formFields = $request->validate([
            'fname' => 'required|string|max:255',
            'lname' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:6',
            'role'     => 'nullable|in:patient,healthOff,serviceProvider, systemAdmin',

        ]);

        $formFields['password'] = bcrypt($formFields['password']);

        $user = User::create($formFields);
        $token = Auth::login($user);

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
            'expires_in' => Auth::factory()->getTTL() * 60, // Token expiration time in seconds
        ]);
    }

    public function userProfile()
    {
        return response()->json([
            'id' => Auth::id(),
            'fname' => Auth::user()->fname,
            'lname' => Auth::user()->lname,
            'email' => Auth::user()->email,
            'role' => Auth::user()->role,
            'phone' => Auth::user()->phone,
        ]);
    }

    public function listServeceProvider()
    {
        $serveceProvider = User::where('role', 'serviceProvider')->get();
        return response()->json($serveceProvider);
    }

    public function listHelthOff()
    {
        $healthOff = User::where('role', 'healthOff')->get();
        return response()->json($healthOff);
    }

    public function logout()
    {
        Auth::logout();
        return response()->json(['message' => 'Logged out successfully']);
    }


    public function editUser(Request $request, $id)
    {


        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        // Validate the request data

        $formFields = $request->validate([
            'fname' => 'required',
            'lname' => 'required',
            'email' => 'required|email',
            'password' => ['nullable', 'min:6'],
            'role'     => 'required|in:patient,healthOff,serviceProvider,systemAdmin',
            'phone'    => 'nullable|string',
        ]);
        $user->fname = $formFields['fname'];
        $user->lname = $formFields['lname'];
        $user->email = $formFields['email'];
        $user->phone = $formFields['phone'] ?? $user->phone;
        $user->role  = $formFields['role'];

        if (isset($formFields['password'])  && !empty($formFields['password'])) {
            // Hash the password before saving
            $user->password = bcrypt($formFields['password']);
        }

        $user->save();

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user->id,
            'fname' => $user->fname,
            'email' => $user->email
        ]);
    }

    public function showUser($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        return response()->json($user);
    }

    public function deleteUser($id)
    {

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }
}
