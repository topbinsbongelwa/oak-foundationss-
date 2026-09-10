"use client";

import React, { useState } from "react";
import {
  AttendeeRegistration,
  FormErrors,
  ROLE_OPTIONS,
} from "../lib/types";
import { registerAttendee as registerAttendeeInSupabase } from "../lib/attendees";
import { saveAttendeeToStorage } from "../lib/utils";

interface RegistrationFormProps {
  onSuccess: (attendee: AttendeeRegistration) => void;
}

export default function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    organisation: "",
    subPartner: "",
    role: "",
    email: "",
    phone: "",
    dietary: "",
    accessibility: "",
    travel: "",
    consentAgreed: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    if (!formData.organisation.trim()) {
      newErrors.organisation = "Organisation is required";
    }

    if (!formData.role) {
      newErrors.role = "Please select your role / capacity";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (!formData.consentAgreed) {
      newErrors.consentAgreed =
        "You must consent to the privacy policy and data usage to complete registration";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (submitError) setSubmitError(null);

    // Clear error for that field if it exists
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      window.scrollTo({ top: 320, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const data = await registerAttendeeInSupabase({
        full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim().toLowerCase(),
        organization: formData.organisation.trim(),
        role: formData.role,
        phone: formData.phone.trim() || undefined,
      });

      const newAttendee: AttendeeRegistration = {
        id: data.id,
        passCode: data.pass_code,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        organisation: formData.organisation.trim(),
        subPartner: formData.subPartner.trim() || undefined,
        role: formData.role,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        dietary: formData.dietary.trim() || undefined,
        accessibility: formData.accessibility.trim() || undefined,
        travel: formData.travel.trim() || undefined,
        consentAgreed: formData.consentAgreed,
        registeredAt: new Date().toISOString(),
      };

      saveAttendeeToStorage(newAttendee);
      onSuccess(newAttendee);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";
      if (message.includes("23505") || message.includes("duplicate")) {
        setSubmitError("This email is already registered.");
      } else {
        setSubmitError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
      <div className="border-b border-gray-100 pb-5 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Registration Form
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Complete the form below to confirm your attendance and generate your unique QR entrance pass.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {submitError && (
          <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm font-medium flex items-start gap-2">
            <span>⚠</span>
            <span>{submitError}</span>
          </div>
        )}

        {/* Name Fields: 2 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
            >
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="e.g. Maria"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
                errors.firstName
                  ? "border-red-400 focus:ring-red-200 bg-red-50/20"
                  : "border-gray-300 focus:ring-blue-100 focus:border-[#0F223D]"
              }`}
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                <span>⚠</span> {errors.firstName}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
            >
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="e.g. Schmidt"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
                errors.lastName
                  ? "border-red-400 focus:ring-red-200 bg-red-50/20"
                  : "border-gray-300 focus:ring-blue-100 focus:border-[#0F223D]"
              }`}
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                <span>⚠</span> {errors.lastName}
              </p>
            )}
          </div>
        </div>

        {/* Organisation */}
        <div>
          <label
            htmlFor="organisation"
            className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
          >
            Organisation <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="organisation"
            name="organisation"
            value={formData.organisation}
            onChange={handleChange}
            placeholder="Your organisation name"
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
              errors.organisation
                ? "border-red-400 focus:ring-red-200 bg-red-50/20"
                : "border-gray-300 focus:ring-blue-100 focus:border-[#0F223D]"
            }`}
          />
          {errors.organisation && (
            <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
              <span>⚠</span> {errors.organisation}
            </p>
          )}
        </div>

        {/* Sub-Partner / Programme Area */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="subPartner"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider"
            >
              Sub-Partner / Programme Area
            </label>
            <span className="text-xs text-gray-400">Optional</span>
          </div>
          <input
            type="text"
            id="subPartner"
            name="subPartner"
            value={formData.subPartner}
            onChange={handleChange}
            placeholder="e.g. Climate Justice / Youth Tech"
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0F223D] transition-all"
          />
        </div>

        {/* Role / Capacity */}
        <div>
          <label
            htmlFor="role"
            className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
          >
            Role / Capacity <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer ${
                errors.role
                  ? "border-red-400 focus:ring-red-200 bg-red-50/20"
                  : "border-gray-300 focus:ring-blue-100 focus:border-[#0F223D]"
              } ${!formData.role ? "text-gray-400" : "text-gray-900"}`}
            >
              <option value="" disabled>
                Select your role
              </option>
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="text-gray-900">
                  {opt}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {errors.role && (
            <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
              <span>⚠</span> {errors.role}
            </p>
          )}
        </div>

        {/* Contact Info: Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@organisation.org"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
                errors.email
                  ? "border-red-400 focus:ring-red-200 bg-red-50/20"
                  : "border-gray-300 focus:ring-blue-100 focus:border-[#0F223D]"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                <span>⚠</span> {errors.email}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="phone"
                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider"
              >
                Phone Number
              </label>
              <span className="text-xs text-gray-400">Optional</span>
            </div>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+263 xx xxx xxxx / +41 xx"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0F223D] transition-all"
            />
          </div>
        </div>

        {/* Requirements Section */}
        <div className="pt-4 border-t border-gray-100 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Requirements
          </h3>

          {/* Dietary Requirements */}
          <div>
            <label
              htmlFor="dietary"
              className="block text-xs font-semibold text-gray-700 mb-1"
            >
              Dietary Requirements
            </label>
            <input
              type="text"
              id="dietary"
              name="dietary"
              value={formData.dietary}
              onChange={handleChange}
              placeholder="e.g. Vegetarian, Halal, Gluten free"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0F223D] transition-all"
            />
          </div>

          {/* Accessibility Requirements */}
          <div>
            <label
              htmlFor="accessibility"
              className="block text-xs font-semibold text-gray-700 mb-1"
            >
              Accessibility Requirements
            </label>
            <input
              type="text"
              id="accessibility"
              name="accessibility"
              value={formData.accessibility}
              onChange={handleChange}
              placeholder="e.g. Wheelchair access, hearing loop"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0F223D] transition-all"
            />
          </div>

          {/* Travel & Accommodation */}
          <div>
            <label
              htmlFor="travel"
              className="block text-xs font-semibold text-gray-700 mb-1"
            >
              Travel &amp; Accommodation
            </label>
            <input
              type="text"
              id="travel"
              name="travel"
              value={formData.travel}
              onChange={handleChange}
              placeholder="e.g. Flight from London, hotel needed"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0F223D] transition-all"
            />
          </div>
        </div>

        {/* Required Consent Checkbox */}
        <div className="pt-3">
          <div
            className={`p-3.5 rounded-xl border transition-colors ${
              errors.consentAgreed
                ? "border-red-300 bg-red-50/50"
                : "border-gray-200 bg-gray-50/80"
            }`}
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="consentAgreed"
                checked={formData.consentAgreed}
                onChange={handleChange}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#0F223D] focus:ring-[#0F223D] transition-colors cursor-pointer"
              />
              <span className="text-xs text-gray-700 leading-relaxed select-none">
                I agree to <span className="font-semibold text-gray-900">OAK Foundation&apos;s privacy policy</span> and consent to my registration data being used for event coordination and entrance verification.
              </span>
            </label>
          </div>
          {errors.consentAgreed && (
            <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
              <span>⚠</span> {errors.consentAgreed}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-[#0F223D] hover:bg-[#1A365D] active:bg-[#0A1628] text-white text-sm sm:text-base font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Generating Entry Pass &amp; QR Code...</span>
              </>
            ) : (
              <span>Register &amp; Generate QR Code</span>
            )}
          </button>
        </div>

        {/* GDPR / Privacy Statement Notice */}
        <div className="text-center pt-2 flex items-center justify-center gap-1.5 text-xs text-gray-500">
          <svg
            className="w-3.5 h-3.5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>
            Your data is secured and handled by OAK Foundation in accordance with GDPR.
          </span>
        </div>
      </form>
    </div>
  );
}
