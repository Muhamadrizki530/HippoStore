<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return 'HOME TEST';
});

Route::get('/calculator', function () {
    return view('calculator');
});