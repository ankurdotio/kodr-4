import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export default function PasswordField({ value, onChange, required = true, minLength }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        autoComplete="current-password"
        className="w-full rounded-md border border-[#d8ded8] bg-white px-3.5 py-3 pr-12 text-sm text-[var(--ink)] placeholder:text-[#9aa29b] transition focus:border-[var(--green)] focus:outline-none"
        id="password"
        minLength={minLength}
        name="password"
        onChange={onChange}
        placeholder="Enter your password"
        required={required}
        type={visible ? 'text' : 'password'}
        value={value}
      />
      <button
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute inset-y-0 right-0 grid w-11 place-items-center text-[#737d75] hover:text-[var(--ink)]"
        onClick={() => setVisible(!visible)}
        type="button"
      >
        {visible ? <EyeOff size={17} strokeWidth={1.8} /> : <Eye size={17} strokeWidth={1.8} />}
      </button>
    </div>
  )
}