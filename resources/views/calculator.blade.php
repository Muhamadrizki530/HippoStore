@extends('layouts.app')

@push('styles')
<link rel="stylesheet" href="{{ asset('css/calculator.css') }}?v={{ filemtime(public_path('css/calculator.css')) }}">
@endpush

@section('content')

<div class="wrapper">

    @include('partials.logo')

    <a href="{{ url('/') }}" class="calc-back">
        <i class="bi bi-arrow-left"></i> Kembali ke Home
    </a>

    <div class="calc-title">PRICE CALCULATOR</div>
    <p class="calc-subtitle">Hitung estimasi harga joki rank Mobile Legends</p>

    <div class="calc-tabs">
        <div class="calc-tab active" data-mode="gendong">JOKI GENDONG</div>
        <div class="calc-tab" data-mode="akun">JOKI AKUN</div>
    </div>

    <div class="calc-card">

        <div class="calc-group">
            <label class="calc-label">Rank Sekarang</label>
            <div class="calc-row">
                <select id="fromTier" class="calc-select"></select>
                <select id="fromStar" class="calc-select"></select>
            </div>
        </div>

        <div class="calc-group">
            <label class="calc-label">Rank Tujuan</label>
            <div class="calc-row">
                <select id="toTier" class="calc-select"></select>
                <select id="toStar" class="calc-select"></select>
            </div>
        </div>

        <button type="button" class="calc-btn" onclick="hitungHarga()">HITUNG HARGA</button>

    </div>

    <div class="calc-result" id="calcResult">
        <div class="calc-result-label">Estimasi Harga</div>
        <div class="calc-result-price" id="resultPrice">Rp 0</div>
        <div class="calc-result-stars" id="resultStars"></div>
    </div>

    <div class="calc-list" id="calcList">
        {{-- diisi otomatis oleh calculator.js --}}
    </div>

</div>

@push('scripts')
<script src="{{ asset('js/calculator.js') }}?v={{ filemtime(public_path('js/calculator.js')) }}"></script>
@endpush

@endsection