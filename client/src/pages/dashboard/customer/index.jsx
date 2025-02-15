import { Button } from '@/components/ui/button'
import DashboardLayout from '@/Layout/Provider/DashboardLayout'
import { useRouter } from 'next/router'
import React from 'react'

const Customer = () => {

    const router = useRouter();


  return (
    <DashboardLayout>
        <div className='flex justify-end items-end'>
            <Button onClick={()=>router.push("/dashboard/customer/add-customer")}>Add Customer</Button>
        </div>
    </DashboardLayout>
  )
}

export default Customer
