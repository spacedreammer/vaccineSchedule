<?php

namespace App\Http\Controllers;

use App\Models\HealthContent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class HealthContentController extends Controller
{
    // Admin/Health Officer: List all health content
    public function index()
    {
        // Simple auth check. Use middleware/policy for production.
        if (Auth::check() && Auth::user()->role !== 'health_officer' && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        $contentItems = HealthContent::with('uploader')->get();
        return response()->json($contentItems);
    }

    // Admin/Health Officer: Create new health content
    public function store(Request $request)
    {
        // Simple auth check. Use middleware/policy for production.
        if (Auth::check() && Auth::user()->role !== 'health_officer' && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        try {
            $validatedData = $request->validate([
                'title' => 'required|string|max:255',
                'content' => 'required|string',
                'type' => 'required|string|in:article,video,infographic',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048', // For image upload
                'video_url' => 'nullable|url|max:255', // For video links
            ]);

            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = Storage::url($request->file('image')->store('health_content_images', 'public'));
            }

            $contentItem = HealthContent::create([
                'uploaded_by_user_id' => Auth::id(),
                'title' => $validatedData['title'],
                'content' => $validatedData['content'],
                'type' => $validatedData['type'],
                'image_url' => $imagePath,
                'video_url' => $validatedData['video_url'] ?? null,
            ]);

            return response()->json(['message' => 'Content uploaded successfully', 'content' => $contentItem], 201);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation Error', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to upload content', 'error' => $e->getMessage()], 500);
        }
    }

    // Admin/Health Officer: Update existing health content
    public function update(Request $request, HealthContent $contentItem)
    {
        // Simple auth check. Use middleware/policy for production.
        if (Auth::check() && Auth::user()->role !== 'health_officer' && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        // Optional: Only allow uploader or admin to edit
        if ($contentItem->uploaded_by_user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized to update this content'], 403);
        }

        try {
            $validatedData = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'content' => 'sometimes|required|string',
                'type' => 'sometimes|required|string|in:article,video,infographic',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048', // For new image upload
                'video_url' => 'nullable|url|max:255', // For video links
                // Optional: flag to remove existing image if 'image' is null but no new file is uploaded
                'remove_image' => 'nullable|boolean',
            ]);

            // Handle image update/removal
            $imagePath = $contentItem->image_url;
            if ($request->hasFile('image')) {
                // Delete old image if new one is uploaded
                if ($contentItem->image_url) {
                    Storage::disk('public')->delete(str_replace(Storage::url(''), '', $contentItem->image_url));
                }
                $imagePath = Storage::url($request->file('image')->store('health_content_images', 'public'));
            } elseif ($request->has('remove_image') && $request->boolean('remove_image')) {
                // Remove existing image if explicitly requested and no new file uploaded
                if ($contentItem->image_url) {
                    Storage::disk('public')->delete(str_replace(Storage::url(''), '', $contentItem->image_url));
                }
                $imagePath = null;
            }

            $contentItem->update([
                'title' => $validatedData['title'] ?? $contentItem->title,
                'content' => $validatedData['content'] ?? $contentItem->content,
                'type' => $validatedData['type'] ?? $contentItem->type,
                'image_url' => $imagePath,
                'video_url' => $validatedData['video_url'] ?? $contentItem->video_url,
            ]);

            return response()->json(['message' => 'Content updated successfully', 'content' => $contentItem]);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation Error', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update content', 'error' => $e->getMessage()], 500);
        }
    }

    // Admin/Health Officer: Delete health content
    public function destroy(HealthContent $contentItem)
    {
        // Simple auth check. Use middleware/policy for production.
        if (Auth::check() && Auth::user()->role !== 'health_officer' && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        // Optional: Only allow uploader or admin to delete
        if ($contentItem->uploaded_by_user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized to delete this content'], 403);
        }

        try {
            // Delete associated image file from storage
            if ($contentItem->image_url) {
                Storage::disk('public')->delete(str_replace(Storage::url(''), '', $contentItem->image_url));
            }

            $contentItem->delete();
            return response()->json(['message' => 'Content deleted successfully'], 204);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete content', 'error' => $e->getMessage()], 500);
        }
    }

    // Public/User Module: View content (no auth required, or specific user auth)
    public function showAllPublicContent()
    {
        $content = HealthContent::orderBy('created_at', 'desc')->get();
        return response()->json($content);
    }
}