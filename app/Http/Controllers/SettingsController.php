<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('settings-business/index', [
            'settings' => Setting::all_settings(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'business_address' => 'nullable|string|max:500',
            'business_phone' => 'nullable|string|max:50',
            'business_email' => 'nullable|email|max:255',
            'receipt_footer' => 'nullable|string|max:500',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'currency' => 'nullable|string|max:10',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set($key, $value ?? '');
        }

        return back()->with('success', 'Settings saved successfully.');
    }
}
