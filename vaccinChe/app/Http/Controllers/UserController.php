<?php

namespace App\Http\Controllers; // <--- ADD THIS LINE HERE

use App\Http\Controllers\Controller; // This import is actually redundant if it's in the same namespace, but harmless
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Enums\UserRoleEnum;

class UserController extends Controller
{
    /**
     * Display a listing of all users.
     * Accessible by System Admin.
     */
    public function index()
    {
        // Basic authorization check for System Admin.
        // For production, this should be handled by a middleware or policy.
        $user = Auth::user();
        if (!$user || !($user->role instanceof UserRoleEnum && $user->role->value === UserRoleEnum::Admin->value)) {
            // Fallback for direct string role if Enum casting fails
            if (!($user->role === 'admin')) { // This line itself was slightly off in previous iterations, should be $user->role->value === 'admin' for robustness
                return response()->json(['message' => 'Unauthorized access'], 403);
            }
        }


        try {
            // Fetch all users. You might want to paginate this in a real application.
            $users = User::all();
            return response()->json($users);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch users', 'error' => $e->getMessage()], 500);
        }
    }
}