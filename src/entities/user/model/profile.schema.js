import { z } from 'zod'

// why: E.164 international format — optional leading "+", 7-15 digits — so numbers
// from any country (not just VN's 10-11 digit local format) pass validation. Strip
// formatting (spaces, dashes, parentheses, dots) before checking so "+1 (881) 291-8051"
// normalizes to "+18812918051" instead of failing on the punctuation.
const phoneField = z
  .string()
  .transform((value) => value.replace(/[\s().-]/g, ''))
  .refine(
    (value) => /^\+?[0-9]{7,15}$/.test(value),
    'Enter a valid phone number (optionally starting with +)',
  )

export const profileInfoSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(15, 'Name cannot exceed 15 characters'),
  phone: phoneField.or(z.literal('')),
})

export const reviewProfileSchema = z.object({
  reviewDisplayName: z
    .string()
    .trim()
    .max(30, 'Public review name cannot exceed 30 characters'),
})

const postalCodePatterns = {
  VN: /^\d{5}$/,
  US: /^\d{5}(?:-\d{4})?$/,
  CA: /^[A-Z]\d[A-Z][ -]?\d[A-Z]\d$/i,
  GB: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
  AU: /^\d{4}$/,
  SG: /^\d{6}$/,
}

export const profileAddressSchema = z
  .object({
    fullName: z.string().trim().min(1, 'Full name is required').max(100),
    phone: phoneField,
    street: z.string().trim().min(1, 'Street is required').max(300),
    ward: z.string().trim().max(100).optional().default(''),
    district: z.string().trim().max(100).optional().default(''),
    city: z.string().trim().min(1, 'City is required').max(100),
    postalCode: z
      .string()
      .trim()
      .max(12)
      .nullish()
      .transform((value) => value?.toUpperCase() ?? ''),
    countryCode: z.enum(['VN', 'US', 'CA', 'GB', 'AU', 'SG']).default('VN'),
  })
  .superRefine(({ postalCode, countryCode, ward, district }, context) => {
    if (countryCode === 'VN') {
      for (const [field, value] of [
        ['ward', ward],
        ['district', district],
      ]) {
        if (!value)
          context.addIssue({
            code: 'custom',
            path: [field],
            message: `${field === 'ward' ? 'Ward' : 'District'} is required`,
          })
      }
    }
    if (postalCode && !postalCodePatterns[countryCode].test(postalCode)) {
      context.addIssue({
        code: 'custom',
        path: ['postalCode'],
        message: `Enter a valid postal code for ${countryCode}`,
      })
    }
  })
