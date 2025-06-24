<?php

namespace App\Enums;

enum ContentTypeEnum: string
{
    case Article = 'article';
    case Video = 'video';
    case Infographic = 'infographic';
}