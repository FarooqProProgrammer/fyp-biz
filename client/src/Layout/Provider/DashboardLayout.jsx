import { AppSidebar } from '@/components/app-sidebar'
import Header from '@/components/Header'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'

const DashboardLayout = ({ children }) => {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className='w-full'>
                <Header />
                <div className='w-full p-3'>
                    {children}
                </div>
            </main>
        </SidebarProvider>
    )
}

export default DashboardLayout
