<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\SalaryRecord;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function index(): Response
    {
        $employees = Employee::with('user')->withCount('salaryRecords')
            ->orderBy('name')
            ->get()
            ->map(fn ($e) => [
                'id'                   => $e->id,
                'user_id'              => $e->user_id,
                'user_name'            => $e->user?->name,
                'name'                 => $e->name,
                'position'             => $e->position,
                'phone'                => $e->phone,
                'base_salary'          => (float) $e->base_salary,
                'hire_date'            => $e->hire_date?->format('M d, Y'),
                'is_active'            => $e->is_active,
                'salary_records_count' => $e->salary_records_count,
            ]);

        $summary = [
            'total'   => $employees->count(),
            'active'  => $employees->where('is_active', true)->count(),
            'monthly' => $employees->where('is_active', true)->sum('base_salary'),
        ];

        // Users not yet linked to any employee
        $linkedUserIds = Employee::whereNotNull('user_id')->pluck('user_id');
        $availableUsers = User::whereNotIn('id', $linkedUserIds)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('employees/index', [
            'employees'      => $employees,
            'summary'        => $summary,
            'available_users' => $availableUsers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id'     => 'nullable|exists:users,id|unique:employees,user_id' . (request()->route('employee') ? (',' . request()->route('employee')->id) : ''),
            'name'        => 'required|string|max:255',
            'position'    => 'required|string|max:255',
            'phone'       => 'nullable|string|max:20',
            'address'     => 'nullable|string',
            'hire_date'   => 'nullable|date',
            'base_salary' => 'required|numeric|min:0',
            'is_active'   => 'boolean',
            'notes'       => 'nullable|string',
        ]);

        Employee::create($validated);
        return back()->with('success', 'Employee added.');
    }

    public function update(Request $request, Employee $employee): RedirectResponse
    {
        $validated = $request->validate([
            'user_id'     => 'nullable|exists:users,id|unique:employees,user_id' . (request()->route('employee') ? (',' . request()->route('employee')->id) : ''),
            'name'        => 'required|string|max:255',
            'position'    => 'required|string|max:255',
            'phone'       => 'nullable|string|max:20',
            'address'     => 'nullable|string',
            'hire_date'   => 'nullable|date',
            'base_salary' => 'required|numeric|min:0',
            'is_active'   => 'boolean',
            'notes'       => 'nullable|string',
        ]);

        $employee->update($validated);
        return back()->with('success', 'Employee updated.');
    }

    public function destroy(Employee $employee): RedirectResponse
    {
        $employee->delete();
        return back()->with('success', 'Employee deleted.');
    }

    public function show(Employee $employee): Response
    {
        $records = $employee->salaryRecords()
            ->with('processor')
            ->orderByDesc('period_year')
            ->orderByDesc('period_month')
            ->get()
            ->map(fn ($r) => [
                'id'             => $r->id,
                'period_label'   => $r->period_label,
                'period_month'   => $r->period_month,
                'period_year'    => $r->period_year,
                'base_salary'    => (float) $r->base_salary,
                'bonus'          => (float) $r->bonus,
                'deductions'     => (float) $r->deductions,
                'net_salary'     => (float) $r->net_salary,
                'payment_date'   => $r->payment_date?->format('M d, Y'),
                'payment_method' => $r->payment_method,
                'status'         => $r->status,
                'notes'          => $r->notes,
                'processed_by'   => $r->processor?->name,
            ]);

        $totalPaid = $records->where('status', 'paid')->sum('net_salary');

        return Inertia::render('employees/show', [
            'employee' => [
                'id'          => $employee->id,
                'name'        => $employee->name,
                'position'    => $employee->position,
                'phone'       => $employee->phone,
                'address'     => $employee->address,
                'hire_date'   => $employee->hire_date?->format('M d, Y'),
                'base_salary' => (float) $employee->base_salary,
                'is_active'   => $employee->is_active,
                'notes'       => $employee->notes,
            ],
            'salary_records' => $records,
            'total_paid'     => $totalPaid,
            'months'         => SalaryRecord::$months,
        ]);
    }

    // Add / update a salary record for an employee
    public function storeSalary(Request $request, Employee $employee): RedirectResponse
    {
        $validated = $request->validate([
            'period_month'   => 'required|integer|min:1|max:12',
            'period_year'    => 'required|integer|min:2020|max:2099',
            'base_salary'    => 'required|numeric|min:0',
            'bonus'          => 'nullable|numeric|min:0',
            'deductions'     => 'nullable|numeric|min:0',
            'payment_date'   => 'nullable|date',
            'payment_method' => 'required|in:cash,gcash,bank',
            'status'         => 'required|in:pending,paid',
            'notes'          => 'nullable|string',
        ]);

        $base       = (float) $validated['base_salary'];
        $bonus      = (float) ($validated['bonus'] ?? 0);
        $deductions = (float) ($validated['deductions'] ?? 0);
        $net        = $base + $bonus - $deductions;

        SalaryRecord::updateOrCreate(
            [
                'employee_id'  => $employee->id,
                'period_month' => $validated['period_month'],
                'period_year'  => $validated['period_year'],
            ],
            array_merge($validated, [
                'employee_id'  => $employee->id,
                'bonus'        => $bonus,
                'deductions'   => $deductions,
                'net_salary'   => $net,
                'processed_by' => auth()->id(),
            ])
        );

        return back()->with('success', 'Salary record saved.');
    }

    public function destroySalary(SalaryRecord $salaryRecord): RedirectResponse
    {
        $salaryRecord->delete();
        return back()->with('success', 'Salary record deleted.');
    }
}
