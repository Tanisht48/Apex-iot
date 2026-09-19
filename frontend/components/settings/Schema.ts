// schemas.ts
import { z } from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input';
// Define a schema for a User entity
export const UserSchema = z.object({
  Name: z.string().min(1, "User name is required"),
  Phone: z.string().nonempty("Phone is required"),
  Email: z.string().optional().refine(
    (email) => email ? /.+@.+\..+/.test(email) : true,
    { message: 'Invalid email format' }
  ),
  AccessRole: z.string().optional()
});



export const userFormSchema = z.object({
    Name: z.string().min(2, { message: 'Organisation name must be at least 2 characters.' }).max(50, {
      message: 'Organisation name must be less than 50 characters.',
    }),
    UserType: z.string().refine((value) => value === 'User' || value === 'Admin', {
      message: 'Invalid user type.',
    }),
    Phone: z.string().refine((value) => isValidPhoneNumber(value), {
      message: 'Invalid phone number.',
    }),
    OrgID: z.string(),
    Email: z
      .string()
      .optional()
      .refine((email) => (email ? /.+@.+\..+/.test(email) : true), {
        message: 'Invalid email format',
      }),
  });

  const isValidDate = (dateString: string) => {
    return !isNaN(Date.parse(dateString));
  };
  
  export const deviceFormSchema = z.object({
    device_id: z.string().optional(), // Optional string for device ID
    org_id: z.string().optional(),
    shop_open_time: z
      .string()
      .optional()
      .refine((value) => (value ? /^((0[1-9]|1[0-2]):([0-5]\d)\s?(AM|PM))|^([01]\d|2[0-3]):([0-5]\d)$/.test(value) : true), {
        message: 'Invalid time format, expected HH:MM AM/PM or HH:MM', // Validates both 12-hour and 24-hour formats
      }),
    shop_close_time: z
      .string()
      .optional()
      .refine((value) => (value ? /^((0[1-9]|1[0-2]):([0-5]\d)\s?(AM|PM))|^([01]\d|2[0-3]):([0-5]\d)$/.test(value) : true), {
        message: 'Invalid time format, expected HH:MM AM/PM or HH:MM', // Validates both 12-hour and 24-hour formats
      }),
});
  
  
  
  
  
  
  
  