import { Suspense } from 'react';
import { lusitana } from '@/app/ui/fonts';
import { Metadata } from 'next';
import Search from '@/app/ui/search';
import { CreateButton } from '@/app/ui/invoices/buttons';
import Table from '@/app/ui/customers/table';
import { InvoicesTableSkeleton as CustomerTableSkeleton } from '@/app/ui/skeletons';

export const metadata: Metadata = {
  title: 'Customers',
};

export default async function Page() {
  return (
    <div className="w-full">
      <h1 className={`${lusitana.className} mb-8 text-xl md:text-2xl`}>
        Customers
      </h1>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search customers..." />
        <CreateButton path="customers" />
      </div>

      <Suspense fallback={<CustomerTableSkeleton />}>
        <Table />
      </Suspense>
    </div>
  );
}
