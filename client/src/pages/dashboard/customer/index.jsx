import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DataTable from 'react-data-table-component';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, UserPlus, Download, Filter, Edit, Trash2, Phone, ServerIcon } from 'lucide-react';
import DashboardLayout from '@/Layout/Provider/DashboardLayout';

import { toast } from '@/hooks/use-toast';
import { useDeleteCustomerMutation, useGetAllCustomerQuery } from '@/redux/services/customerApi';

const Customer = () => {
    const router = useRouter();
    const [filterText, setFilterText] = useState('');

    const { data: customer, isLoading } = useGetAllCustomerQuery();

    const [deletemutation] = useDeleteCustomerMutation()

    useEffect(() => {
        console.log(customer);
    }, [customer]);

    const columns = [
        {
            name: 'Customer',
            cell: row => (
                <div className="flex items-center gap-3 py-2">
                    <div>
                        <p className="font-medium">{row.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{row.email}</span>
                        </div>
                    </div>
                </div>
            ),
            sortable: true,
        },
        {
            name: 'Service',
            cell: row => (
                <div className="flex items-center gap-2">
                    <ServerIcon className="w-4 h-4 text-gray-400" />
                    <span>{row?.service}</span>
                </div>
            ),
        },
        {
            name: 'Status',
            cell: row => (
                <div className={`px-3 py-1 rounded-full text-sm ${row.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {row.status}
                </div>
            ),
            sortable: true,
        },
        {
            name: 'Orders',
            cell: row => (
                <div>
                    <p className="font-medium">{row.totalOrders}</p>
                    <p className="text-sm text-gray-500">Last: {row.lastOrder}</p>
                </div>
            ),
            sortable: true,
        },
        {
            name: 'Total Spent',
            cell: row => (
                <div className="font-medium">${row.totalSpent.toLocaleString()}</div>
            ),
            sortable: true,
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="flex items-center gap-2">
                    <Button onClick={()=>handleNavigate(row?.id)} variant="ghost" size="icon" className="hover:bg-gray-100">
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDelete(row?.id)} variant="ghost" size="icon" className="hover:bg-red-100 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ];


    const handleNavigate = (id) => {
        router.push(`/dashboard/customer/${id}`)
    }


    const handleDelete = async (id) => {

        console.log(id)


        if (window.confirm("Are you sure you want to delete this customer?")) {
            try {
                await deletemutation({id}).unwrap();
                toast({
                    title: "Customer Delete",
                    description: "Success",
                });
            } catch (error) {
                console.error("Error deleting customer:", error);
                toast({
                    title: "Customer Delete",
                    description: "Error",
                    variant:"destructive"
                });
            }
        }
    };


    const customStyles = {
        headRow: {
            style: {
                backgroundColor: '#F9FAFB',
                borderBottom: '1px solid #E5E7EB',
            },
        },
        headCells: {
            style: {
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#4B5563',
                paddingLeft: '1rem',
                paddingRight: '1rem',
            },
        },
        cells: {
            style: {
                paddingLeft: '1rem',
                paddingRight: '1rem',
            },
        },
    };

    const customerData = customer?.map(cust => ({
        id: cust._id,
        name: cust.name,
        email: cust.email,
        phone: cust.phone,
        service: cust?.service?.serviceName,
        status: 'Active',
        lastOrder: new Date(cust.createdAt).toLocaleDateString(),
        totalOrders: 0,
        totalSpent: 0,
    })) || [];

    const filteredData = customerData.filter(
        item =>
            item.name.toLowerCase().includes(filterText.toLowerCase()) ||
            item.email.toLowerCase().includes(filterText.toLowerCase()) ||
            item.phone.includes(filterText)
    );

    return (
        <DashboardLayout>
            <Card className="shadow-sm">
                <CardHeader className="border-b bg-white">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <CardTitle>Customer Management</CardTitle>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search customers..."
                                    value={filterText}
                                    onChange={e => setFilterText(e.target.value)}
                                    className="pl-9 w-full sm:w-[300px]"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" className="flex items-center gap-2">
                                    <Filter className="w-4 h-4" />
                                    Filter
                                </Button>
                                <Button variant="outline" className="flex items-center gap-2">
                                    <Download className="w-4 h-4" />
                                    Export
                                </Button>
                                <Button onClick={() => router.push("/dashboard/customer/add-customer")} className="flex items-center gap-2">
                                    <UserPlus className="w-4 h-4" />
                                    Add Customer
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <DataTable
                        columns={columns}
                        data={filteredData}
                        customStyles={customStyles}
                        pagination
                        highlightOnHover
                        pointerOnHover
                        responsive
                        progressPending={isLoading} // Show loader when loading
                    />
                </CardContent>
            </Card>
        </DashboardLayout>
    );
};

export default Customer;
