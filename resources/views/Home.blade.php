@extends('layouts.app')

@push('styles')
<link rel="stylesheet" href="{{ asset('css/home.css') }}">
@endpush

@section('content')

<div class="wrapper">

    @include('partials.logo')

    @include('partials.buttons')

</div>

@endsection