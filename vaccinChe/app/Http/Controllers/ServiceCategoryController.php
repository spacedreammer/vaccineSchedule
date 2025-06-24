<?php

namespace App\Http\Controllers;

use App\Models\Vaccine_categories;
use App\Models\VaccineCategory; // Renamed from ServiceCategory to VaccineCategory
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class ServiceCategoryController extends Controller
{
    // System Admin: List all service categories
    public function index()
    {
        // Simple auth check. Use middleware/policy for production.
        if (Auth::check() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }
        $categories = Vaccine_categories::all();
        return response()->json($categories);
    }

    // System Admin: Create new service category
    public function store(Request $request)
    {
        // Simple auth check. Use middleware/policy for production.
        if (Auth::check() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255|unique:vaccine_categories,name',
                'description' => 'nullable|string|max:1000',
                'is_active' => 'boolean', // Optional, default is true in migration
            ]);

            $category = Vaccine_categories::create($validatedData);
            return response()->json(['message' => 'Category created successfully', 'category' => $category], 201);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation Error', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create category', 'error' => $e->getMessage()], 500);
        }
    }

    // System Admin: Update service category
    public function update(Request $request, Vaccine_categories $category)
    {
        // Simple auth check. Use middleware/policy for production.
        if (Auth::check() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        try {
            $validatedData = $request->validate([
                'name' => 'sometimes|required|string|max:255|unique:vaccine_categories,name,' . $category->id,
                'description' => 'nullable|string|max:1000',
                'is_active' => 'sometimes|boolean',
            ]);

            $category->update($validatedData);
            return response()->json(['message' => 'Category updated successfully', 'category' => $category]);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation Error', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update category', 'error' => $e->getMessage()], 500);
        }
    }

    // System Admin: Delete service category
    public function destroy(Vaccine_categories $category)
    {
        // Simple auth check. Use middleware/policy for production.
        if (Auth::check() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        try {
            $category->delete();
            return response()->json(['message' => 'Category deleted successfully'], 204);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete category', 'error' => $e->getMessage()], 500);
        }
    }
}