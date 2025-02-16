import AddInvoicre from '@/components/AddInvoice'
import DashboardLayout from '@/Layout/Provider/DashboardLayout'
import React from 'react'

const Invoice = () => {
  return (
    <DashboardLayout>
        <div className='flex justify-end items-center py-3'>
            <AddInvoicre />
        </div>
    </DashboardLayout>
  )
}

export default Invoice