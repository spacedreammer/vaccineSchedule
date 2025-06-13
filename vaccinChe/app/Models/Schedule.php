<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'health_officer_id',
        'title',
        'description',
        'date',
        'time',
        'location',
        'capacity',
        'booked_slots',
        'vaccine_category_id',
        'status',
    ];

    protected $casts = [
        'date' => 'date',
        'time' => 'datetime:H:i', // Casts time to HH:MM format
        'capacity' => 'integer',
        'booked_slots' => 'integer',
        'status' => \App\Enums\ScheduleStatusEnum::class, // Optional: Use a PHP Enum
    ];

    // Relationship to the health officer who created this schedule
    public function healthOfficer(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'health_officer_id');
    }

    // A schedule can have many appointments
    public function appointments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    // Relationship to the vaccine category
    public function vaccineCategory(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Vaccine_categories::class);
    }
}