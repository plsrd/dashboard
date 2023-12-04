'use server';

import { v4 as uuid } from 'uuid';
import path from 'path';
import { writeFile } from 'fs/promises';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { FormSchema, CustomerSchema } from './schema';
import { InvoiceState, CustomerState } from './definitions';
import {
  generateAmountInCents,
  generateDate,
  validate,
  uploadImage,
} from './utils';

const InvoiceFormSchema = FormSchema.omit({ id: true, date: true });
const CustomerFormSchema = CustomerSchema.omit({ id: true });

export async function createInvoice(
  prevState: InvoiceState,
  formData: FormData,
) {
  const { success, data, error } = validate(InvoiceFormSchema, formData);

  if (!success) {
    return {
      errors: error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const { customerId, amount, status } = data;

  try {
    await sql`
      insert into invoices (customer_id, amount, status, date)
      values (${customerId}, ${generateAmountInCents(
        amount,
      )}, ${status}, ${generateDate()})
    `;
  } catch (e) {
    return {
      message: 'Database Error: Failed to Create Invoice',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function createCustomer(
  prevState: CustomerState,
  formData: FormData,
) {
  const { success, data, error } = validate(CustomerFormSchema, formData);

  if (!success) {
    return {
      errors: error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Customer.',
    };
  }

  const { name, email, image } = data;

  const image_url = await uploadImage(image, name);

  const id = uuid();

  if (!image_url)
    return {
      errors: { image: ['Failed to upload image.'] },
      message: 'Missing Fields. Failed to Create Customer.',
    };

  try {
    await sql`
        insert into customers (id, name, email, image_url)
        values (${id}, ${name}, ${email}, ${image_url})
      `;
  } catch (e) {
    return {
      message: 'Database Error: Failed to Create Customer',
    };
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

export async function updateInvoice(
  id: string,
  prevState: InvoiceState,
  formData: FormData,
) {
  const { success, data, error } = validate(InvoiceFormSchema, formData);

  if (!success) {
    return {
      errors: error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const { customerId, amount, status } = data;

  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${generateAmountInCents(
        amount,
      )}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (e) {
    return {
      message: 'Database Error: Failed to Update Invoice',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice' };
  } catch (e) {
    return {
      message: 'Database Error: Failed to Delete Invoice',
    };
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { message: 'Invalid credentials.' };
        default:
          return { message: 'Something went wrong.' };
      }
    }
  }
}
