<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required_without:user_id', 'nullable', 'string', 'email'],
            'password' => ['required_without:pin', 'nullable', 'string'],
            'user_id' => ['required_without:email', 'nullable', 'exists:users,id'],
            'pin' => ['required_without:password', 'nullable', 'string', 'digits:6'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $authenticated = false;

        if ($this->has('email') && $this->filled('email')) {
            $authenticated = Auth::attempt($this->only('email', 'password'), $this->boolean('remember'));
        } elseif ($this->has('user_id') && $this->filled('pin')) {
            $user = \App\Models\User::find($this->user_id);
            if ($user && \Illuminate\Support\Facades\Hash::check($this->pin, $user->pin)) {
                Auth::login($user, $this->boolean('remember'));
                $authenticated = true;
            }
        }

        if (!$authenticated) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => $this->has('email') ? trans('auth.failed') : 'PIN yang Anda masukkan salah.',
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        $identifier = $this->filled('email') ? $this->string('email') : $this->string('user_id');
        return Str::transliterate(Str::lower($identifier).'|'.$this->ip());
    }
}
