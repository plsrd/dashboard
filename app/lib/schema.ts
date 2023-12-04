import { type } from 'os';
import { z } from 'zod';

const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: 'Please enter a name.' }).max(50),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  image: z
    .any()
    .refine((file) => file?.size > 1, 'Please upload an image.')
    .refine((file) => file?.size <= 50000000, `Max file size is 5mb`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      'Only .jpg, .jpeg, .png and .webp formats are supported.',
    ),
});
