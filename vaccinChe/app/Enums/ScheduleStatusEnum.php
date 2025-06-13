<?php

namespace App\Enums;

enum ScheduleStatusEnum: string
{
    case Active = 'active';
    case Full = 'full';
    case Cancelled = 'cancelled';
}