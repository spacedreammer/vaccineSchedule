<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HealthContent extends Model
{
    use HasFactory;

    protected $fillable = [
        'uploaded_by_user_id',
        'title',
        'content',
        'type',
        'image_url',
        'video_url',
    ];

    protected $casts = [
        'type' => \App\Enums\ContentTypeEnum::class, // Optional: Use a PHP Enum
    ];

    // Relationship to the user (admin/health officer) who uploaded it
    public function uploader(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by_user_id');
    }
}