<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',          // Foreign key to link to the user (patient)
        'child_name',       // Name of the child for the appointment
        'vaccine_type',     // Type of vaccine scheduled
        'appointment_date', // Date of the appointment
        'appointment_time', // Time of the appointment
        'status',           // Current status of the appointment (Pending, Confirmed, Completed, Cancelled)
    ];

    
   
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
