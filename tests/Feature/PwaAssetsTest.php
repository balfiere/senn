<?php

it('has a web manifest', function () {
    expect(file_exists(public_path('manifest.webmanifest')))->toBeTrue();
});

it('has pwa icon assets', function () {
    expect(file_exists(public_path('icons/icon-192.svg')))->toBeTrue();
    expect(file_exists(public_path('icons/icon-512.svg')))->toBeTrue();
    expect(file_exists(public_path('icons/icon-512-maskable.svg')))->toBeTrue();
});
