<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'fname',
        'lname',
        'phone',
        'email',
        'password',
        'role',
        'profile_picture', // Added 'profile_picture'
        'license_number', 
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }


     // --- Relationships ---

    // A user can have many appointments (as a patient)
    public function appointments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Appointment::class, 'user_id');
    }

    // A user can be a service provider for many appointments
    public function providedAppointments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Appointment::class, 'provider_id');
    }

    // A health officer user can create many schedules
    public function schedulesCreated(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Schedule::class, 'health_officer_id');
    }

    // A user can upload many health content items (if they are admin/health officer)
    public function uploadedContent(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(HealthContent::class, 'uploaded_by_user_id');
    }

    // A user can submit many feedbacks
    public function feedbacksGiven(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Feedback::class, 'user_id');
    }

    // A user can receive many feedbacks (if they are a service provider)
    public function feedbacksReceived(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Feedback::class, 'provider_id');
    }

    // public function appointments()
    // {
    //     return $this->hasMany(Appointment::class);
    // }

}
